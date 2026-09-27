import type { FastifyInstance } from "fastify";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { buildApp } from "../src/app.js";
import { createPool, type Pool } from "../src/db.js";
import { migrate } from "../src/migrate.js";
import { seed } from "../src/seed.js";

const DATABASE_URL = process.env.TEST_DATABASE_URL ?? "postgres://padel:padel@localhost:5432/padel_test";
const ADMIN = "test-admin-token-0123456789";

let pool: Pool;
let app: FastifyInstance;
let now = new Date("2026-10-10T10:00:00+02:00");
let ids: Awaited<ReturnType<typeof seed>>;

const admin = { authorization: `Bearer ${ADMIN}` };
const tokens: string[] = [];
const entries: string[] = [];

async function call(method: "GET" | "POST", url: string, opts: { headers?: Record<string, string>; body?: unknown } = {}) {
  const res = await app.inject({ method, url, headers: opts.headers ?? {}, ...(opts.body ? { payload: opts.body as object } : {}) });
  return { status: res.statusCode, body: res.body ? res.json() : undefined };
}
const asPair = (i: number) => ({ "x-entry-token": tokens[i]! });

const pair = (n: number, members: [boolean, boolean] = [true, false]) => ({
  seed: n,
  players: [
    { firstName: `Jugador${n}a`, lastName: `Cognom${n}a`, phone: `600000${String(n).padStart(2, "0")}1`, isMember: members[0] },
    { firstName: `Jugador${n}b`, lastName: `Cognom${n}b`, phone: `600000${String(n).padStart(2, "0")}2`, isMember: members[1] },
  ],
});

/** Partit de la parella i contra la parella j (índexs 0..5 = P1..P6). */
async function matchBetween(i: number, j: number) {
  const me = await call("GET", "/api/entry/me", { headers: asPair(i) });
  const m = me.body.matches.find(
    (x: { entryA: { id: string }; entryB: { id: string } }) =>
      [x.entryA.id, x.entryB.id].sort().join() === [entries[i], entries[j]].sort().join(),
  );
  return m as { id: string; status: string; week: string; round: number };
}

async function book(i: number, j: number, slot: { date: string; start: string; court: number }) {
  const m = await matchBetween(i, j);
  const p = await call("POST", `/api/entry/matches/${m.id}/proposal`, { headers: asPair(i), body: slot });
  expect(p.status, JSON.stringify(p.body)).toBe(201);
  const c = await call("POST", `/api/entry/matches/${m.id}/confirm`, { headers: asPair(j) });
  expect(c.status, JSON.stringify(c.body)).toBe(200);
  return m.id;
}

beforeAll(async () => {
  pool = createPool(DATABASE_URL);
  await pool.query("DROP SCHEMA public CASCADE; CREATE SCHEMA public;");
  await migrate(pool);
  ids = await seed(pool);
  app = buildApp({ pool, adminToken: ADMIN, publicUrl: "https://lliga.example", now: () => now });
});

afterAll(async () => {
  await app.close();
  await pool.end();
});

describe("Lliga Social: flux complet d'una divisió", () => {
  it("rebutja peticions sense autenticació", async () => {
    expect((await call("POST", `/api/admin/divisions/${ids.divisions["MASCULINA-C"]}/groups`)).status).toBe(401);
    expect((await call("GET", "/api/entry/me", { headers: { "x-entry-token": "x".repeat(32) } })).status).toBe(401);
  });

  it("importa 6 parelles amb cobrament d'inscripció per jugador", async () => {
    const res = await call("POST", `/api/admin/divisions/${ids.divisions["MASCULINA-C"]}/entries`, {
      headers: admin,
      body: { pairs: [1, 2, 3, 4, 5, 6].map((n) => pair(n)) },
    });
    expect(res.status).toBe(201);
    entries.push(...res.body.entryIds);

    const charges = await call("GET", `/api/admin/competitions/${ids.competitionId}/charges`, { headers: admin });
    expect(charges.body).toHaveLength(12);
    expect(charges.body.map((c: { amount_cents: number }) => c.amount_cents).sort()).toEqual([
      ...Array(6).fill(1000),
      ...Array(6).fill(2000),
    ]);
  });

  it("un jugador no pot estar dos cops a la mateixa categoria, però sí a Mixta", async () => {
    const dup = await call("POST", `/api/admin/divisions/${ids.divisions["MASCULINA-B"]}/entries`, {
      headers: admin,
      body: { pairs: [pair(1)] },
    });
    expect(dup.status).toBe(409);
    expect(dup.body.code).toBe("PLAYER_ALREADY_IN_CATEGORY");

    const mixed = await call("POST", `/api/admin/divisions/${ids.divisions["MIXTA-C"]}/entries`, {
      headers: admin,
      body: { pairs: [pair(1)] },
    });
    expect(mixed.status).toBe(201);
    // La inscripció es paga un sol cop per prova.
    const charges = await call("GET", `/api/admin/competitions/${ids.competitionId}/charges`, { headers: admin });
    expect(charges.body).toHaveLength(12);
  });

  it("genera el grup i el Round Robin: 15 partits, una jornada per setmana des del 12/10", async () => {
    const res = await call("POST", `/api/admin/divisions/${ids.divisions["MASCULINA-C"]}/groups`, { headers: admin });
    expect(res.status).toBe(201);
    expect(res.body.groups).toEqual([expect.objectContaining({ code: "A", entries: 6, matches: 15 })]);

    for (const [i] of entries.entries()) {
      const link = await call("POST", `/api/admin/entries/${entries[i]}/access-link`, { headers: admin });
      expect(link.body.url).toMatch(/^https:\/\/lliga\.example\/p\//);
      expect(link.body.whatsappLink).toMatch(/^https:\/\/wa\.me\/\?text=/);
      tokens.push(link.body.url.split("/p/")[1]);
    }

    const me = await call("GET", "/api/entry/me", { headers: asPair(0) });
    expect(me.body.name).toBe("Jugador1a C. / Jugador1b C.");
    expect(me.body.matches.map((m: { week: string }) => m.week)).toEqual([
      "2026-10-12",
      "2026-10-19",
      "2026-10-26",
      "2026-11-02",
      "2026-11-09",
    ]);
    // Jornada 1: P1 vs P6 (taula de referència).
    expect((await matchBetween(0, 5)).round).toBe(1);
  });

  it("franges de Masculina: dt/dc/dv × 4 pistes + dijous amb aprovació", async () => {
    const m = await matchBetween(0, 5);
    const slots = await call("GET", `/api/entry/matches/${m.id}/slots`, { headers: asPair(0) });
    expect(slots.body).toHaveLength(15);
    expect(slots.body.filter((s: { requiresApproval: boolean }) => s.requiresApproval)).toHaveLength(3);
    expect(new Set(slots.body.map((s: { date: string }) => s.date))).toEqual(
      new Set(["2026-10-13", "2026-10-14", "2026-10-15", "2026-10-16"]),
    );
  });

  it("proposar i confirmar: només la rival confirma; una pista no es pot reservar dos cops", async () => {
    const m = await matchBetween(0, 5);
    const slot = { date: "2026-10-13", start: "21:00", court: 1 };
    expect((await call("POST", `/api/entry/matches/${m.id}/proposal`, { headers: asPair(0), body: slot })).status).toBe(201);
    expect((await call("POST", `/api/entry/matches/${m.id}/confirm`, { headers: asPair(0) })).status).toBe(403);
    expect((await call("POST", `/api/entry/matches/${m.id}/confirm`, { headers: asPair(3) })).status).toBe(403);
    const ok = await call("POST", `/api/entry/matches/${m.id}/confirm`, { headers: asPair(5) });
    expect(ok.body).toEqual({ status: "SCHEDULED" });

    const other = await matchBetween(1, 4);
    const taken = await call("POST", `/api/entry/matches/${other.id}/proposal`, { headers: asPair(1), body: slot });
    expect(taken.status).toBe(409);
    expect(taken.body.details).toContainEqual({ type: "COURT_TAKEN", matchId: m.id });

    const wrongDay = await call("POST", `/api/entry/matches/${other.id}/proposal`, {
      headers: asPair(1),
      body: { date: "2026-10-12", start: "21:00", court: 1 },
    });
    expect(wrongDay.body.details).toContainEqual({ type: "NOT_A_LEAGUE_SLOT" });

    const agenda = await call("GET", `/api/public/competitions/${ids.competitionId}/agenda?week=2026-10-12`);
    expect(agenda.body).toHaveLength(1);
    expect(agenda.body[0].booking).toEqual({ date: "2026-10-13", start: "21:00", court: 1 });
    expect(JSON.stringify(agenda.body)).not.toContain("600000"); // mai dades personals
  });

  it("resultat: una parella el comunica, la rival el confirma, i es generen cobraments i classificació", async () => {
    const m = await matchBetween(0, 5);
    const early = await call("POST", `/api/entry/matches/${m.id}/result`, {
      headers: asPair(0),
      body: { sets: [{ a: 6, b: 4 }, { a: 1, b: 6 }, { a: 7, b: 5 }] },
    });
    expect(early.body.code).toBe("MATCH_NOT_STARTED");

    now = new Date("2026-10-13T22:45:00+02:00");
    const invalid = await call("POST", `/api/entry/matches/${m.id}/result`, {
      headers: asPair(0),
      body: { sets: [{ a: 6, b: 4 }, { a: 1, b: 6 }] },
    });
    expect(invalid.body.code).toBe("INVALID_RESULT");

    expect(
      (
        await call("POST", `/api/entry/matches/${m.id}/result`, {
          headers: asPair(0),
          body: { sets: [{ a: 6, b: 4 }, { a: 1, b: 6 }, { a: 7, b: 5 }] },
        })
      ).status,
    ).toBe(200);
    expect((await call("POST", `/api/entry/matches/${m.id}/result/confirm`, { headers: asPair(0) })).status).toBe(403);
    expect((await call("POST", `/api/entry/matches/${m.id}/result/confirm`, { headers: asPair(5) })).status).toBe(200);

    const me = await call("GET", "/api/entry/me", { headers: asPair(0) });
    const group = me.body.group_id;
    const standings = await call("GET", `/api/public/groups/${group}/standings`);
    expect(standings.body[0]).toMatchObject({ entryId: entries[0], points: 3, gamesWon: 14, gamesLost: 15 });
    expect(standings.body.find((r: { entryId: string }) => r.entryId === entries[5])).toMatchObject({ points: 1 });

    const charges = await call("GET", `/api/admin/competitions/${ids.competitionId}/charges`, { headers: admin });
    const matchCharges = charges.body.filter((c: { match_id: string }) => c.match_id === m.id);
    expect(matchCharges.map((c: { amount_cents: number }) => c.amount_cents).sort()).toEqual([100, 100, 500, 500]);
  });

  it("cancel·lacions: 1a i 2a són avisos; la 3a (encara que sigui amb < 24 h) és WO i paga qui cancel·la", async () => {
    now = new Date("2026-10-10T10:00:00+02:00");
    const slots = [
      { date: "2026-10-14", start: "21:00", court: 2 },
      { date: "2026-10-16", start: "21:00", court: 2 },
      { date: "2026-10-14", start: "21:00", court: 3 },
    ];
    let matchId = "";
    const outcomes = [];
    for (const [k, slot] of slots.entries()) {
      matchId = await book(1, 4, slot);
      if (k === 2) now = new Date("2026-10-14T12:00:00+02:00"); // tercera, amb menys de 24 h
      const res = await call("POST", `/api/entry/matches/${matchId}/cancel`, { headers: asPair(4) });
      outcomes.push(res.body);
    }
    expect(outcomes[0]).toEqual({ kind: "WARNING", warningNumber: 1, of: 3 });
    expect(outcomes[1]).toEqual({ kind: "WARNING", warningNumber: 2, of: 3 });
    expect(outcomes[2]).toMatchObject({ kind: "WALKOVER", reason: "REPEATED_CANCELLATIONS", winner: entries[1] });

    const m = await matchBetween(1, 4);
    expect(m.status).toBe("WALKOVER");
    const charges = await call("GET", `/api/admin/competitions/${ids.competitionId}/charges`, { headers: admin });
    const woCharges = charges.body.filter((c: { match_id: string }) => c.match_id === matchId);
    expect(woCharges.map((c: { first_name: string }) => c.first_name).sort()).toEqual(["Jugador5a", "Jugador5b"]);

    const audit = await call("GET", "/api/admin/audit?limit=20", { headers: admin });
    expect(audit.body.some((a: { action: string }) => a.action === "WALKOVER")).toBe(true);

    // El coordinador revisa i reverteix el WO: el partit torna a estar pendent i els cobraments s'anul·len.
    const revert = await call("POST", `/api/admin/matches/${matchId}/walkover/revert`, { headers: admin });
    expect(revert.body).toEqual({ status: "UNSCHEDULED" });
    const after = await call("GET", `/api/admin/competitions/${ids.competitionId}/charges`, { headers: admin });
    expect(after.body.filter((c: { match_id: string }) => c.match_id === matchId)).toHaveLength(0);
  });

  it("no presentació: WO per a la parella present i només paguen els absents", async () => {
    now = new Date("2026-10-10T10:00:00+02:00");
    const matchId = await book(2, 3, { date: "2026-10-16", start: "21:00", court: 4 });
    now = new Date("2026-10-16T21:20:00+02:00");
    expect((await call("POST", `/api/entry/matches/${matchId}/no-show`, { headers: asPair(2) })).status).toBe(200);

    const matches = await call("GET", `/api/entry/me`, { headers: asPair(2) });
    const m = matches.body.matches.find((x: { id: string }) => x.id === matchId);
    expect(m).toMatchObject({ status: "WALKOVER", walkoverReason: "NO_SHOW" });
    expect(m.result.sets).toEqual([{ a: 6, b: 0 }, { a: 6, b: 0 }]);

    const charges = await call("GET", `/api/admin/competitions/${ids.competitionId}/charges`, { headers: admin });
    const woCharges = charges.body.filter((c: { match_id: string }) => c.match_id === matchId);
    expect(woCharges.map((c: { first_name: string }) => c.first_name).sort()).toEqual(["Jugador4a", "Jugador4b"]);
  });

  it("dijous d'emergència: la reserva queda pendent fins que el coordinador l'aprova", async () => {
    now = new Date("2026-10-17T10:00:00+02:00");
    const m = await matchBetween(0, 4); // jornada 2
    expect(m.week).toBe("2026-10-19");
    await book(0, 4, { date: "2026-10-22", start: "21:00", court: 1 });
    const week = await call("GET", `/api/admin/competitions/${ids.competitionId}/weeks/2026-10-19`, { headers: admin });
    expect(week.body.awaitingApproval.map((x: { id: string }) => x.id)).toEqual([m.id]);

    const { rows } = await pool.query("SELECT id FROM booking WHERE match_id = $1 AND status = 'CONFIRMED'", [m.id]);
    await call("POST", `/api/admin/bookings/${rows[0].id}/approve`, { headers: admin });
    expect((await matchBetween(0, 4)).status).toBe("SCHEDULED");
  });

  it("partit no acabat a les 23:00 amb super tie-break, registrat pel coordinador amb un suplent", async () => {
    const m = await matchBetween(2, 5);
    const sub = await pool.query(
      "INSERT INTO player (club_id, first_name, last_name, is_member) VALUES ($1, 'Suplent', 'Prova', false) RETURNING id",
      [ids.clubId],
    );
    const { rows: p3 } = await pool.query("SELECT player_id FROM entry_player WHERE entry_id = $1 ORDER BY player_id", [
      entries[2],
    ]);
    const res = await call("POST", `/api/admin/matches/${m.id}/result`, {
      headers: admin,
      body: {
        sets: [{ a: 4, b: 6 }],
        timeLimit: { partialSet: { a: 4, b: 3 }, superTieBreak: { a: 10, b: 7 } },
        lineups: { [entries[2]!]: [p3[0].player_id, sub.rows[0].id] },
      },
    });
    expect(res.status, JSON.stringify(res.body)).toBe(200);

    const ranking = await call("GET", `/api/public/divisions/${ids.divisions["MASCULINA-C"]}/ranking`);
    const suplent = ranking.body.find((r: { name: string }) => r.name === "Suplent P.");
    expect(suplent).toMatchObject({ played: 1, won: 1, points: 3, setsWon: 1, setsLost: 1, gamesWon: 9, gamesLost: 9 });
  });

  it("playoffs: calen tots els partits de lliga; després semis 1v4, 2v3 i consolació 5v6, i la final", async () => {
    const me = await call("GET", "/api/entry/me", { headers: asPair(0) });
    const groupId = me.body.group_id;
    expect((await call("POST", `/api/admin/groups/${groupId}/playoffs`, { headers: admin })).body.code).toBe(
      "ROUND_ROBIN_NOT_FINISHED",
    );

    // Tanca la lliga: guanya sempre la parella amb millor cap de sèrie.
    const all = await call("GET", `/api/public/groups/${groupId}/matches`);
    for (const m of all.body.filter((x: { status: string }) => !["PLAYED", "WALKOVER"].includes(x.status))) {
      const aBetter = entries.indexOf(m.entryA.id) < entries.indexOf(m.entryB.id);
      await call("POST", `/api/admin/matches/${m.id}/result`, {
        headers: admin,
        body: { sets: aBetter ? [{ a: 6, b: 2 }, { a: 6, b: 2 }] : [{ a: 2, b: 6 }, { a: 2, b: 6 }] },
      });
    }

    const standings = await call("GET", `/api/public/groups/${groupId}/standings`);
    const order = standings.body.map((r: { entryId: string }) => entries.indexOf(r.entryId) + 1);
    const created = await call("POST", `/api/admin/groups/${groupId}/playoffs`, { headers: admin });
    expect(created.status).toBe(201);
    const byCode = Object.fromEntries(created.body.matches.map((m: { code: string }) => [m.code, m]));
    expect(Object.keys(byCode).sort()).toEqual(["CF", "SF1", "SF2"]);
    expect(byCode.SF1).toMatchObject({ entryA: entries[order[0] - 1], entryB: entries[order[3] - 1], week: "2026-11-16" });
    expect(byCode.CF).toMatchObject({ entryA: entries[order[4] - 1], entryB: entries[order[5] - 1] });

    for (const code of ["SF1", "SF2"])
      await call("POST", `/api/admin/matches/${byCode[code].id}/result`, {
        headers: admin,
        body: { sets: [{ a: 6, b: 3 }, { a: 6, b: 3 }] },
      });
    const final = await call("POST", `/api/admin/groups/${groupId}/playoffs`, { headers: admin });
    expect(final.body.matches).toEqual([
      expect.objectContaining({ code: "F", week: "2026-11-23", entryA: byCode.SF1.entryA, entryB: byCode.SF2.entryA }),
    ]);
  });
});
