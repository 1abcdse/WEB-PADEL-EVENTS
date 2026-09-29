import { notFound } from "next/navigation";
import { scoreFor, shortDay, stageLabel, weekLabel } from "@/lib/format";
import {
  currentCompetition,
  divisionName,
  publicGet,
  scheduleLabel,
  type PlayerRankingRow,
  type PublicMatch,
  type StandingRow,
} from "@/lib/public-api";
import { SiteHeader, Unavailable } from "../../SiteHeader";

export const dynamic = "force-dynamic";

const STATUS: Record<string, string> = {
  UNSCHEDULED: "Per agendar",
  PROPOSED: "Per confirmar",
  SCHEDULED: "Confirmat",
  RESULT_PENDING: "Resultat pendent",
};

export default async function DivisionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let data;
  try {
    const comp = await currentCompetition();
    const division = comp?.divisions.find((d) => d.division_id === id);
    if (!division) notFound();
    const groups = await Promise.all(
      division.groups.map(async (g) => ({
        ...g,
        standings: await publicGet<StandingRow[]>(`/groups/${g.id}/standings`),
        matches: await publicGet<PublicMatch[]>(`/groups/${g.id}/matches`),
      })),
    );
    const ranking = await publicGet<PlayerRankingRow[]>(`/divisions/${id}/ranking`);
    data = { division, groups, ranking };
  } catch (err) {
    if ((err as { digest?: string }).digest?.startsWith("NEXT_")) throw err;
    return (
      <main className="page">
        <SiteHeader title="Lliga Social de Pàdel" />
        <Unavailable />
      </main>
    );
  }
  const { division, groups, ranking } = data;

  return (
    <main className="page">
      <SiteHeader title={divisionName(division)} subtitle={scheduleLabel(division.schedule)} />
      {groups.length === 0 && (
        <p className="card muted">
          Aquesta divisió encara no ha començat: hi ha {division.entries} parelles inscrites i en falten {division.missingPairs}.
        </p>
      )}
      {groups.map((g) => {
        const byWeek = new Map<string, PublicMatch[]>();
        for (const m of g.matches) byWeek.set(m.week + (m.playoffCode ? "P" : ""), [...(byWeek.get(m.week + (m.playoffCode ? "P" : "")) ?? []), m]);
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
                      <td>{r.gameDifference > 0 ? `+${r.gameDifference}` : r.gameDifference}</td>
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
                  <div className="match-stage">{stageLabel(ms[0]!).replace(/^(Semifinal|Final de consolació|Final)$/, "Playoffs")}</div>
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
                    <td>{r.gameDifference > 0 ? `+${r.gameDifference}` : r.gameDifference}</td>
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
