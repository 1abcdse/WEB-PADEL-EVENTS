import { NextResponse } from "next/server";
import { Resend } from "resend";
import { getTranslations } from "next-intl/server";
import { dates } from "@/content/dates";
import { getPack } from "@/content/packs";
import { site } from "@/content/site";
import { bookingSchema, contactSchema, FORMAT_MAX } from "@/lib/booking-schema";
import {
  bookingSummary,
  contactRows,
  type SummaryRow,
} from "@/lib/booking-summary";
import { emailHtml, emailText } from "@/lib/email";

/**
 * POST /api/sollicitud
 *  { kind: "booking", ...BookingInput }  → sol·licitud del configurador
 *  { kind: "contact", ...ContactInput }  → formulari de contacte
 * Envia un correu a BOOKING_TO_EMAIL i una confirmació automàtica al client.
 */

// Límit simple anti-abús per IP (memòria de la instància)
const hits = new Map<string, number[]>();
function rateLimited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 10 * 60_000);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > 5;
}

export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (rateLimited(ip))
    return NextResponse.json(
      { ok: false, error: "rate_limited" },
      { status: 429 },
    );

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "invalid_json" },
      { status: 400 },
    );
  }
  const kind = (body as { kind?: string })?.kind;

  // Parany anti-spam: si el camp ocult ve ple, fem veure que tot va bé
  if ((body as { website?: string })?.website)
    return NextResponse.json({ ok: true });

  let ownerSubject: string;
  let ownerRows: SummaryRow[];
  let clientSubject: string;
  let clientIntro: string[];
  let clientRows: SummaryRow[];
  let replyTo: string;
  let locale: string;
  let name: string;

  if (kind === "booking") {
    const parsed = bookingSchema.safeParse(body);
    if (!parsed.success)
      return NextResponse.json(
        { ok: false, error: "validation", issues: parsed.error.issues },
        { status: 422 },
      );
    const data = parsed.data;

    // Coherència amb el contingut: pack, data i extres han de pertànyer al format
    const pack =
      data.pack === "custom" ? null : getPack(data.format, data.pack);
    if (data.pack !== "custom" && !pack)
      return NextResponse.json({ ok: false, error: "pack" }, { status: 422 });
    if (
      data.date !== "flexible" &&
      !dates.some(
        (d) =>
          d.id === data.date &&
          d.format === data.format &&
          d.status !== "complet",
      )
    ) {
      return NextResponse.json({ ok: false, error: "date" }, { status: 422 });
    }
    if (pack && data.extras.some((e) => !pack.extras.includes(e)))
      return NextResponse.json({ ok: false, error: "extras" }, { status: 422 });
    if (
      data.pack === "custom" &&
      (data.customHours ?? 0) > FORMAT_MAX[data.format]
    ) {
      return NextResponse.json({ ok: false, error: "hours" }, { status: 422 });
    }

    locale = data.locale;
    name = data.name;
    replyTo = data.email;
    const tOwner = await getTranslations({ locale: "ca" });
    const tClient = await getTranslations({ locale });
    ownerRows = [
      ...bookingSummary(data, "ca", tOwner),
      ...contactRows(data, tOwner),
      { label: "Idioma", value: locale.toUpperCase() },
    ];
    ownerSubject = `Nova sol·licitud: ${pack?.name ?? "Personalitzat"} · ${data.name}`;
    clientSubject = tClient("email.clientSubject");
    clientIntro = [
      tClient("email.clientHello", { name: data.name }),
      tClient("email.clientIntro"),
    ];
    clientRows = bookingSummary(data, locale, tClient);
  } else if (kind === "contact") {
    const parsed = contactSchema.safeParse(body);
    if (!parsed.success)
      return NextResponse.json(
        { ok: false, error: "validation", issues: parsed.error.issues },
        { status: 422 },
      );
    const data = parsed.data;
    locale = data.locale;
    name = data.name;
    replyTo = data.email;
    const tOwner = await getTranslations({ locale: "ca" });
    const tClient = await getTranslations({ locale });
    ownerRows = [
      ...(data.subject ? [{ label: "Assumpte", value: data.subject }] : []),
      ...contactRows(data, tOwner),
      { label: "Idioma", value: locale.toUpperCase() },
    ];
    ownerSubject = `Nou missatge de contacte · ${data.name}`;
    clientSubject = tClient("email.contactSubject");
    clientIntro = [
      tClient("email.clientHello", { name: data.name }),
      tClient("email.contactIntro"),
    ];
    clientRows = data.comments
      ? [{ label: tClient("contact.message"), value: data.comments }]
      : [];
  } else {
    return NextResponse.json({ ok: false, error: "kind" }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.BOOKING_TO_EMAIL ?? site.email;
  const from =
    process.env.RESEND_FROM ?? "Padel System Academy <onboarding@resend.dev>";

  if (!apiKey) {
    // Sense clau: en local mostrem la sol·licitud a la consola per poder provar el flux
    if (process.env.NODE_ENV !== "production") {
      console.info(
        `\n[sol·licitud simulada — falta RESEND_API_KEY]\n${ownerSubject}\n${ownerRows.map((r) => `  ${r.label}: ${r.value}`).join("\n")}\n`,
      );
      return NextResponse.json({ ok: true, simulated: true });
    }
    console.error("RESEND_API_KEY no configurada");
    return NextResponse.json(
      { ok: false, error: "email_not_configured" },
      { status: 503 },
    );
  }

  const tClient = await getTranslations({ locale });
  const resend = new Resend(apiKey);

  const owner = await resend.emails.send({
    from,
    to,
    replyTo,
    subject: ownerSubject,
    html: emailHtml({ title: ownerSubject, intro: [], rows: ownerRows }),
    text: emailText({ title: ownerSubject, intro: [], rows: ownerRows }),
  });
  if (owner.error) {
    console.error("Resend (propietari):", owner.error);
    return NextResponse.json(
      { ok: false, error: "send_failed" },
      { status: 502 },
    );
  }

  // Confirmació al client: si falla, la sol·licitud ja ens ha arribat igualment
  const confirmation = {
    title: clientSubject,
    intro: clientIntro,
    rows: clientRows,
    outro: tClient("email.clientOutro"),
    signature: tClient("email.signature"),
  };
  const client = await resend.emails.send({
    from,
    to: replyTo,
    replyTo: to,
    subject: clientSubject,
    html: emailHtml(confirmation),
    text: emailText(confirmation),
  });
  if (client.error) console.error("Resend (confirmació):", client.error, name);

  return NextResponse.json({ ok: true });
}
