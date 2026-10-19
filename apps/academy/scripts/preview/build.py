"""Genera una previsualització estàtica (HTML) de la Fase 1 amb el mateix disseny que apps/academy."""
import re, sys

import os
BRAND = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "public", "brand") + "/"
OUT = sys.argv[1]

def svg(name, cls):
    s = open(BRAND + name).read().strip()
    s = re.sub(r"<title>.*?</title>", "", s)
    return s.replace("<svg ", f'<svg class="{cls}" ', 1)

ICONS = {
    "arrow": '<path d="M4 12h15m-6-6 6 6-6 6"/>',
    "racket": '<rect x="6" y="2.5" width="11" height="13" rx="5.5"/><path d="M11.5 15.5v6"/>',
    "bed": '<path d="M3 18V6m0 7h18v5M3 13V9h7a3 3 0 0 1 3 3v1M21 13v-1a3 3 0 0 0-3-3h-5"/>',
    "meal": '<path d="M6 3v8a2 2 0 0 0 2 2v8M10 3v8a2 2 0 0 1-2 2M8 3v6M17 21V3c-2 1-3 4-3 7v3h3"/>',
    "chart": '<path d="M4 20V10m6 10V4m6 16v-7m4 7H2"/>',
    "clock": '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    "moon": '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z"/>',
    "users": '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.6a3.5 3.5 0 0 1 0 6.8M18 14.5a6.5 6.5 0 0 1 3.5 5.5"/>',
    "check": '<path d="m4.5 12.5 5 5 10-11"/>',
    "calendar": '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4m8-4v4"/>',
}
WA = '<svg width="{s}" height="{s}" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor" class="{c}"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.4.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.2-.2-.5-.3Z"/></svg>'

def icon(n, s=22, c="", sw=1.8):
    if n == "whatsapp":
        return WA.format(s=s, c=c)
    return (f'<svg width="{s}" height="{s}" viewBox="0 0 24 24" aria-hidden="true" class="{c}" fill="none" stroke="currentColor" '
            f'stroke-width="{sw}" stroke-linecap="round" stroke-linejoin="round">{ICONS[n]}</svg>')

def ball(s=16, c=""):
    return (f'<svg width="{s}" height="{s}" viewBox="0 0 20 20" aria-hidden="true" class="{c}"><circle cx="10" cy="10" r="9.5" fill="#d6ff2e"/>'
            '<path d="M1.6 6.2Q10 10.8 18.4 6.2M1.6 13.8Q10 9.2 18.4 13.8" fill="none" stroke="#0b0b0b" stroke-width="1.4" stroke-linecap="round"/></svg>')

def button(label, variant="primary", surface="dark", ic="arrow", size="md"):
    base = ("group ps-skew inline-flex items-center justify-center rounded-[4px] font-display font-extrabold uppercase tracking-[0.12em] "
            "transition-[transform,box-shadow,background-color,color] duration-300 ease-brand min-h-12")
    pad = "px-8 py-4 text-sm sm:text-base" if size == "lg" else "px-6 py-3 text-xs sm:text-sm"
    look = ("bg-lime text-ink hover:shadow-[0_10px_32px_-8px_rgba(214,255,46,0.65)] hover:-translate-y-0.5" if variant == "primary"
            else "border-2 border-paper text-paper hover:bg-paper hover:text-ink" if surface == "dark"
            else "border-2 border-ink text-ink hover:bg-ink hover:text-paper")
    i = icon(ic, 18, "transition-transform duration-300 ease-brand group-hover:translate-x-1", 2.4) if ic else ""
    return f'<button type="button" class="{base} {pad} {look}"><span class="ps-unskew inline-flex items-center gap-3">{label}{i}</span></button>'

def skewtag(text, tone="ink", extra=""):
    look = {"ink": "bg-ink text-lime", "lime": "bg-lime text-ink", "paper": "bg-paper text-ink"}[tone]
    return f'<span class="ps-skew inline-block rounded-[3px] px-3 py-1.5 {look} {extra}"><span class="ps-unskew ps-eyebrow">{text}</span></span>'

def badge(fmt):
    dot = "size-2 rounded-full bg-lime" if fmt == "weekend" else "size-2 rotate-45 bg-lime"
    label = "Cap de setmana" if fmt == "weekend" else "Stage 4 dies"
    return skewtag(f'<span class="inline-flex items-center gap-2"><span aria-hidden="true" class="{dot}"></span>{label}</span>')

LIMEBAR = '<div aria-hidden="true" class="h-2 w-full bg-lime"></div>'
DAYS = [("fri", "Dv"), ("sat", "Ds"), ("sun", "Dg"), ("mon", "Dl")]

def daystrip(active):
    lis = "".join(
        f'<li class="ps-skew grid h-11 w-12 place-items-center rounded-[3px] font-display text-sm font-extrabold uppercase '
        f'{"bg-lime text-ink" if k in active else "border border-paper/25 text-paper/45"}"><span class="ps-unskew">{l}</span></li>'
        for k, l in DAYS)
    return f'<ul class="flex gap-2">{lis}</ul>'

def counter(v, suffix, cls):
    return f'<span class="{cls}" data-count="{v}" data-suffix="{suffix}">{v}{suffix}</span>'

WM = "Dinar i sopar de dissabte, esmorzar i dinar de diumenge"
SM = "Pensió completa de divendres (sopar) a dilluns (dinar)"
PACKS = [
    ("weekend", "Clinic Essential", 8, 1, "El teu primer cap de setmana de pàdel de veritat.", WM, "Iniciació · Intermedi", False),
    ("weekend", "Clinic Focus", 14, 1, "Un cop, un cap de setmana, un abans i un després.", WM, "Intermedi · Avançat", True),
    ("weekend", "Clinic Max", 20, 1, "20 hores. Dos dies. Zero excuses.", WM, "Avançat · Competició", False),
    ("stage", "Stage Base", 16, 3, "Quatre dies per millorar-ho tot, amb temps per gaudir.", SM, "Iniciació · Intermedi", False),
    ("stage", "Stage Performance", 24, 3, "Prepara't per competir com mai ho havies fet.", SM, "Intermedi · Avançat · Competició", True),
    ("stage", "Stage Elite", 30, 3, "30 hores al límit. Per a qui ho vol tot.", SM, "Avançat · Competició", False),
]

def packcard(p):
    fmt, name, h, n, tag, meals, lv, feat = p
    rows = [("moon", f"{n} nit" if n == 1 else f"{n} nits"), ("meal", meals), ("users", "Màx. 4 jugadors per grup"), ("chart", f"Nivell: {lv}")]
    lis = "".join(f'<li class="flex gap-3">{icon(i, 18, "mt-0.5 shrink-0 text-lime")}<span>{t}</span></li>' for i, t in rows)
    star = '<span class="ps-eyebrow text-lime">★</span>' if feat else ""
    return f'''<article class="flex h-full flex-col overflow-hidden rounded-brand bg-graphite text-paper">
<div class="flex flex-1 flex-col gap-6 p-6 sm:p-7">
<div class="flex items-start justify-between gap-4">{badge(fmt)}{star}</div>
<div><p class="font-display text-giant font-black italic text-lime">{h}<span class="text-[0.45em] align-top">h</span></p>
<p class="ps-eyebrow mt-2 text-paper/70">hores de pàdel</p></div>
<div><h3 class="font-display text-title font-black uppercase italic">{name}</h3><p class="mt-2 text-paper/80">{tag}</p></div>
<ul class="space-y-3 text-sm text-paper/85">{lis}</ul>
<div class="mt-auto flex flex-wrap items-end justify-between gap-4 border-t border-paper/15 pt-5">
<p><span class="ps-eyebrow block text-paper/60">des de</span><span class="font-display text-3xl font-black italic">XXX €</span><span class="ml-1 text-sm text-paper/60">per persona</span></p>
{button("Veure el pack")}</div></div>{LIMEBAR}</article>'''

def formatcard(fmt):
    name, summ, days, mx = (("Clinic cap de setmana", "Dissabte i diumenge de clínics temàtics per polir el teu joc.", ["sat", "sun"], 20)
                            if fmt == "weekend" else
                            ("Stage intensiu", "De divendres a dilluns: immersió total per fer un salt de nivell.", ["fri", "sat", "sun", "mon"], 30))
    return f'''<article class="relative flex h-full flex-col overflow-hidden rounded-brand bg-ink text-paper">
<div class="flex flex-1 flex-col gap-7 p-7 sm:p-10"><div class="self-start">{badge(fmt)}</div>
<div><h3 class="font-display text-display font-black uppercase italic">{name}</h3><p class="mt-3 max-w-md text-lg text-paper/80">{summ}</p></div>
{daystrip(days)}
<div class="mt-auto flex flex-wrap items-end justify-between gap-6"><p>{counter(mx, "h", "font-display text-giant font-black italic text-lime")}
<span class="ps-eyebrow mt-2 block text-paper/70">Fins a {mx}h de pàdel</span></p>{button("Descobreix els packs", size="lg")}</div></div>{LIMEBAR}</article>'''

def section(title, body, dark=False):
    cls = "bg-ink text-paper" if dark else "bg-paper text-ink"
    return f'''<section class="{cls}"><div class="wrap mx-auto max-w-6xl py-16 sm:py-20">
<div class="mb-10 flex items-center gap-4">{ball(18)}<h2 class="font-display text-title font-black uppercase italic">{title}</h2></div>
{body}</div></section>'''

COLORS = [("ink", "#0B0B0B", "Fons de seccions fosques, text", "bg-ink", "text-paper"),
          ("lime", "#D6FF2E", "Accent únic: CTA, ressaltats, franges, xifres", "bg-lime", "text-ink"),
          ("paper", "#FFFFFF", "Fons clar, text sobre negre", "bg-paper", "text-ink"),
          ("stone", "#ECECE7", "Fons secundari càlid", "bg-stone", "text-ink"),
          ("graphite", "#1A1A1A", "Targetes sobre fons negre", "bg-graphite ring-1 ring-inset ring-paper/10", "text-paper"),
          ("mute", "#8A8A85", "Text secundari sobre negre", "bg-mute", "text-ink")]

colors = "".join(f'''<div class="overflow-hidden rounded-brand bg-graphite"><div class="flex h-28 items-end p-4 {s} {t}">
<span class="font-display text-xl font-black italic">{k}</span></div><div class="p-4 text-sm"><p class="font-mono text-lime">{h}</p>
<p class="mt-1 text-paper/75">{u}</p></div></div>''' for k, h, u, s, t in COLORS)

EB = lambda t, c="": f'<p class="ps-eyebrow {c}">{t}</p>'

typo = f'''<div class="space-y-10">
<div>{EB("Hero · Archivo 900 cursiva", "mb-3 text-mute-strong")}<p class="font-display text-hero font-black uppercase italic">Entrena com un pro.</p></div>
<div>{EB("Display · Archivo 900 cursiva", "mb-3 text-mute-strong")}<p class="font-display text-display font-black uppercase italic">Tria el teu format</p></div>
<div>{EB("Títol · Archivo 900", "mb-3 text-mute-strong")}<p class="font-display text-title font-black uppercase">Què inclou cada experiència</p></div>
<div>{EB("Eyebrow · Archivo 600, tracking 0.25em", "mb-3 text-mute-strong")}{EB("Places limitades per cap de setmana")}</div>
<div class="max-w-2xl">{EB("Cos · Inter 400/500", "mb-3 text-mute-strong")}<p class="text-lg">Allotjament, àpats i hores de pàdel en un sol pack. Tu només has de venir a jugar: nosaltres ens encarreguem de la resta perquè cada minut a pista compti.</p></div></div>'''

buttons = f'''<div class="flex flex-wrap items-center gap-5">{button("Demana la teva plaça", size="lg")}{button("Descobreix els packs")}
{button("Parla amb nosaltres", "secondary")}{button("WhatsApp", "secondary", ic="whatsapp")}</div>
<div class="mt-8 flex flex-wrap items-center gap-5 rounded-brand bg-paper p-6">{button("Primari sobre blanc")}{button("Secundari sobre blanc", "secondary", "light")}</div>'''

icons = "".join(f'<li class="grid size-14 place-items-center rounded-brand bg-ink text-lime" title="{n}">{icon(n)}</li>'
                for n in ["racket", "bed", "meal", "chart", "clock", "moon", "users", "calendar", "check", "arrow", "whatsapp"])

elements = f'''<div class="grid gap-10 md:grid-cols-2">
<div class="space-y-4">{EB("Badges de format", "text-mute-strong")}<div class="flex flex-wrap gap-3">{badge("weekend")}{badge("stage")}</div></div>
<div class="space-y-4">{EB("Etiquetes inclinades", "text-mute-strong")}<div class="flex flex-wrap gap-3">{skewtag("Poques places")}{skewtag("Nou", "lime")}{skewtag("Complet", "paper", "ring-1 ring-ink/20")}</div></div>
<div class="space-y-4">{EB("Calendari de dies", "text-mute-strong")}<div class="space-y-3 rounded-brand bg-ink p-5">{daystrip(["sat", "sun"])}{daystrip(["fri", "sat", "sun", "mon"])}</div></div>
<div class="space-y-4">{EB("Franja, separador i pilota", "text-mute-strong")}<div class="space-y-5">{LIMEBAR}
<div class="flex h-12 items-center gap-5"><span class="font-display font-black italic">PS</span><span aria-hidden="true" class="inline-block w-[3px] self-stretch bg-current"></span><span class="ps-eyebrow">Padel System Academy</span></div>
<div class="flex items-center gap-4">{ball(12)}{ball(20)}{ball(32)}{ball(48)}</div></div></div>
<div class="space-y-4 md:col-span-2">{EB("Icones", "text-mute-strong")}<ul class="flex flex-wrap gap-3">{icons}</ul></div></div>'''

logos = f'''<div class="grid gap-4 sm:grid-cols-2">
<div class="grid min-h-48 place-items-center rounded-brand bg-paper p-8 ring-1 ring-ink/10">{svg("ps-logo-horizontal.svg", "w-full max-w-sm")}</div>
<div class="grid min-h-48 place-items-center rounded-brand bg-ink p-8">{svg("ps-logo-horizontal-negative.svg", "w-full max-w-sm")}</div>
<div class="grid min-h-48 place-items-center rounded-brand bg-stone p-8">{svg("ps-mark.svg", "w-40")}</div>
<div class="grid min-h-48 place-items-center rounded-brand bg-stone p-8">{svg("ps-icon.svg", "size-32")}</div></div>
<p class="mt-4 text-sm text-mute-strong">Fitxers SVG a <code>public/brand/</code>: horitzontal, horitzontal negatiu, marca, marca negativa i icona d'app.</p>'''

figures = "".join(f'<div>{counter(v, s, "font-display text-giant font-black italic")}<p class="ps-eyebrow mt-2">{l}</p></div>'
                  for v, s, l in [(20, "h", "en un cap de setmana"), (30, "h", "en 4 dies"), (2, "", "dies de clinic"), (4, "", "dies de stage")])

html = f'''<title>Padel System Academy</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:ital,wght@0,600..900;1,600..900&family=Inter:wght@400;500;600&display=swap">
<script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4.1.4"></script>
<style type="text/tailwindcss">
/* Mateixos tokens que apps/academy/src/app/globals.css · disseny d'un sol món (negre + llima de la marca) */
@theme {{
  --color-ink: #0b0b0b; --color-lime: #d6ff2e; --color-paper: #ffffff; --color-stone: #ecece7;
  --color-graphite: #1a1a1a; --color-mute: #8a8a85; --color-mute-strong: #5f5f5a;
  --text-hero: clamp(3rem, 9vw, 7.5rem); --text-hero--line-height: 0.92;
  --text-display: clamp(2.25rem, 5.5vw, 4.5rem); --text-display--line-height: 0.95;
  --text-title: clamp(1.75rem, 3.2vw, 2.75rem); --text-title--line-height: 1.05;
  --text-giant: clamp(4.5rem, 12vw, 10rem); --text-giant--line-height: 0.85;
  --tracking-brand: 0.25em; --radius-brand: 10px; --ease-brand: cubic-bezier(0.22, 1, 0.36, 1);
  --font-display: "Archivo", "Arial Black", sans-serif; --font-sans: "Inter", system-ui, sans-serif;
}}
@layer base {{
  :root {{ color-scheme: light; }}
  body {{ background: var(--color-paper); color: var(--color-ink); font-family: var(--font-sans); -webkit-font-smoothing: antialiased; }}
  h1, h2, h3 {{ text-wrap: balance; }}
  :focus-visible {{ outline: 3px solid var(--color-lime); outline-offset: 3px; box-shadow: 0 0 0 6px var(--color-ink); }}
}}
@layer components {{
  .ps-skew {{ transform: skewX(-12deg); }}
  .ps-unskew {{ display: inline-block; transform: skewX(12deg); }}
  .ps-eyebrow {{ font-family: var(--font-display); font-weight: 600; text-transform: uppercase; letter-spacing: var(--tracking-brand); font-size: 0.75rem; line-height: 1.2; }}
  .wrap {{ padding-left: max(20px, env(safe-area-inset-left, 0px)); padding-right: max(20px, env(safe-area-inset-right, 0px)); }}
}}
@media (prefers-reduced-motion: reduce) {{ *, *::before, *::after {{ transition-duration: 0.01ms !important; animation-duration: 0.01ms !important; }} }}
</style>

<div class="bg-ink text-paper">
  <div class="wrap mx-auto max-w-6xl py-3"><p class="ps-eyebrow text-paper/60">Previsualització de la Fase 1 · mateix disseny que el codi de <span class="text-lime">apps/academy</span></p></div>
</div>

<main>
<section class="bg-ink text-paper">
  <div class="wrap mx-auto flex max-w-6xl flex-col gap-10 py-16 sm:py-24">
    {svg("ps-logo-horizontal-negative.svg", "w-64 sm:w-80")}
    <p class="ps-eyebrow text-lime">Inici provisional · Web en construcció</p>
    <h1 class="max-w-4xl font-display text-hero font-black uppercase italic">Entrena com un pro. Viu-ho com una experiència.</h1>
    <p class="max-w-xl text-lg text-paper/80">Estem preparant la nova web de Padel System Academy. Mentrestant, aquí tens el sistema de disseny complet.</p>
    <div class="flex flex-wrap gap-4">{button("Descobreix els packs", size="lg")}{button("Parla amb nosaltres", "secondary", size="lg")}</div>
  </div>
  {LIMEBAR}
</section>

{section("Logo", logos)}
{section("Colors", f'<div class="grid grid-cols-2 gap-4 md:grid-cols-3">{colors}</div><p class="mt-6 max-w-2xl text-paper/80"><strong class="text-lime">Regla d\'or:</strong> el llima és escàs i valuós. Només per a accions i dades clau, i sempre sobre negre: mai text llarg en llima sobre blanc.</p>', True)}
{section("Tipografia", typo)}
{section("Botons", buttons, True)}
{section("Elements de marca", elements)}

<section class="bg-lime text-ink"><div class="wrap mx-auto grid max-w-6xl grid-cols-2 gap-8 py-14 md:grid-cols-4">{figures}</div></section>

{section("Targetes de format", f'<div class="grid gap-5 lg:grid-cols-2">{formatcard("weekend")}{formatcard("stage")}</div>')}
{section("Targetes de pack", '<div class="grid gap-5 md:grid-cols-2 lg:grid-cols-3">' + "".join(packcard(p) for p in PACKS) + '</div><p class="mt-6 text-sm text-paper/70">Dades de <code>src/content/packs.ts</code>. Preus provisionals a "XXX €".</p>', True)}
</main>

<script>
// Comptadors 0 → valor quan entren a la pantalla (el valor final ja és visible sense JS)
(function () {{
  const els = document.querySelectorAll("[data-count]");
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) return;
  const io = new IntersectionObserver((entries) => {{
    entries.forEach((e) => {{
      if (!e.isIntersecting) return;
      io.unobserve(e.target);
      const el = e.target, to = +el.dataset.count, suf = el.dataset.suffix, t0 = performance.now(), d = 1200;
      const tick = (t) => {{
        const p = Math.min(1, (t - t0) / d), v = Math.round(to * (1 - Math.pow(1 - p, 3)));
        el.textContent = v + suf;
        if (p < 1) requestAnimationFrame(tick);
      }};
      requestAnimationFrame(tick);
    }});
  }}, {{ rootMargin: "-40px" }});
  els.forEach((el) => io.observe(el));
}})();
</script>
'''
open(OUT, "w").write(html)
print("ok", len(html))
