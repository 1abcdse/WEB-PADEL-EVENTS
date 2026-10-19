import type { SummaryRow } from "./booking-summary";

const escape = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

/** Plantilla HTML de correu amb la marca (negre + llima), compatible amb clients de correu */
export function emailHtml({
  title,
  intro,
  rows,
  outro,
  signature,
}: {
  title: string;
  intro: string[];
  rows: SummaryRow[];
  outro?: string;
  signature?: string;
}) {
  const rowHtml = rows
    .map(
      (r) => `<tr>
  <td style="padding:10px 12px;border-bottom:1px solid #ECECE7;color:#8A8A85;font-size:13px;width:38%;vertical-align:top">${escape(r.label)}</td>
  <td style="padding:10px 12px;border-bottom:1px solid #ECECE7;color:#0B0B0B;font-size:14px;font-weight:600;white-space:pre-wrap">${escape(r.value)}</td>
</tr>`,
    )
    .join("");
  return `<!doctype html><html><body style="margin:0;background:#ECECE7;font-family:Inter,Arial,sans-serif">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#ECECE7;padding:24px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#FFFFFF;border-radius:10px;overflow:hidden">
<tr><td style="background:#0B0B0B;padding:24px 28px;border-bottom:6px solid #D6FF2E">
  <span style="display:inline-block;background:#FFFFFF;color:#0B0B0B;font-weight:900;font-style:italic;font-size:22px;padding:2px 10px;transform:skewX(-12deg)">PS</span>
  <span style="color:#FFFFFF;font-size:11px;letter-spacing:4px;margin-left:12px;font-weight:600">PADEL SYSTEM ACADEMY</span>
</td></tr>
<tr><td style="padding:28px">
  <h1 style="margin:0 0 16px;font-size:22px;font-style:italic;text-transform:uppercase;color:#0B0B0B">${escape(title)}</h1>
  ${intro.map((p) => `<p style="margin:0 0 12px;font-size:15px;line-height:1.55;color:#1A1A1A">${escape(p)}</p>`).join("")}
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;border-top:1px solid #ECECE7">${rowHtml}</table>
  ${outro ? `<p style="margin:0 0 12px;font-size:15px;line-height:1.55;color:#1A1A1A">${escape(outro)}</p>` : ""}
  ${signature ? `<p style="margin:20px 0 0;font-size:15px;font-weight:700;color:#0B0B0B">${escape(signature)}</p>` : ""}
</td></tr>
</table></td></tr></table></body></html>`;
}

export function emailText({
  title,
  intro,
  rows,
  outro,
  signature,
}: {
  title: string;
  intro: string[];
  rows: SummaryRow[];
  outro?: string;
  signature?: string;
}) {
  return [
    title,
    "",
    ...intro,
    "",
    ...rows.map((r) => `${r.label}: ${r.value}`),
    "",
    outro ?? "",
    signature ?? "",
  ]
    .join("\n")
    .trim();
}
