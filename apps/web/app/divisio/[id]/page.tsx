import Link from "next/link";
import { notFound } from "next/navigation";
import { currentCompetition, publicGet, type PlayerRankingRow, type PublicMatch, type StandingRow } from "@/lib/public-api";
import { DivisionView } from "@/views/DivisionView";
import { SiteHeader, Unavailable } from "@/views/SiteHeader";

export const dynamic = "force-dynamic";

async function load(id: string) {
  const comp = await currentCompetition();
  const division = comp?.divisions.find((d) => d.division_id === id);
  if (!division) return null;
  const groups = await Promise.all(
    division.groups.map(async (g) => ({
      ...g,
      standings: await publicGet<StandingRow[]>(`/groups/${g.id}/standings`),
      matches: await publicGet<PublicMatch[]>(`/groups/${g.id}/matches`),
    })),
  );
  const ranking = await publicGet<PlayerRankingRow[]>(`/divisions/${id}/ranking`);
  return { division, groups, ranking };
}

export default async function DivisionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let data;
  try {
    data = await load(id);
  } catch {
    return (
      <main className="page">
        <SiteHeader title="Lliga Social de Pàdel" Link={Link} />
        <Unavailable />
      </main>
    );
  }
  if (!data) notFound();
  return <DivisionView {...data} Link={Link} />;
}
