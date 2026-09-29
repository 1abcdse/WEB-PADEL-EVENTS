import { weekLabel } from "@/lib/format";
import { divisionName, scheduleLabel, type CompetitionDetail } from "@/lib/public-api";
import { SiteHeader } from "./SiteHeader";
import type { LinkComponent } from "./types";

export function HomeView({ comp, Link }: { comp: CompetitionDetail; Link: LinkComponent }) {
  const open = comp.divisions.filter((d) => d.status === "OPEN");
  const pending = comp.divisions.filter((d) => d.status === "PENDING");
  return (
    <main className="page">
      <SiteHeader title={comp.name} subtitle="Temporada 2026/27" Link={Link} />

      <h2 className="section-title">En joc</h2>
      {open.length === 0 && <p className="card muted">Les divisions s&apos;obriran quan tinguin {comp.group_size} parelles.</p>}
      {open.map((d) => (
        <Link key={d.division_id} href={`/divisio/${d.division_id}`} className="card card-link">
          <div className="match-head">
            <div>
              <div className="match-stage">{divisionName(d)}</div>
              <div className="match-week">{scheduleLabel(d.schedule)}</div>
            </div>
            <span className="badge ok">En joc</span>
          </div>
          <p className="small muted">
            {d.entries} parelles{d.first_week ? ` · des de la setmana del ${weekLabel(d.first_week)}` : ""}
          </p>
        </Link>
      ))}

      {pending.length > 0 && (
        <>
          <h2 className="section-title">Inscripcions obertes</h2>
          {pending.map((d) => (
            <div key={d.division_id} className="card">
              <div className="match-head">
                <div>
                  <div className="match-stage">{divisionName(d)}</div>
                  <div className="match-week">{scheduleLabel(d.schedule)}</div>
                </div>
                <span className="badge todo">
                  {d.missingPairs === 1 ? "Falta 1 parella" : `Falten ${d.missingPairs} parelles`}
                </span>
              </div>
              <div className="progress" aria-label={`${d.entries} de ${comp.group_size} parelles`}>
                <span style={{ width: `${Math.min(100, (d.entries / comp.group_size) * 100)}%` }} />
              </div>
              <p className="small muted">
                {d.entries} de {comp.group_size} parelles inscrites. La divisió comença quan arriba a {comp.group_size}.
              </p>
            </div>
          ))}
          <p className="small muted">Per inscriure&apos;t, parla amb el coordinador de la lliga o amb la recepció del club.</p>
        </>
      )}
    </main>
  );
}
