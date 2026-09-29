import { useMemo, useState, type MouseEvent, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { PairApp } from "@/app/p/[token]/PairApp";
import { divisionName } from "@/lib/public-api";
import { AgendaView, mondayOf } from "@/views/AgendaView";
import { DivisionView } from "@/views/DivisionView";
import { HomeView } from "@/views/HomeView";
import { DemoLeague } from "./mock";

/** Moments de la simulació: la demo "viu" en aquests instants per poder provar cada pas. */
const CLOCKS = [
  { id: "c1", label: "Dc 14/10 · 10:00", hint: "J1 en marxa", at: "2026-10-14T10:00:00+02:00" },
  { id: "c2", label: "Dc 14/10 · 22:45", hint: "després del partit de dc", at: "2026-10-14T22:45:00+02:00" },
  { id: "c3", label: "Ds 17/10 · 12:15", hint: "després del partit de Mixta", at: "2026-10-17T12:15:00+02:00" },
  { id: "c4", label: "Dl 19/10 · 10:00", hint: "J2", at: "2026-10-19T10:00:00+02:00" },
];

type Route = { page: "home" } | { page: "division"; id: string } | { page: "agenda"; week?: string };

function parse(href: string): Route {
  if (href.startsWith("/divisio/")) return { page: "division", id: href.slice(9) };
  if (href.startsWith("/agenda")) {
    const week = /setmana=([\d-]+)/.exec(href)?.[1];
    return week ? { page: "agenda", week } : { page: "agenda" };
  }
  return { page: "home" };
}

function Demo() {
  const [clockId, setClockId] = useState(CLOCKS[0]!.id);
  const clock = CLOCKS.find((c) => c.id === clockId)!;
  const [league, setLeague] = useState(() => new DemoLeague(() => new Date(CLOCKS[0]!.at)));
  league.now = () => new Date(clock.at);
  const [mode, setMode] = useState<"public" | "pair">("pair");
  const pairs = useMemo(() => league.pairs(), [league]);
  const [pairId, setPairId] = useState("f4");
  const [route, setRoute] = useState<Route>({ page: "home" });
  const [tick, setTick] = useState(0);
  const [guide, setGuide] = useState(true);
  const [gen, setGen] = useState(0);

  useMemo(() => {
    const original = window.fetch.bind(window);
    window.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === "string" ? input : input instanceof URL ? input.pathname : input.url;
      if (url.startsWith("/api/entry")) {
        const res = await league.handle(url, init);
        setTimeout(() => setTick((t) => t + 1), 0);
        return res;
      }
      return original(input, init);
    }) as typeof fetch;
  }, [league]);

  const Link = ({ href, className, children }: { href: string; className?: string; children: ReactNode }) => (
    <a
      href={`#${href.replace(/[^a-z0-9]/gi, "-")}`}
      className={className}
      onClick={(e: MouseEvent) => {
        e.preventDefault();
        setRoute(parse(href));
        window.scrollTo({ top: 0 });
      }}
    >
      {children}
    </a>
  );

  const comp = league.competition();
  let page: ReactNode;
  if (route.page === "division") {
    const division = comp.divisions.find((d) => d.division_id === route.id)!;
    const groups = division.groups.map((g) => ({
      ...g,
      standings: league.standings(division.division_id),
      matches: league.groupMatches(division.division_id),
    }));
    page = <DivisionView division={division} groups={groups} ranking={league.ranking(division.division_id)} Link={Link} />;
  } else if (route.page === "agenda") {
    const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Madrid" }).format(new Date(clock.at));
    const week = route.week ? mondayOf(route.week) : mondayOf(today);
    page = (
      <AgendaView
        week={week}
        matches={league.agenda(week)}
        divisionNames={new Map(comp.divisions.map((d) => [d.division_id, divisionName(d)]))}
        Link={Link}
      />
    );
  } else page = <HomeView comp={comp} Link={Link} />;

  const current = pairs.find((p) => p.id === pairId)!;

  return (
    <>
      <div className="demo-bar" role="region" aria-label="Controls de la demo">
        <div className="demo-row">
          <strong className="demo-tag">Demo</strong>
          <div className="seg" role="tablist" aria-label="Què vols veure">
            <button role="tab" aria-selected={mode === "pair"} onClick={() => setMode("pair")}>
              Pantalla de parella
            </button>
            <button role="tab" aria-selected={mode === "public"} onClick={() => setMode("public")}>
              Web pública
            </button>
          </div>
        </div>
        <div className="demo-row">
          {mode === "pair" && (
            <label className="demo-field">
              <span>Ets la parella</span>
              <select id="demo-pair" value={pairId} onChange={(e) => setPairId(e.target.value)}>
                {["fem-c", "mixta"].map((d) => (
                  <optgroup key={d} label={d === "mixta" ? "Mixta" : "Femenina · Nivell C"}>
                    {pairs
                      .filter((p) => p.division.id === d)
                      .map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                  </optgroup>
                ))}
              </select>
            </label>
          )}
          <label className="demo-field">
            <span>Dia i hora</span>
            <select id="demo-clock" value={clockId} onChange={(e) => setClockId(e.target.value)}>
              {CLOCKS.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label} ({c.hint})
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="demo-row demo-actions">
          <button className="btn link" onClick={() => setGuide((g) => !g)}>
            {guide ? "Amagar guia" : "Com provar-ho"}
          </button>
          <button className="btn link" onClick={() => { league.approveAll(); setGen((g) => g + 1); }}>
            Aprovar dijous (coordinador)
          </button>
          <button
            className="btn link"
            onClick={() => {
              setLeague(new DemoLeague(() => new Date(clock.at)));
              setClockId(CLOCKS[0]!.id);
              setRoute({ page: "home" });
              setGen((g) => g + 1);
            }}
          >
            Reiniciar
          </button>
        </div>
        {guide && (
          <ol className="demo-guide">
            <li>
              Ets <b>Ona Bertran / Clara Mestres</b>: la rival us ha proposat divendres a les 21:00. Accepta-ho o rebutja-ho
              (compta com a cancel·lació).
            </li>
            <li>Tria horari per a la Jornada 2. Canvia de parella per fer de rival i confirmar-lo.</li>
            <li>
              Posa l&apos;hora a <b>Dc 14/10 · 22:45</b> i entra com a <b>Carla Vendrell / Judit Pujol</b> per posar el resultat
              del partit de dimecres. Després confirma&apos;l des de la parella rival.
            </li>
            <li>Mira-ho a la <b>Web pública</b>: la classificació, el rànquing i l&apos;agenda s&apos;actualitzen.</li>
          </ol>
        )}
      </div>

      {mode === "pair" ? (
        <PairApp key={`${pairId}-${clockId}-${gen}`} token={pairId} now={() => new Date(clock.at)} />
      ) : (
        <div data-tick={tick}>{page}</div>
      )}
      <p className="demo-foot">
        Demo amb noms inventats. {mode === "pair" ? `Vista de ${current.name} (${current.division.category}).` : ""} Els canvis
        només es guarden mentre tens aquesta pàgina oberta.
      </p>
    </>
  );
}

createRoot(document.getElementById("root")!).render(<Demo />);
