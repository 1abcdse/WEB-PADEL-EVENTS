import { describe, expect, it } from "vitest";
import { emailOwner, parseRegistrations, splitName } from "../src/import/registrations.js";

// Dades inventades: mai dades reals d'inscrits als tests.
const SAMPLE = `# INSCRITES LLIGA FEMENINA

2 parelles — 4 jugadores

## PARELLA 1

Anna Serra Vidal
Telèfon: 600 111 222
Email: [annaserra@example.com](mailto:annaserra@example.com)
Nivell: C
Talla: m
Abonada: Sí

Berta Coll
Telèfon: 600111333
Nivell: C
Talla: L
Abonada: No

---

## PARELLA 2

Maria Teresa Puig Mas
Telèfon: 600222111
Email: [clara.roig@example.com](mailto:clara.roig@example.com)
Nivell: C
Talla: XL
Abonada: Sí

Clara Roig
Telèfon: 600222333
Nivell: C+
Talla: S
Abonada: Si

---
`;

describe("parseRegistrations", () => {
  const { pairs, warnings } = parseRegistrations(SAMPLE);

  it("llegeix parelles i fitxes", () => {
    expect(pairs).toHaveLength(2);
    expect(pairs[0]!.players[0]).toEqual({
      firstName: "Anna",
      lastName: "Serra Vidal",
      phone: "600111222",
      email: "annaserra@example.com",
      declaredLevel: "C",
      shirtSize: "M",
      isMember: true,
    });
    expect(pairs[0]!.players[1]).toMatchObject({ firstName: "Berta", lastName: "Coll", isMember: false });
  });

  it("assigna l'email a la jugadora que hi apareix", () => {
    expect(pairs[1]!.players[0].email).toBeUndefined();
    expect(pairs[1]!.players[1].email).toBe("clara.roig@example.com");
    expect(pairs[1]!.players[1].isMember).toBe(true); // "Si" sense accent
  });

  it("avisa de nivells diferents dins una parella", () => {
    expect(warnings).toEqual(["Parella 2: nivells diferents (C / C+)"]);
  });
});

describe("splitName / emailOwner", () => {
  it("noms compostos amb 4 paraules", () => {
    expect(splitName("Maria Teresa Puig Mas")).toEqual({ firstName: "Maria Teresa", lastName: "Puig Mas" });
    expect(splitName("Joan Puig")).toEqual({ firstName: "Joan", lastName: "Puig" });
  });
  it("sense coincidència, l'email és de la primera jugadora", () => {
    expect(emailOwner("xyz123@example.com", [splitName("Anna Serra"), splitName("Berta Coll")])).toBe(0);
    expect(emailOwner("berta.coll@example.com", [splitName("Anna Serra"), splitName("Berta Coll")])).toBe(1);
  });
});
