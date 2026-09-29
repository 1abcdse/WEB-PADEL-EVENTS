import { dayLabel, weekLabel } from "@/lib/format";
import type { PublicMatch } from "@/lib/public-api";
import { SiteHeader } from "./SiteHeader";
import type { LinkComponent } from "./types";

export const addDays = (date: string, n: number) => {
  const d = new Date(`${date}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};
export const mondayOf = (date: string) => addDays(date, -((new Date(`${date}T12:00:00Z`).getUTCDay() + 6) % 7));

export function AgendaView({
  week,
  matches,
  divisionNames,
  Link,
}: {
  week: string;
  matches: PublicMatch[];
  divisionNames: Map<string, string>;
  Link: LinkComponent;
}) {
  const byDay = new Map<string, PublicMatch[]>();
  for (const m of matches) byDay.set(m.booking!.date, [...(byDay.get(m.booking!.date) ?? []), m]);
  const days = [...byDay.keys()].sort();
  return (
    <main className="page">
      <SiteHeader title="Agenda" subtitle={`Setmana ${weekLabel(week)}`} Link={Link} />
      <nav className="week-nav">
        <Link className="btn" href={`/agenda?setmana=${addDays(week, -7)}`}>
          ← Anterior
        </Link>
        <Link className="btn" href={`/agenda?setmana=${addDays(week, 7)}`}>
          Següent →
        </Link>
      </nav>
      {days.length === 0 && <p className="card muted">Encara no hi ha cap partit confirmat aquesta setmana.</p>}
      {days.map((day) => (
        <section key={day}>
          <h2 className="section-title">{dayLabel(day)}</h2>
          <div className="card">
            <ul className="match-list">
              {byDay
                .get(day)!
                .sort((a, b) => (a.booking!.start + a.booking!.court).localeCompare(b.booking!.start + b.booking!.court))
                .map((m) => (
                  <li key={m.id}>
                    <div>
                      <strong>
                        {m.booking!.start} · Pista {m.booking!.court}
                      </strong>{" "}
                      <span className="small muted">· {divisionNames.get(m.divisionId)}</span>
                    </div>
                    <div>
                      {m.entryA.name} <span className="muted">vs</span> {m.entryB.name}
                    </div>
                  </li>
                ))}
            </ul>
          </div>
        </section>
      ))}
    </main>
  );
}
