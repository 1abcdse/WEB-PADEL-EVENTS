import { z } from "zod";
import { formats } from "@/content/formats";

/**
 * Esquema compartit client/servidor per a la sol·licitud de reserva i el contacte.
 * Els missatges d'error són claus de traducció (messages/*.json → errors.*).
 */
export const LEVELS = [
  "iniciacio",
  "intermedi",
  "avancat",
  "competicio",
] as const;
export const FORMAT_SLUGS = ["cap-de-setmana", "stage-4-dies"] as const;
export const FORMAT_MAX: Record<(typeof FORMAT_SLUGS)[number], number> = {
  "cap-de-setmana": formats["cap-de-setmana"].maxHours,
  "stage-4-dies": formats["stage-4-dies"].maxHours,
};

const contactFields = {
  name: z.string().trim().min(2, "required").max(100, "tooLong"),
  email: z.string().trim().email("email").max(200, "tooLong"),
  phone: z
    .string()
    .trim()
    .min(6, "phone")
    .max(30, "phone")
    .regex(/^[+\d][\d\s().-]+$/, "phone"),
  comments: z.string().trim().max(2000, "tooLong").optional().default(""),
  privacy: z.literal(true, { message: "privacy" }),
  /** Camp parany anti-spam: ha d'arribar buit */
  website: z.string().max(0).optional().default(""),
  locale: z.enum(["ca", "es", "en"]).default("ca"),
};

export const bookingSchema = z
  .object({
    format: z.enum(FORMAT_SLUGS, { message: "required" }),
    /** slug del pack o "custom" per a hores personalitzades */
    pack: z.string().min(1, "required"),
    customHours: z.number().int().min(2, "hours").max(30, "hours").optional(),
    /** id de src/content/dates.ts o "flexible" */
    date: z.string().min(1, "required"),
    players: z.number().int().min(1, "players").max(12, "players"),
    level: z.enum(LEVELS, { message: "required" }),
    companions: z.number().int().min(0).max(10),
    extras: z.array(z.string()).max(10).default([]),
    ...contactFields,
  })
  .superRefine((data, ctx) => {
    if (data.pack === "custom") {
      const max = FORMAT_MAX[data.format];
      if (data.customHours === undefined || data.customHours > max) {
        ctx.addIssue({
          code: "custom",
          path: ["customHours"],
          message: "hours",
        });
      }
    }
  });

export const contactSchema = z.object({
  ...contactFields,
  subject: z.string().trim().max(120, "tooLong").optional().default(""),
});

export type BookingInput = z.input<typeof bookingSchema>;
export type BookingData = z.output<typeof bookingSchema>;
export type ContactInput = z.input<typeof contactSchema>;
export type ContactData = z.output<typeof contactSchema>;
