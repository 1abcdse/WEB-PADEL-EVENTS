import { z } from "zod";

export const uuid = z.uuid();
export const idParams = (name: string) => z.object({ [name]: uuid });

const games = z.number().int().min(0).max(7);
const points = z.number().int().min(0).max(99);

export const setScore = z.object({
  a: games,
  b: games,
  tieBreak: z.object({ a: points, b: points }).optional(),
});

export const resultBody = z.object({
  sets: z.array(setScore).max(3),
  timeLimit: z
    .object({
      partialSet: z.object({ a: games, b: games }).optional(),
      superTieBreak: z.object({ a: points, b: points }),
    })
    .optional(),
});

export const slotBody = z.object({
  date: z.iso.date(),
  start: z.string().regex(/^\d{2}:\d{2}$/),
  court: z.number().int().min(1).max(20),
});
