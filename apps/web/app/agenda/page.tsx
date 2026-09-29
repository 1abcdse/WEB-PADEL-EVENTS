import Link from "next/link";
import { dayLabel, weekLabel } from "@/lib/format";
import { currentCompetition, divisionName, publicGet, type PublicMatch } from "@/lib/public-api";
import { SiteHeader, Unavailable } from "../SiteHeader";

export const dynamic = "force-dynamic";

const addDays = (date: string, n: number) => {
  const d = new Date(`${date}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};
const mondayOf = (date: string) => addDays(date, -((new Date(`${date}T12:00:00Z`).getUTCDay() + 6) % 7));
const today = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Madrid" }).format(new Date());

export default async function AgendaPage({ searchParams }: { searchParams: Promise<{ setmana?: string }> }) {
  const { setmana } = await searchParams;
  let comp, matches: PublicMatch[], week: string;
  try {
    comp = await currentCompetition();
    if (!comp) throw new Error("no competition");
    const requested = setmana && /^\d{4}-\d{2}-\d{2}$/.test(setmana) ? mondayOf(setmana) : mondayOf(today());
    week = requested < comp.first_week ? comp.first_week : requested;
    matches = await publicGet<PublicMatch[]>(`/competitions/${comp.id}/agenda?week=${week}`);
  } catch {
    return (
      <main className="page">
        <SiteHeader title="Agenda" />
        <Unavailable />
      </main>
    );
  }
  const divisions = new Map(comp.divisions.map((d) => [d.division_id, divisionName(d)]));
  const byDay = new Map<string, PublicMatch[]>();
  for (const m of matches) byDay.set(m.booking!.date, [...(byDay.get(m.booking!.date) ?? []), m]);
  const days = [...byDay.keys()].sort();

  return (
    <main className="page">
      <SiteHeader title="Agenda" subtitle={`Setmana ${weekLabel(week)}`} />
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
                      <span className="small muted">· {divisions.get(m.divisionId)}</span>
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
