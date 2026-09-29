import Link from "next/link";
import { currentCompetition, divisionName, publicGet, type PublicMatch } from "@/lib/public-api";
import { AgendaView, mondayOf } from "@/views/AgendaView";
import { SiteHeader, Unavailable } from "@/views/SiteHeader";

export const dynamic = "force-dynamic";

const today = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Madrid" }).format(new Date());

export default async function AgendaPage({ searchParams }: { searchParams: Promise<{ setmana?: string }> }) {
  const { setmana } = await searchParams;
  try {
    const comp = await currentCompetition();
    if (!comp) throw new Error("no competition");
    const requested = setmana && /^\d{4}-\d{2}-\d{2}$/.test(setmana) ? mondayOf(setmana) : mondayOf(today());
    const week = requested < comp.first_week ? comp.first_week : requested;
    const matches = await publicGet<PublicMatch[]>(`/competitions/${comp.id}/agenda?week=${week}`);
    const names = new Map(comp.divisions.map((d) => [d.division_id, divisionName(d)]));
    return <AgendaView week={week} matches={matches} divisionNames={names} Link={Link} />;
  } catch {
    return (
      <main className="page">
        <SiteHeader title="Agenda" Link={Link} />
        <Unavailable />
      </main>
    );
  }
}
