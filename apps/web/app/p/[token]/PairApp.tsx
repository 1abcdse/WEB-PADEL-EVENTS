"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  entryApi,
  type CancellationOutcome,
  type EntryApi,
  type MatchView,
  type Me,
  type SetScore,
  type Slot,
  type TimeLimit,
} from "@/lib/api";
import { dayLabel, iWon, scoreFor, shortDay, stageLabel, startsAt, weekLabel } from "@/lib/format";
import { errorMessage } from "@/lib/messages";

type Notice = { kind: "ok" | "warn" | "error"; text: string };
type Sheet =
  | { type: "slots"; match: MatchView }
  | { type: "result"; match: MatchView }
  | { type: "confirm"; title: string; body: string; confirmLabel: string; danger?: boolean; run: () => Promise<Notice> };

const cancellationNotice = (o: CancellationOutcome): Notice => {
  if (o.kind === "WITHDRAWN") return { kind: "ok", text: "Proposta retirada. Podeu proposar un altre horari." };
  if (o.kind === "WARNING")
    return {
      kind: "warn",
      text: `Fet. Avís ${o.warningNumber} de ${o.of}: a la ${o.of}a cancel·lació d'aquest partit, el WO serà per a la parella rival.`,
    };
  return { kind: "warn", text: "Aquesta era la 3a cancel·lació d'aquest partit: WO per a la parella rival." };
};

/** `now` permet fixar el rellotge (demo); per defecte, l'hora real. */
export function PairApp({ token, now = () => new Date() }: { token: string; now?: () => Date }) {
  const api = useMemo(() => entryApi(token), [token]);
  const [me, setMe] = useState<Me | null>(null);
  const [fatal, setFatal] = useState<string | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [sheet, setSheet] = useState<Sheet | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      setMe(await api.me());
    } catch (err) {
      setFatal(errorMessage(err));
    }
  }, [api]);

  useEffect(() => {
    void load();
  }, [load]);

  const act = useCallback(
    async (fn: () => Promise<Notice>) => {
      setBusy(true);
      try {
        setNotice(await fn());
        setSheet(null);
      } catch (err) {
        setNotice({ kind: "error", text: errorMessage(err) });
        setSheet(null);
      } finally {
        setBusy(false);
        await load();
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    },
    [load],
  );

  if (fatal)
    return (
      <main className="page">
        <Header />
        <p className="notice error">{fatal}</p>
      </main>
    );

  if (!me)
    return (
      <main className="page" aria-busy="true">
        <Header />
        <div className="skeleton" />
        <div className="skeleton" />
      </main>
    );

  const open = me.matches.filter((m) => m.status !== "PLAYED" && m.status !== "WALKOVER");
  const done = me.matches.filter((m) => m.status === "PLAYED" || m.status === "WALKOVER");

  return (
    <main className="page">
      <Header name={me.name} subtitle={`${me.category} · ${me.level}`} />
      {notice && (
        <p className={`notice ${notice.kind}`} role="status">
          {notice.text}
        </p>
      )}

      <h2 className="section-title">Partits per jugar</h2>
      {open.length === 0 && <p className="card muted">No teniu cap partit pendent.</p>}
      {open.map((m) => (
        <MatchCard key={m.id} match={m} me={me.entryId} api={api} busy={busy} act={act} setSheet={setSheet} now={now} />
      ))}

      {done.length > 0 && <h2 className="section-title">Jugats</h2>}
      {done.map((m) => (
        <MatchCard key={m.id} match={m} me={me.entryId} api={api} busy={busy} act={act} setSheet={setSheet} now={now} />
      ))}

      <p className="muted small">
        Els partits es juguen dins la setmana de la seva jornada. Rebutjar una proposta o cancel·lar un partit confirmat
        compta com a cancel·lació: a la 3a del mateix partit, WO per a la rival.
      </p>

      {sheet?.type === "slots" && (
        <SlotSheet match={sheet.match} api={api} busy={busy} act={act} onClose={() => setSheet(null)} />
      )}
      {sheet?.type === "result" && (
        <ResultSheet match={sheet.match} me={me.entryId} api={api} busy={busy} act={act} onClose={() => setSheet(null)} />
      )}
      {sheet?.type === "confirm" && (
        <SheetFrame title={sheet.title} onClose={() => setSheet(null)}>
          <p>{sheet.body}</p>
          <div className="actions">
            <button className="btn grow" onClick={() => setSheet(null)} disabled={busy}>
              Enrere
            </button>
            <button
              className={`btn grow ${sheet.danger ? "danger" : "primary"}`}
              onClick={() => act(sheet.run)}
              disabled={busy}
            >
              {sheet.confirmLabel}
            </button>
          </div>
        </SheetFrame>
      )}
    </main>
  );
}

function Header({ name, subtitle }: { name?: string; subtitle?: string }) {
  return (
    <header className="hero">
      <p className="eyebrow">Lliga Social de Pàdel · El Masnou</p>
      <h1>{name ?? "Els meus partits"}</h1>
      {subtitle && <p className="muted">{subtitle}</p>}
    </header>
  );
}

interface CardProps {
  match: MatchView;
  me: string;
  api: EntryApi;
  busy: boolean;
  act: (fn: () => Promise<Notice>) => Promise<void>;
  setSheet: (s: Sheet) => void;
  now: () => Date;
}

function MatchCard({ match: m, me, api, busy, act, setSheet, now }: CardProps) {
  const iAmA = m.entryA.id === me;
  const rival = iAmA ? m.entryB : m.entryA;
  const b = m.booking;
  const started = b ? startsAt(b.date, b.start) <= now() : false;
  const when = b ? `${shortDay(b.date)} · ${b.start} · Pista ${b.court}` : null;

  const confirmSheet = (s: Omit<Extract<Sheet, { type: "confirm" }>, "type">) => setSheet({ type: "confirm", ...s });
  const askCancel = (kind: "cancel" | "reject") =>
    confirmSheet({
      title: kind === "cancel" ? "Cancel·lar el partit?" : "Rebutjar la proposta?",
      body:
        "Compta com a cancel·lació d'aquest partit. Les dues primeres són un avís; a la 3a, el partit és WO per a la parella rival i pagueu la pista.",
      confirmLabel: kind === "cancel" ? "Sí, cancel·lar" : "Sí, rebutjar",
      danger: true,
      run: async () => cancellationNotice(kind === "cancel" ? await api.cancel(m.id) : await api.reject(m.id)),
    });

  let badge: [string, string];
  let info: React.ReactNode = null;
  const actions: React.ReactNode[] = [];

  switch (m.status) {
    case "UNSCHEDULED":
      badge = ["todo", "Per agendar"];
      actions.push(
        <button key="pick" className="btn primary grow" disabled={busy} onClick={() => setSheet({ type: "slots", match: m })}>
          Triar horari
        </button>,
      );
      break;
    case "PROPOSED":
      if (b?.status === "CONFIRMED") {
        badge = ["wait", "Pendent del club"];
        info = (
          <>
            <strong>{when}</strong>Franja extra: pendent d&apos;aprovació del coordinador.
          </>
        );
        actions.push(
          <button key="cancel" className="btn danger" disabled={busy} onClick={() => askCancel("cancel")}>
            Cancel·lar
          </button>,
        );
      } else if (b?.proposedBy === me) {
        badge = ["wait", "Esperant la rival"];
        info = (
          <>
            <strong>{when}</strong>Heu proposat aquest horari. La parella rival l&apos;ha de confirmar.
          </>
        );
        actions.push(
          <button
            key="withdraw"
            className="btn"
            disabled={busy}
            onClick={() => act(async () => cancellationNotice(await api.reject(m.id)))}
          >
            Retirar proposta
          </button>,
        );
      } else {
        badge = ["todo", "Us proposen horari"];
        info = (
          <>
            <strong>{when}</strong>
            {b?.awaitingApproval ? "Franja extra: caldrà l'aprovació del coordinador." : "Confirmeu si us va bé."}
          </>
        );
        actions.push(
          <button
            key="accept"
            className="btn primary grow"
            disabled={busy}
            onClick={() =>
              act(async () => {
                const r = await api.confirm(m.id);
                return r.status === "SCHEDULED"
                  ? { kind: "ok", text: `Partit confirmat: ${when}.` }
                  : { kind: "ok", text: "Horari acceptat. Falta l'aprovació del coordinador." };
              })
            }
          >
            Acceptar
          </button>,
          <button key="reject" className="btn danger" disabled={busy} onClick={() => askCancel("reject")}>
            Rebutjar
          </button>,
        );
      }
      break;
    case "SCHEDULED":
      badge = ["ok", "Confirmat"];
      info = <strong>{when}</strong>;
      if (!started)
        actions.push(
          <button key="cancel" className="btn danger" disabled={busy} onClick={() => askCancel("cancel")}>
            Cancel·lar
          </button>,
        );
      else
        actions.push(
          <button key="result" className="btn primary grow" disabled={busy} onClick={() => setSheet({ type: "result", match: m })}>
            Posar resultat
          </button>,
          <button
            key="noshow"
            className="btn danger"
            disabled={busy}
            onClick={() =>
              confirmSheet({
                title: "La rival no s'ha presentat?",
                body: "El partit serà WO a favor vostre (6-0 · 6-0) i la parella absent pagarà la pista. El coordinador en rep l'avís i ho pot revisar.",
                confirmLabel: "Sí, no s'ha presentat",
                danger: true,
                run: async () => {
                  await api.noShow(m.id);
                  return { kind: "ok", text: "WO registrat a favor vostre." };
                },
              })
            }
          >
            No s&apos;ha presentat
          </button>,
        );
      break;
    case "RESULT_PENDING":
      info = (
        <>
          <strong>{m.result ? scoreFor(m.result, iAmA) : ""}</strong>
          {m.result?.reportedBy === me ? "Esperant que la rival confirmi el resultat." : "La rival ha posat aquest resultat."}
        </>
      );
      if (m.result?.reportedBy === me) badge = ["wait", "Esperant confirmació"];
      else {
        badge = ["todo", "Confirma el resultat"];
        actions.push(
          <button
            key="ok"
            className="btn primary grow"
            disabled={busy}
            onClick={() =>
              act(async () => {
                await api.confirmResult(m.id);
                return { kind: "ok", text: "Resultat confirmat. Ja compta a la classificació." };
              })
            }
          >
            Confirmar
          </button>,
          <button
            key="ko"
            className="btn danger"
            disabled={busy}
            onClick={() =>
              confirmSheet({
                title: "No hi esteu d'acord?",
                body: "El resultat quedarà descartat i el partit tornarà a estar pendent de resultat. Parleu-ho amb la rival o amb el coordinador.",
                confirmLabel: "No hi estem d'acord",
                danger: true,
                run: async () => {
                  await api.disputeResult(m.id);
                  return { kind: "warn", text: "Resultat descartat. Es pot tornar a posar." };
                },
              })
            }
          >
            No hi estem d&apos;acord
          </button>,
        );
      }
      break;
    case "PLAYED": {
      const won = m.result ? iWon(m.result, iAmA) : false;
      badge = won ? ["ok", "Victòria"] : ["done", "Derrota"];
      info = m.result && <strong>{scoreFor(m.result, iAmA)}</strong>;
      break;
    }
    case "WALKOVER": {
      const won = m.result ? iWon(m.result, iAmA) : false;
      badge = won ? ["ok", "Victòria per WO"] : ["bad", "Derrota per WO"];
      info = m.result && <strong>{scoreFor(m.result, iAmA)}</strong>;
      break;
    }
  }

  return (
    <article className="card" aria-label={`${stageLabel(m)} contra ${rival.name}`}>
      <div className="match-head">
        <div>
          <div className="match-stage">{stageLabel(m)}</div>
          <div className="match-week">Setmana {weekLabel(m.week)}</div>
        </div>
        <span className={`badge ${badge[0]}`}>{badge[1]}</span>
      </div>
      <p className="match-rival">
        <span>contra</span> {rival.name}
      </p>
      {info && <div className="match-info">{info}</div>}
      {actions.length > 0 && <div className="actions">{actions}</div>}
    </article>
  );
}

function SheetFrame({ title, subtitle, onClose, children }: { title: string; subtitle?: string; onClose: () => void; children: React.ReactNode }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()}>
        <button className="btn link sheet-close" onClick={onClose}>
          Tancar
        </button>
        <h2>{title}</h2>
        {subtitle && <p className="muted small">{subtitle}</p>}
        {children}
      </div>
    </div>
  );
}

interface SheetProps {
  match: MatchView;
  api: EntryApi;
  busy: boolean;
  act: (fn: () => Promise<Notice>) => Promise<void>;
  onClose: () => void;
}

function SlotSheet({ match, api, busy, act, onClose }: SheetProps) {
  const [slots, setSlots] = useState<Slot[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Slot | null>(null);

  useEffect(() => {
    api.slots(match.id).then(setSlots, (err) => setError(errorMessage(err)));
  }, [api, match.id]);

  const byDay = new Map<string, Slot[]>();
  for (const s of slots ?? []) byDay.set(s.date, [...(byDay.get(s.date) ?? []), s]);

  return (
    <SheetFrame title="Triar horari" subtitle={`${stageLabel(match)} · setmana ${weekLabel(match.week)}`} onClose={onClose}>
      {error && <p className="notice error">{error}</p>}
      {!slots && !error && <div className="skeleton" />}
      {slots?.length === 0 && (
        <p className="notice warn">No queda cap franja lliure aquesta setmana. Parleu amb el coordinador.</p>
      )}
      {[...byDay].map(([date, list]) => (
        <section key={date}>
          <p className="day">{dayLabel(date)}</p>
          <div className="slots">
            {list.map((s) => (
              <button
                key={`${s.start}-${s.court}`}
                className={`btn slot ${selected === s ? "selected" : ""}`}
                aria-pressed={selected === s}
                onClick={() => setSelected(s)}
              >
                {s.start} · Pista {s.court}
                {s.requiresApproval && <small>cal aprovació del club</small>}
              </button>
            ))}
          </div>
        </section>
      ))}
      {selected && (
        <div className="actions">
          <button
            className="btn primary grow"
            disabled={busy}
            onClick={() =>
              act(async () => {
                await api.propose(match.id, { date: selected.date, start: selected.start, court: selected.court });
                return {
                  kind: "ok",
                  text: `Proposta enviada: ${shortDay(selected.date)} a les ${selected.start}, pista ${selected.court}. Ara la rival l'ha de confirmar.`,
                };
              })
            }
          >
            Proposar {shortDay(selected.date)} · {selected.start} · P{selected.court}
          </button>
        </div>
      )}
    </SheetFrame>
  );
}

type Pair = { us: string; them: string };
const emptyPair = (): Pair => ({ us: "", them: "" });
const num = (v: string) => (v.trim() === "" ? null : Number(v));

function ResultSheet({ match, me, api, busy, act, onClose }: SheetProps & { me: string }) {
  const iAmA = match.entryA.id === me;
  const [sets, setSets] = useState<Pair[]>([emptyPair(), emptyPair(), emptyPair()]);
  const [tbs, setTbs] = useState<Pair[]>([emptyPair(), emptyPair(), emptyPair()]);
  const [unfinished, setUnfinished] = useState(false);
  const [partial, setPartial] = useState<Pair>(emptyPair());
  const [stb, setStb] = useState<Pair>(emptyPair());
  const [error, setError] = useState<string | null>(null);

  const orient = (p: Pair) => {
    const us = num(p.us)!;
    const them = num(p.them)!;
    return iAmA ? { a: us, b: them } : { a: them, b: us };
  };
  const filled = (p: Pair) => num(p.us) !== null && num(p.them) !== null;
  const isTiebreakSet = (p: Pair) => {
    const x = [num(p.us), num(p.them)].sort();
    return x[0] === 6 && x[1] === 7;
  };
  const winnerOf = (p: Pair) => (Number(p.us) > Number(p.them) ? "us" : "them");
  const split = filled(sets[0]!) && filled(sets[1]!) && winnerOf(sets[0]!) !== winnerOf(sets[1]!);
  const visibleSets = unfinished ? 2 : split ? 3 : 2;

  const submit = () => {
    setError(null);
    const body: { sets: SetScore[]; timeLimit?: TimeLimit } = { sets: [] };
    for (let i = 0; i < visibleSets; i++) {
      const p = sets[i]!;
      if (!filled(p)) {
        if (unfinished) continue;
        return setError(`Falta el resultat del set ${i + 1}.`);
      }
      const s: SetScore = orient(p);
      if (isTiebreakSet(p)) {
        if (!filled(tbs[i]!)) return setError(`Falta el super tie-break del set ${i + 1} (7-6).`);
        s.tieBreak = orient(tbs[i]!);
      }
      body.sets.push(s);
    }
    if (unfinished) {
      if (!filled(stb)) return setError("Falta el resultat del super tie-break final.");
      body.timeLimit = { superTieBreak: orient(stb) };
      if (filled(partial)) body.timeLimit.partialSet = orient(partial);
    }
    void act(async () => {
      await api.reportResult(match.id, body);
      return { kind: "ok", text: "Resultat enviat. Ara la parella rival l'ha de confirmar." };
    });
  };

  const input = (value: string, onChange: (v: string) => void, label: string) => (
    <input
      inputMode="numeric"
      pattern="[0-9]*"
      maxLength={2}
      aria-label={label}
      value={value}
      onChange={(e) => onChange(e.target.value.replace(/\D/g, ""))}
    />
  );
  const row = (label: string, p: Pair, set: (p: Pair) => void) => (
    <>
      <span>{label}</span>
      {input(p.us, (us) => set({ ...p, us }), `${label}: nosaltres`)}
      {input(p.them, (them) => set({ ...p, them }), `${label}: rival`)}
    </>
  );
  const update = (list: Pair[], setList: (l: Pair[]) => void, i: number) => (p: Pair) =>
    setList(list.map((x, j) => (j === i ? p : x)));

  const rival = iAmA ? match.entryB.name : match.entryA.name;

  return (
    <SheetFrame title="Posar resultat" subtitle={`${stageLabel(match)} contra ${rival}`} onClose={onClose}>
      <label className="toggle">
        <input type="checkbox" checked={unfinished} onChange={(e) => setUnfinished(e.target.checked)} />
        No s&apos;ha acabat a les 23:00
      </label>
      {unfinished && (
        <p className="muted small">Poseu els sets acabats, com anava el set en joc i el super tie-break a 10 que ha decidit el partit.</p>
      )}
      <div className="score-grid">
        <span />
        <span className="head">Nosaltres</span>
        <span className="head">Rival</span>
        {Array.from({ length: visibleSets }, (_, i) => (
          <SetRows key={i}>
            {row(`Set ${i + 1}`, sets[i]!, update(sets, setSets, i))}
            {isTiebreakSet(sets[i]!) && row("Super tie-break", tbs[i]!, update(tbs, setTbs, i))}
          </SetRows>
        ))}
        {unfinished && row("Set en joc", partial, setPartial)}
        {unfinished && row("Super tie-break final", stb, setStb)}
      </div>
      {error && <p className="notice error">{error}</p>}
      <div className="actions">
        <button className="btn primary grow" disabled={busy} onClick={submit}>
          Enviar resultat
        </button>
      </div>
    </SheetFrame>
  );
}

function SetRows({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
