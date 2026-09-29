import type { LinkComponent } from "./types";

export function SiteHeader({ title, subtitle, Link }: { title: string; subtitle?: string; Link: LinkComponent }) {
  return (
    <header className="hero">
      <nav className="topnav">
        <Link href="/">Lliga</Link>
        <Link href="/agenda">Agenda</Link>
      </nav>
      <p className="eyebrow">Lliga Social de Pàdel · CT&amp;P El Masnou</p>
      <h1>{title}</h1>
      {subtitle && <p className="muted">{subtitle}</p>}
    </header>
  );
}

export function Unavailable() {
  return <p className="notice error">Ara mateix no es poden carregar les dades. Torna-ho a provar d&apos;aquí a una estona.</p>;
}
