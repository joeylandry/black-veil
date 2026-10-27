/**
 * Runs a pair's JavaScript in a throwaway Web Worker, so a mistake (or an infinite loop)
 * can never freeze the lab page. The worker is created per run and terminated after.
 */

export type CodeTestResult = { name: string; pass: boolean; got: string; expected: string };
export type CodeRun = { error?: string; results: CodeTestResult[] };

const workerSource = `
const canonical = (value) => {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === "object") {
    return Object.keys(value).sort().reduce((out, key) => { out[key] = canonical(value[key]); return out; }, {});
  }
  return value;
};
const show = (value) => value === undefined ? "undefined" : JSON.stringify(canonical(value));
self.onmessage = (event) => {
  const { source, fnName, tests } = event.data;
  let fn;
  try {
    fn = new Function(source + "\\n;return typeof " + fnName + " === 'function' ? " + fnName + " : undefined;")();
  } catch (error) {
    self.postMessage({ error: "Syntax error: " + error.message, results: [] });
    return;
  }
  if (!fn) {
    self.postMessage({ error: "Define a function named " + fnName + ".", results: [] });
    return;
  }
  const results = tests.map((test) => {
    try {
      const got = fn(...structuredClone(test.args));
      return { name: test.name, pass: show(got) === show(test.expect), got: show(got), expected: show(test.expect) };
    } catch (error) {
      return { name: test.name, pass: false, got: "threw " + (error && error.message ? error.message : String(error)), expected: show(test.expect) };
    }
  });
  self.postMessage({ results });
};
`;

export function runInWorker(source: string, fnName: string, tests: { name: string; args: unknown[]; expect: unknown }[], timeoutMs = 2000): Promise<CodeRun> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(new Blob([workerSource], { type: "text/javascript" }));
    const worker = new Worker(url);
    const finish = (run: CodeRun) => {
      window.clearTimeout(timer);
      worker.terminate();
      URL.revokeObjectURL(url);
      resolve(run);
    };
    const timer = window.setTimeout(() => finish({ error: `Stopped after ${timeoutMs / 1000}s — is there an infinite loop?`, results: [] }), timeoutMs);
    worker.onmessage = (event: MessageEvent<CodeRun>) => finish(event.data);
    worker.onerror = (event) => {
      event.preventDefault();
      finish({ error: event.message || "The code could not run.", results: [] });
    };
    worker.postMessage({ source, fnName, tests });
  });
}
