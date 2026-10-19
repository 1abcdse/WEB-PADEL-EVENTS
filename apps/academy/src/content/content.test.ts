import { test } from "node:test";
import assert from "node:assert/strict";
import { contentErrors } from "./validate.ts";
import { packs } from "./packs.ts";
import { formats } from "./formats.ts";

test("el contingut de packs i dates és vàlid", () => {
  assert.deepEqual(contentErrors(), []);
});

test("cap pack supera 20 h (cap de setmana) ni 30 h (stage 4 dies)", () => {
  assert.equal(formats["cap-de-setmana"].maxHours, 20);
  assert.equal(formats["stage-4-dies"].maxHours, 30);
  for (const p of packs) {
    assert.ok(p.hours <= formats[p.format].maxHours, `${p.name}: ${p.hours} h`);
  }
});

test("un pack de cap de setmana amb 21 h es detecta", () => {
  const original = packs[0]!;
  const backup = { hours: original.hours, program: original.program };
  original.hours = 21;
  original.program = [
    { ...original.program[0]!, hours: 11 },
    { ...original.program[1]!, hours: 10 },
  ];
  try {
    const errors = contentErrors();
    assert.ok(errors.some((e) => e.includes("supera el màxim de 20 h")));
    assert.ok(errors.some((e) => e.includes("supera el màxim de 10 h/dia")));
  } finally {
    Object.assign(original, backup);
  }
});
