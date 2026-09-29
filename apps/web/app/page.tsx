import Link from "next/link";
import { currentCompetition } from "@/lib/public-api";
import { HomeView } from "@/views/HomeView";
import { SiteHeader, Unavailable } from "@/views/SiteHeader";

export const dynamic = "force-dynamic";

export default async function Home() {
  try {
    const comp = await currentCompetition();
    if (comp) return <HomeView comp={comp} Link={Link} />;
    return (
      <main className="page">
        <SiteHeader title="Lliga Social de Pàdel" Link={Link} />
        <p className="card muted">Encara no hi ha cap prova publicada.</p>
      </main>
    );
  } catch {
    return (
      <main className="page">
        <SiteHeader title="Lliga Social de Pàdel" Link={Link} />
        <Unavailable />
      </main>
    );
  }
}
