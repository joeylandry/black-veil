import Link from "next/link";
import type { Metadata } from "next";
import { exhibits } from "@/data/case/exhibits";
import { sprints } from "@/data/case/sprints";
import { findingKey, getMemberProgress, getTeamRoster, getViewer, shortName, simulationKey } from "@/lib/case/file";
import { weekOpensAt } from "@/lib/case/release";
import { formatBostonDateTime } from "@/lib/case/format";
import { siteConfig } from "@/config/site";
import { docket } from "@/data/case/docket";
import { personsOfInterest, records } from "@/data/case/records";
import Image from "next/image";

const formatDocketDate = (date: Date) =>
  date.toLocaleDateString("en-US", { timeZone: "America/New_York", month: "short", day: "numeric", year: "numeric" }).replace(/^(\w{3})/, "$1.");

export const metadata: Metadata = { title: "The file" };

export default async function FilePage() {
  const viewer = await getViewer();
  const open = viewer.weeks;
  const released = exhibits.filter((exhibit) => exhibit.week <= open);
  const progress = viewer.member ? await getMemberProgress(viewer.member.id).catch(() => null) : null;
  const roster = viewer.member?.teamId ? await getTeamRoster(viewer.member.teamId).catch(() => []) : [];
  const nextWeek = open < siteConfig.weeks ? open + 1 : null;
  const nextAt = viewer.run && nextWeek ? weekOpensAt(viewer.run, nextWeek) : null;

  return (
    <div className="file-page">
      <section className="jacket typed" aria-labelledby="jacket-title">
        <div className="jacket-top">
          <p className="jacket-class">Highly confidential</p>
          <p className="jacket-no">Case file No. {siteConfig.fileNumber}</p>
        </div>
        <div className="jacket-re">
          <span className="typed-label" aria-hidden="true">
            Re:
          </span>
          <div>
            <h1 id="jacket-title" className="jacket-title">
              <span className="typed-under">The Black Toad</span>
            </h1>
            <ul className="jacket-sub">
              <li>245 Summer Street massacre, 1924</li>
              <li>Disappearance of proprietress Cassandra Castello, 1924</li>
              <li>Death of the Keeper, 1926</li>
            </ul>
          </div>
        </div>

        <section className="docket" aria-labelledby="docket-title">
          <h2 id="docket-title" className="docket-title">
            Notes:
          </h2>
          <ol className="docket-list">
            {docket.map((line) => (
              <li key={line.date}>
                <span className="docket-date">{line.date}</span>
                <span>{line.entry}</span>
              </li>
            ))}
            <li className="docket-latest">
              <span className="docket-date">{viewer.run ? formatDocketDate(viewer.run.week1At) : siteConfig.reopenedOn}</span>
              <span>Reopened for restoration and review. Access by authorization only.</span>
            </li>
          </ol>
        </section>
      </section>

      <section className="poi typed" aria-labelledby="poi-title">
        <h2 id="poi-title" className="typed-heading">
          Persons of interest:
        </h2>
        <ul className="poi-list">
          {personsOfInterest.map((person) => (
            <li key={person.name} className="poi-card">
              <div className="poi-photo">
                {person.photo ? (
                  <Image src={person.photo} alt={`Photograph of ${person.name}`} width={240} height={300} sizes="120px" />
                ) : (
                  <span>No photograph on file</span>
                )}
              </div>
              <div className="poi-body">
                <p className="poi-name">{person.name}</p>
                <p className="poi-role">{person.role}</p>
                <p className="poi-status">{person.status}</p>
                {person.recordSlug && <Link href={`/file/record/${person.recordSlug}`}>Missing persons report</Link>}
              </div>
            </li>
          ))}
        </ul>

        <h2 className="typed-heading">Also in the file:</h2>
        <ul className="records-list">
          {records.map((record) => (
            <li key={record.slug}>
              <span className="docket-date">{record.filed ?? record.dated}</span>
              <span>
                <Link href={`/file/record/${record.slug}`}>{record.title}</Link>. {record.summary}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {viewer.problem && (
        <p className="notice notice-warn" role="alert">
          {viewer.problem}
        </p>
      )}

      <div className="file-grid">
        <section className="panel briefing" aria-labelledby="briefing-title">
          <h2 id="briefing-title">Read this first</h2>
          <p>
            In March 1926 a Boston judge sealed every paper about one death for a hundred years. The seal ran out on{" "}
            {siteConfig.unsealedOn}. The box has been opened, scanned and put here, and it is in rough shape.
          </p>
          <p>
            You are one of the people reading it now: part reporter, part technologist. You will read what the city was not allowed to read in 1926, and
            you will do the restoration work that makes each damaged scan readable.
          </p>
          <ul className="rules">
            <li>
              <strong>One exhibit a week, for ten weeks.</strong> Each one arrives with that week&apos;s simulation, the restoration work order for its scan.
            </li>
            <li>
              <strong>Everyone opens it at the same moment.</strong> Every room in the program gets the same exhibit at the same time. Nobody sees ahead.
            </li>
            <li>
              <strong>Each exhibit asks one question.</strong> The answer is in the exhibit&apos;s own text. You get {siteConfig.findingAttempts} tries.
            </li>
            <li>
              <strong>You work as a team.</strong> A team&apos;s score is the average of its members&apos; points, so everyone&apos;s work counts the same.
            </li>
            <li>
              <strong>Read closely.</strong> Everything you need is in the file.
            </li>
          </ul>
        </section>

        <aside className="panel status" aria-labelledby="status-title">
          <h2 id="status-title">Your desk</h2>
          {viewer.member ? (
            <>
              <dl className="status-list">
                <div>
                  <dt>Reader</dt>
                  <dd>{viewer.member.fullName}</dd>
                </div>
                <div>
                  <dt>Room</dt>
                  <dd>{viewer.member.locationName ?? "Not placed yet"}</dd>
                </div>
                <div>
                  <dt>Team</dt>
                  <dd>{viewer.member.teamName ?? "Assigned soon"}</dd>
                </div>
                <div>
                  <dt>Your points</dt>
                  <dd>{progress?.points ?? 0}</dd>
                </div>
                <div>
                  <dt>Open</dt>
                  <dd>
                    Week {open} of {siteConfig.weeks}
                  </dd>
                </div>
              </dl>
              {nextAt && (
                <p className="status-next">
                  Exhibit {String(nextWeek).padStart(2, "0")} unseals {formatBostonDateTime(nextAt)}.
                </p>
              )}
              <Link href="/board" className="button">
                See the board
              </Link>
            </>
          ) : viewer.staff ? (
            <p>Staff preview: all ten weeks are open to you. Readers only see what their run has reached.</p>
          ) : (
            <>
              <p>Your room has an access code. Use it to join the file and see the exhibits as they unseal.</p>
              <Link href="/join" className="button">
                Join with an access code
              </Link>
              <p className="small">
                Already joined on another device? <Link href="/sign-in">Sign in by email</Link>.
              </p>
            </>
          )}
        </aside>
      </div>

      {released.length > 0 && (
        <section className="panel notes" aria-labelledby="notes-title">
          <h2 id="notes-title">What the file says so far</h2>
          <ol className="notes-list">
            {released.flatMap((exhibit) =>
              exhibit.notes.map((note, index) => (
                <li key={`${exhibit.slug}-${index}`}>
                  {note} <Link href={`/file/${exhibit.week}`}>{exhibit.number.replace("Exhibit ", "")}</Link>
                </li>
              )),
            )}
          </ol>
        </section>
      )}

      <section className="index" aria-labelledby="index-title">
        <h2 id="index-title">The exhibits</h2>
        <ol className="index-list">
          {sprints.map((sprint) => {
            const exhibit = exhibits.find((item) => item.week === sprint.week)!;
            const isOpen = sprint.week <= open;
            const opensAt = viewer.run ? weekOpensAt(viewer.run, sprint.week) : null;
            const answered = progress?.solved.has(findingKey(sprint.week));
            const restored = progress?.solved.has(simulationKey(sprint.week));
            return (
              <li key={sprint.week} className={isOpen ? "index-item is-open" : "index-item is-sealed"}>
                <span className="index-week">Week {String(sprint.week).padStart(2, "0")}</span>
                {isOpen ? (
                  <Link href={`/file/${sprint.week}`} className="index-body">
                    <span className="index-title">{exhibit.title}</span>
                    <span className="index-summary">{exhibit.summary}</span>
                    <span className="index-marks">
                      {answered ? <span className="mark mark-done">Finding answered</span> : <span className="mark">Finding open</span>}
                      {sprint.simulation.labId ? (
                        restored ? (
                          <span className="mark mark-done">Restored</span>
                        ) : (
                          <span className="mark">Simulation open</span>
                        )
                      ) : (
                        <span className="mark mark-quiet">Simulation arrives with this sprint</span>
                      )}
                    </span>
                  </Link>
                ) : (
                  <span className="index-body">
                    <span className="index-title">
                      <span className="redacted" style={{ width: "12em" }} aria-label="sealed">
                        {" "}
                      </span>
                    </span>
                    <span className="index-summary">{opensAt ? `Unseals ${formatBostonDateTime(opensAt)}` : "Sealed"}</span>
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </section>

      {released.some((exhibit) => exhibit.persons.length) && (
        <section className="panel persons" aria-labelledby="persons-title">
          <h2 id="persons-title">Named in the file</h2>
          <ul className="persons-list">
            {released.flatMap((exhibit) =>
              exhibit.persons.map((person) => (
                <li key={`${exhibit.slug}-${person.name}`}>
                  <p className="person-name">{person.name}</p>
                  <p className="person-role">{person.role}</p>
                  <p className="person-note">{person.note}</p>
                </li>
              )),
            )}
          </ul>
        </section>
      )}

      {viewer.member?.teamId && roster.length > 0 && (
        <section className="panel team" aria-labelledby="team-title">
          <h2 id="team-title">Team {viewer.member.teamName}</h2>
          <ul className="team-list">
            {roster.map((mate) => (
              <li key={mate.id} className={mate.id === viewer.member?.id ? "is-you" : undefined}>
                <span>{mate.id === viewer.member?.id ? `${shortName(mate.fullName)} (you)` : shortName(mate.fullName)}</span>
                <span>{mate.points} pts</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
