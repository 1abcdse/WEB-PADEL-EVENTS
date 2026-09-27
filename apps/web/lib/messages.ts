import { ApiError } from "./api";

const MESSAGES: Record<string, string> = {
  UNAUTHORIZED: "Aquest enllaç no és vàlid o ha caducat. Demana'n un de nou al coordinador.",
  BOOKING_CONFLICT: "Aquesta franja ja no està disponible. Tria'n una altra.",
  MATCH_NOT_UNSCHEDULED: "Aquest partit ja té una proposta d'horari.",
  SLOT_IN_THE_PAST: "Aquesta franja ja ha passat.",
  NO_PROPOSAL: "Ja no hi ha cap proposta pendent.",
  NOTHING_TO_CANCEL: "Només es pot cancel·lar un partit confirmat.",
  MATCH_STARTED: "El partit ja ha començat.",
  MATCH_NOT_STARTED: "El partit encara no ha començat.",
  MATCH_NOT_SCHEDULED: "Aquest partit no està confirmat.",
  NO_PENDING_RESULT: "No hi ha cap resultat pendent de confirmar.",
  INVALID_RESULT:
    "Resultat no vàlid. Els sets acaben 6-0…6-4, 7-5 o 7-6 (amb super tie-break a 10). Si queda 1-1 cal un tercer set.",
  FORBIDDEN: "Aquesta acció la ha de fer la parella rival.",
};

export function errorMessage(err: unknown) {
  if (err instanceof ApiError) return MESSAGES[err.code] ?? `No s'ha pogut fer (${err.code}).`;
  return "No hi ha connexió. Torna-ho a provar.";
}
