import { scoreFor, shortDay, stageLabel, weekLabel } from "@/lib/format";
import {
  divisionName,
  scheduleLabel,
  type DivisionSummary,
  type PlayerRankingRow,
  type PublicMatch,
  type StandingRow,
} from "@/lib/public-api";
import { SiteHeader } from "./SiteHeader";
import type { LinkComponent } from "./types";

const STATUS: Record<string, string> = {
  UNSCHEDULED: "Per agendar",
  PROPOSED: "Per confirmar",
  SCHEDULED: "Confirmat",
  RESULT_PENDING: "Resultat pendent",
};

export interface DivisionGroupData {
  id: string;
  code: string;
  standings: StandingRow[];
  matches: PublicMatch[];
}

const signed = (n: number) => (n > 0 ? `+${n}` : String(n));

export function DivisionView({
  division,
  groups,
  ranking,
  Link,
}: {
  division: DivisionSummary;
  groups: DivisionGroupData[];
  ranking: PlayerRankingRow[];
  Link: LinkComponent;
}) {
  return (
    <main className="page">
      <SiteHeader title={divisionName(division)} subtitle={scheduleLabel(division.schedule)} Link={Link} />
      {groups.length === 0 && (
        <p className="card muted">
          Aquesta divisió encara no ha començat: hi ha {division.entries} parelles inscrites i en falten {division.missingPairs}.
        </p>
      )}
      {groups.map((g) => {
        const byWeek = new Map<string, PublicMatch[]>();
        for (const m of g.matches) {
          const key = m.week + (m.playoffCode ? "P" : "");
          byWeek.set(key, [...(byWeek.get(key) ?? []), m]);
        }
        return (
          <section key={g.id}>
            {groups.length > 1 && <h2 className="section-title">Grup {g.code}</h2>}
            <h2 className="section-title">Classificació</h2>
            <div className="card table-card">
              <table className="table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th className="left">Parella</th>
                    <th title="Partits jugats">PJ</th>
                    <th title="Guanyats">G</th>
                    <th title="Diferència de jocs">+/-</th>
                    <th>Pts</th>
                  </tr>
                </thead>
                <tbody>
                  {g.standings.map((r) => (
                    <tr key={r.entryId}>
                      <td>{r.position}</td>
                      <td className="left">{r.name}</td>
                      <td>{r.played}</td>
                      <td>{r.won}</td>
                      <td>{signed(r.gameDifference)}</td>
                      <td className="strong">{r.points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="small muted">Victòria 3 punts · derrota amb un set guanyat 1 · derrota 0.</p>

            <h2 className="section-title">Partits</h2>
            {[...byWeek.values()].map((ms) => (
              <div key={ms[0]!.id} className="card">
                <div className="match-head">
                  <div className="match-stage">{ms[0]!.playoffCode ? "Playoffs" : stageLabel(ms[0]!)}</div>
                  <div className="match-week">Setmana {weekLabel(ms[0]!.week)}</div>
                </div>
                <ul className="match-list">
                  {ms.map((m) => (
                    <li key={m.id}>
                      <div>
                        {m.playoffCode && <span className="small muted">{stageLabel(m)} · </span>}
                        {m.entryA.name} <span className="muted">vs</span> {m.entryB.name}
                      </div>
                      <div className="small">
                        {m.result && (m.status === "PLAYED" || m.status === "WALKOVER") ? (
                          <strong>
                            {scoreFor(m.result, true)}
                            {m.status === "WALKOVER" && " (WO)"}
                          </strong>
                        ) : m.booking?.status === "CONFIRMED" ? (
                          <span className="muted">
                            {shortDay(m.booking.date)} · {m.booking.start} · Pista {m.booking.court}
                          </span>
                        ) : (
                          <span className="muted">{STATUS[m.status] ?? ""}</span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </section>
        );
      })}

      {ranking.length > 0 && (
        <>
          <h2 className="section-title">Rànquing individual</h2>
          <div className="card table-card">
            <table className="table">
              <thead>
                <tr>
                  <th>#</th>
                  <th className="left">Jugador/a</th>
                  <th>PJ</th>
                  <th>+/-</th>
                  <th>Pts</th>
                </tr>
              </thead>
              <tbody>
                {ranking.map((r) => (
                  <tr key={r.playerId}>
                    <td>{r.position}</td>
                    <td className="left">{r.name}</td>
                    <td>{r.played}</td>
                    <td>{signed(r.gameDifference)}</td>
                    <td className="strong">{r.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="small muted">Inclou lliga i playoffs d&apos;aquesta divisió.</p>
        </>
      )}
    </main>
  );
}
