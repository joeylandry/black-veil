import type { WorkbenchResult, WorkbenchService } from "@/components/bench/bench-lab";

/** Client half of the desks. Grading and console replay happen in /api/desk/[ticket]. */
export const deskService: WorkbenchService = {
  async run(ticket, history) {
    const response = await fetch(`/api/desk/${ticket}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "run", history }),
    });
    const body = await response.json().catch(() => null);
    if (!response.ok) throw new Error(body?.error || "The desk did not respond.");
    return (body as { output: string[] }).output;
  },

  async submit(ticket, submission) {
    const response = await fetch(`/api/desk/${ticket}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "submit", ...submission }),
    });
    const body = await response.json().catch(() => null);
    if (!response.ok) throw new Error(body?.error || "The desk could not grade that submission.");
    return body as WorkbenchResult;
  },
};
