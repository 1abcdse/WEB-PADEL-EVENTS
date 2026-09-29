export type MatchStatus = "UNSCHEDULED" | "PROPOSED" | "SCHEDULED" | "RESULT_PENDING" | "PLAYED" | "WALKOVER";

export interface SetScore {
  a: number;
  b: number;
  tieBreak?: { a: number; b: number };
}

export interface TimeLimit {
  partialSet?: { a: number; b: number };
  superTieBreak: { a: number; b: number };
}

export interface MatchView {
  id: string;
  purpose: "REGULAR" | "TIEBREAK" | "PLAYOFF";
  playoffCode: string | null;
  round: number | null;
  week: string;
  divisionId: string;
  group: string;
  status: MatchStatus;
  walkoverReason: string | null;
  entryA: { id: string; name: string };
  entryB: { id: string; name: string };
  booking: {
    date: string;
    start: string;
    court: number;
    status: "PROPOSED" | "CONFIRMED";
    proposedBy: string;
    awaitingApproval: boolean;
  } | null;
  result: { sets: SetScore[]; timeLimit: TimeLimit | null; confirmed: boolean; reportedBy: string | null } | null;
}

export interface Me {
  entryId: string;
  name: string;
  category: string;
  level: string;
  group_id: string | null;
  matches: MatchView[];
}

export interface Slot {
  date: string;
  start: string;
  court: number;
  requiresApproval: boolean;
}

export type CancellationOutcome =
  | { kind: "WARNING"; warningNumber: number; of: number }
  | { kind: "WALKOVER"; reason: string; winner: string; chargedEntry: string }
  | { kind: "WITHDRAWN" };

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly details?: unknown,
  ) {
    super(message);
  }
}

export function entryApi(token: string) {
  async function request<T>(method: "GET" | "POST", path: string, body?: unknown): Promise<T> {
    const res = await fetch(`/api/entry${path}`, {
      method,
      headers: { "x-entry-token": token, ...(body !== undefined ? { "content-type": "application/json" } : {}) },
      body: body !== undefined ? JSON.stringify(body) : null,
      cache: "no-store",
    });
    const data = res.headers.get("content-type")?.includes("json") ? await res.json() : undefined;
    if (!res.ok) throw new ApiError(res.status, data?.code ?? "ERROR", data?.message ?? res.statusText, data?.details);
    return data as T;
  }
  const m = (id: string, action: string) => `/matches/${id}/${action}`;
  return {
    me: () => request<Me>("GET", "/me"),
    slots: (id: string) => request<Slot[]>("GET", m(id, "slots")),
    propose: (id: string, slot: Omit<Slot, "requiresApproval">) =>
      request<{ requiresApproval: boolean }>("POST", m(id, "proposal"), slot),
    confirm: (id: string) => request<{ status: MatchStatus }>("POST", m(id, "confirm")),
    reject: (id: string) => request<CancellationOutcome>("POST", m(id, "reject")),
    cancel: (id: string) => request<CancellationOutcome>("POST", m(id, "cancel")),
    noShow: (id: string) => request<unknown>("POST", m(id, "no-show")),
    reportResult: (id: string, body: { sets: SetScore[]; timeLimit?: TimeLimit }) =>
      request<unknown>("POST", m(id, "result"), body),
    confirmResult: (id: string) => request<unknown>("POST", m(id, "result/confirm")),
    disputeResult: (id: string) => request<unknown>("POST", m(id, "result/dispute")),
  };
}

export type EntryApi = ReturnType<typeof entryApi>;
