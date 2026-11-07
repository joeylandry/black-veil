import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ExhibitDocument } from "@/components/exhibit/exhibit-document";
import { FindingForm } from "@/components/file/finding-form";
import { SimWorkbench } from "@/components/sim/workbench";
import { getExhibitForWeek } from "@/data/case/exhibits";
import { getSprint } from "@/data/case/sprints";
import { getBenchLab } from "@/data/bench";
import { findingKey, getMemberProgress, getViewer, simulationKey } from "@/lib/case/file";
import { weekOpensAt } from "@/lib/case/release";
import { formatBostonDateTime } from "@/lib/case/format";
import { siteConfig } from "@/config/site";

function parseWeek(value: string) {
  const week = Number(value);
  return Number.isInteger(week) && week >= 1 && week <= siteConfig.weeks ? week : null;
}

export async function generateMetadata({ params }: PageProps<"/file/[week]">): Promise<Metadata> {
  const week = parseWeek((await params).week);
  return { title: week ? `Week ${String(week).padStart(2, "0")}` : "Not in the file" };
}

export default async function WeekPage({ params }: PageProps<"/file/[week]">) {
  const week = parseWeek((await params).week);
  if (!week) notFound();

  const viewer = await getViewer();
  const label = String(week).padStart(2, "0");

  if (week > viewer.weeks) {
    const opensAt = viewer.run ? weekOpensAt(viewer.run, week) : null;
    return (
      <div className="sealed-page">
        <p className="eyebrow">Week {label}</p>
        <h1>Still sealed</h1>
        <p>
          {opensAt
            ? `Exhibit 245-${label} unseals ${formatBostonDateTime(opensAt)}, for every room at once.`
            : viewer.member
              ? "Your room isn't on a schedule yet. Staff will open it."
              : "Join the file with your room's access code to read the exhibits as they unseal."}
        </p>
        <p>
          <Link href={viewer.member ? "/file" : "/join"} className="button">
            {viewer.member ? "Back to the file" : "Join the file"}
          </Link>
        </p>
      </div>
    );
  }

  const exhibit = getExhibitForWeek(week)!;
  const sprint = getSprint(week)!;
  const lab = sprint.simulation.labId ? getBenchLab(sprint.simulation.labId) : undefined;
  const progress = viewer.member ? await getMemberProgress(viewer.member.id).catch(() => null) : null;
  const key = findingKey(week);
  const wrong = progress?.wrongByKey.get(key) ?? 0;

  return (
    <div className="week-page">
      <nav className="week-crumbs" aria-label="Exhibits">
        <Link href="/file">← The file</Link>
        <span>
          {week > 1 && <Link href={`/file/${week - 1}`}>Week {String(week - 1).padStart(2, "0")}</Link>}
          {week < viewer.weeks && <Link href={`/file/${week + 1}`}>Week {String(week + 1).padStart(2, "0")} →</Link>}
        </span>
      </nav>

      <header className="week-header">
        <p className="eyebrow">
          Week {label} · {exhibit.number}
        </p>
        <h1>{exhibit.title}</h1>
        <p className="week-summary">{exhibit.summary}</p>
      </header>

      <div className="week-grid">
        <div className="week-doc">
          <ExhibitDocument exhibit={exhibit} />
        </div>

        <div className="week-side">
          <section className="panel finding" aria-labelledby="finding-title">
            <h2 id="finding-title">The finding</h2>
            <FindingForm
              week={week}
              prompt={exhibit.finding.prompt}
              help={exhibit.finding.help}
              canAnswer={Boolean(viewer.member)}
              initial={{
                answered: progress?.solved.has(key) ?? false,
                remaining: Math.max(0, siteConfig.findingAttempts - wrong),
              }}
              points={siteConfig.findingPoints}
            />
          </section>

          <section className="panel work-order" aria-labelledby="wo-title">
            <p className="eyebrow">Restoration work order {sprint.workOrder}</p>
            <h2 id="wo-title">{sprint.simulation.title}</h2>
            <p className="wo-damage">
              <strong>Condition of the scan:</strong> {exhibit.damage}
            </p>
            <p>{sprint.simulation.pretext}</p>
            {!lab && <p className="mark mark-quiet">The simulation arrives with this sprint.</p>}
          </section>
        </div>
      </div>

      {lab && (
        <section className="sim-section" aria-label="Simulation">
          <SimWorkbench lab={lab} week={week} workOrder={sprint.workOrder} solved={progress?.solved.has(simulationKey(week)) ?? false} />
        </section>
      )}
    </div>
  );
}
