import Link from "next/link";

export default function NotFound() {
  return (
    <main id="main-content" className="gate">
      <div className="gate-screen">
        <p>FILE 245 · LOOKUP FAILED</p>
        <p>&nbsp;</p>
        <p>No record at this address.</p>
        <p>Some pages were never filed. Some were taken.</p>
        <p>&nbsp;</p>
        <p>
          <Link href="/file">&gt; return to the file</Link>
        </p>
      </div>
    </main>
  );
}
