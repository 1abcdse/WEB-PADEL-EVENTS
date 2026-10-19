import type { SessionDate } from "./types";

/**
 * PROPERES DATES — afegeix, treu o canvia l'estat de cada data.
 *  - start: primer dia (dissabte si és cap de setmana, divendres si és stage), format AAAA-MM-DD
 *  - status: "disponible" | "poques-places" | "complet"
 * Les dates passades s'amaguen soles.
 */
export const dates: SessionDate[] = [
  {
    id: "cs-2026-11-14",
    format: "cap-de-setmana",
    start: "2026-11-14",
    status: "poques-places",
    note: {
      ca: "Clínic de víbora i bandeja",
      es: "Clinic de víbora y bandeja",
      en: "Víbora & bandeja clinic",
    },
  },
  {
    id: "st-2026-11-27",
    format: "stage-4-dies",
    start: "2026-11-27",
    status: "disponible",
  },
  {
    id: "cs-2026-12-12",
    format: "cap-de-setmana",
    start: "2026-12-12",
    status: "disponible",
    note: {
      ca: "Clínic de defensa",
      es: "Clinic de defensa",
      en: "Defence clinic",
    },
  },
  {
    id: "cs-2027-01-16",
    format: "cap-de-setmana",
    start: "2027-01-16",
    status: "disponible",
    note: { ca: "Clínic de globus", es: "Clinic de globo", en: "Lob clinic" },
  },
  {
    id: "st-2027-01-29",
    format: "stage-4-dies",
    start: "2027-01-29",
    status: "complet",
  },
  {
    id: "cs-2027-02-13",
    format: "cap-de-setmana",
    start: "2027-02-13",
    status: "disponible",
    note: { ca: "Clínic de remat", es: "Clinic de remate", en: "Smash clinic" },
  },
  {
    id: "st-2027-02-26",
    format: "stage-4-dies",
    start: "2027-02-26",
    status: "disponible",
  },
  {
    id: "cs-2027-03-13",
    format: "cap-de-setmana",
    start: "2027-03-13",
    status: "disponible",
    note: {
      ca: "Clínic de transicions",
      es: "Clinic de transiciones",
      en: "Transitions clinic",
    },
  },
  {
    id: "st-2027-03-26",
    format: "stage-4-dies",
    start: "2027-03-26",
    status: "poques-places",
  },
];
