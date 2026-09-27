import type { MatchView, SetScore, TimeLimit } from "./api";

const TZ = "Europe/Madrid";
const d = (date: string) => new Date(`${date}T12:00:00Z`);

export function dayLabel(date: string) {
  const s = new Intl.DateTimeFormat("ca-ES", { weekday: "long", day: "numeric", month: "long", timeZone: TZ }).format(d(date));
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function shortDay(date: string) {
  return new Intl.DateTimeFormat("ca-ES", { weekday: "short", day: "numeric", month: "short", timeZone: TZ }).format(d(date));
}

export function weekLabel(monday: string) {
  const end = new Date(d(monday).getTime() + 6 * 86400000);
  const f = new Intl.DateTimeFormat("ca-ES", { day: "numeric", month: "short", timeZone: TZ });
  return `${f.format(d(monday))} – ${f.format(end)}`;
}

/** Instant d'inici d'una reserva (hora local del club). */
export function startsAt(date: string, start: string) {
  // Octubre–març: CET/CEST. El navegador dels jugadors és a la mateixa zona; el servidor valida igualment.
  return new Date(`${date}T${start}:00`);
}

export function stageLabel(m: Pick<MatchView, "purpose" | "round" | "playoffCode">) {
  if (m.purpose === "PLAYOFF")
    return { SF1: "Semifinal", SF2: "Semifinal", F: "Final", CF: "Final de consolació" }[m.playoffCode ?? ""] ?? "Playoff";
  if (m.purpose === "TIEBREAK") return "Partit de desempat";
  return `Jornada ${m.round}`;
}

/** Marcador des del punt de vista d'una parella (nosaltres primer). */
export function scoreFor(result: { sets: SetScore[]; timeLimit: TimeLimit | null }, iAmA: boolean) {
  const o = (x: { a: number; b: number }) => (iAmA ? `${x.a}-${x.b}` : `${x.b}-${x.a}`);
  const parts = result.sets.map((s) => (s.tieBreak ? `${o(s)} (${o(s.tieBreak)})` : o(s)));
  if (result.timeLimit) {
    if (result.timeLimit.partialSet) parts.push(`${o(result.timeLimit.partialSet)}*`);
    parts.push(`STB ${o(result.timeLimit.superTieBreak)}`);
  }
  return parts.join(" · ");
}

export function iWon(result: { sets: SetScore[]; timeLimit: TimeLimit | null }, iAmA: boolean) {
  let a = 0;
  let b = 0;
  for (const s of result.sets) s.a > s.b ? a++ : b++;
  const aWins = result.timeLimit ? result.timeLimit.superTieBreak.a > result.timeLimit.superTieBreak.b : a > b;
  return aWins === iAmA;
}
