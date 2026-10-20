"""Ús: python3 scripts/preview/build_site.py <sortida.html>

Previsualització estàtica de la web (Fase 2): Home + layout als 3 idiomes, i l'styleguide.

Llegeix els textos de apps/academy/messages/*.json i els packs de src/content/packs.ts,
perquè la previsualització mostri exactament el contingut del codi.
"""
import json, re, runpy, sys, html as H

import os
HERE = os.path.dirname(os.path.abspath(__file__)) + "/"
APP = os.path.join(HERE, "..", "..") + "/"
OUT = sys.argv[1]
SCR = HERE
LOCS = ["ca", "es", "en"]
MSG = {l: json.load(open(f"{APP}messages/{l}.json")) for l in LOCS}

# ── Helpers de la Fase 1 (icones, botons, badges…) ──
sys.argv = ["build.py", SCR + "_styleguide_tmp.html"]
B = runpy.run_path(SCR + "build.py")
icon, ball, LIMEBAR = B["icon"], B["ball"], B["LIMEBAR"]

def T(loc, key, **kw):
    v = MSG[loc]
    for k in key.split("."):
        v = v[k]
    for a, b in kw.items():
        v = v.replace("{" + a + "}", str(b))
    return H.escape(v)

def nights(loc, n):
    s = MSG[loc]["common"]["nights"]
    one = re.search(r"one \{# ([^}]*)\}", s).group(1)
    other = re.search(r"other \{# ([^}]*)\}", s).group(1)
    return f"{n} {one if n == 1 else other}"

# ── Packs llegits de src/content/packs.ts ──
src = open(APP + "src/content/packs.ts").read()
def loc_obj(txt):
    m = re.search(r'\{\s*ca:\s*"([^"]*)",\s*es:\s*"([^"]*)",\s*en:\s*"([^"]*)"\s*,?\s*\}', txt, re.S)
    return dict(zip(LOCS, m.groups()))
consts = {}
for name in ("WEEKEND_MEALS", "STAGE_MEALS"):
    blk = re.search(name + r" = (\{.*?\});", src, re.S).group(1)
    consts[name] = loc_obj(blk)
packs_src = src[src.index("export const PACKS"):src.index("export const EXTRAS")]
PACKS = []
for blk in re.split(r"\n  \{\n", packs_src)[1:]:
    g = lambda k: re.search(k + r':\s*"?([^",\n]+)"?,', blk).group(1)
    PACKS.append({
        "slug": g("slug"), "format": g("format"), "name": g("name"), "hours": int(g("hours")), "nights": int(g("nights")),
        "tagline": loc_obj(blk[blk.index("tagline"):]), "meals": consts[g("meals")],
        "levels": re.findall(r'"(\w+)"', re.search(r"levels: \[([^\]]*)\]", blk).group(1)),
        "max": int(g("maxPlayersPerGroup")), "featured": "featured: true" in blk,
    })
FORMATS = {"weekend": (["sat", "sun"], 20, "cap-de-setmana"), "stage": (["fri", "sat", "sun", "mon"], 30, "stage-4-dies")}

# ── Components ──
def button(label, variant="primary", surface="dark", ic="arrow", size="md", href="#", extra=""):
    base = ("group ps-skew inline-flex items-center justify-center rounded-[4px] font-display font-extrabold uppercase tracking-[0.12em] "
            "transition-[transform,box-shadow,background-color,color] duration-300 ease-brand min-h-12")
    pad = "px-8 py-4 text-sm sm:text-base" if size == "lg" else "px-6 py-3 text-xs sm:text-sm"
    look = ("bg-lime text-ink hover:shadow-[0_10px_32px_-8px_rgba(214,255,46,0.65)] hover:-translate-y-0.5" if variant == "primary"
            else "border-2 border-paper text-paper hover:bg-paper hover:text-ink" if surface == "dark"
            else "border-2 border-ink text-ink hover:bg-ink hover:text-paper")
    i = icon(ic, 18, "transition-transform duration-300 ease-brand group-hover:translate-x-1", 2.4) if ic else ""
    return f'<a href="{href}" class="{base} {pad} {look} {extra}"><span class="ps-unskew inline-flex items-center gap-3">{label}{i}</span></a>'

def skewtag(text, tone="ink", extra=""):
    look = {"ink": "bg-ink text-lime", "lime": "bg-lime text-ink", "paper": "bg-paper text-ink"}[tone]
    return f'<span class="ps-skew inline-block rounded-[3px] px-3 py-1.5 {look} {extra}"><span class="ps-unskew ps-eyebrow">{text}</span></span>'

def badge(loc, fmt, extra=""):
    dot = "size-2 rounded-full bg-lime" if fmt == "weekend" else "size-2 rotate-45 bg-lime"
    return skewtag(f'<span class="inline-flex items-center gap-2"><span aria-hidden="true" class="{dot}"></span>{T(loc, f"formats.{fmt}.badge")}</span>', extra=extra)

def daystrip(loc, active):
    return '<ul class="flex gap-2">' + "".join(
        f'<li class="ps-skew grid h-11 w-12 place-items-center rounded-[3px] font-display text-sm font-extrabold uppercase '
        f'{"bg-lime text-ink" if d in active else "border border-paper/25 text-paper/45"}"><span class="ps-unskew">{T(loc, "days." + d)}</span></li>'
        for d in ["fri", "sat", "sun", "mon"]) + "</ul>"

def counter(v, suf, cls):
    return f'<span class="{cls}" data-count="{v}" data-suffix="{suf}">{v}{suf}</span>'

def photo(loc, label, cls="", gray=False):
    return f'''<div role="img" aria-label="{T(loc, 'photo.replace')}: {label}" class="ps-photo relative overflow-hidden bg-graphite {"grayscale" if gray else ""} {cls}">
<svg aria-hidden="true" class="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice" viewBox="0 0 400 300"><rect width="400" height="300" fill="url(#ps-photo-light)"/>
<g fill="none" stroke="#fff" stroke-opacity=".14" stroke-width="2"><path d="M60 290 L140 40 L260 40 L340 290 Z"/><path d="M100 165 L300 165" stroke-opacity=".3" stroke-width="3"/><path d="M120 103 L280 103 M80 228 L320 228 M200 103 L200 228"/></g>
<circle cx="300" cy="70" r="12" fill="#d6ff2e" fill-opacity=".85"/></svg>
<span class="ps-eyebrow absolute bottom-3 left-3 rounded-[3px] bg-ink/80 px-2 py-1 text-[0.65rem] text-paper/80">{T(loc, 'photo.replace')} · {label}</span></div>'''

def heading(loc, eb, title, intro=None, dark=False, extra=""):
    i = f'<p class="mt-5 max-w-2xl text-lg {"text-paper/75" if dark else "text-mute-strong"}">{intro}</p>' if intro else ""
    return (f'<div class="max-w-3xl {extra}"><p class="ps-eyebrow flex items-center gap-3 {"text-lime" if dark else "text-ink"}">{ball(14)}{eb}</p>'
            f'<h2 class="mt-4 font-display text-display font-black uppercase italic">{title}</h2>{i}</div>')

def packcard(loc, p):
    lv = " · ".join(T(loc, "levels." + l) for l in p["levels"])
    rows = [("moon", nights(loc, p["nights"])), ("meal", H.escape(p["meals"][loc])),
            ("users", T(loc, "common.spotsPerGroup").replace("{count, plural, one {# nit} other {# nits}}", "").replace("{count}", str(p["max"]))),
            ("chart", f'{T(loc, "common.level")}: {lv}')]
    lis = "".join(f'<li class="flex gap-3">{icon(i, 18, "mt-0.5 shrink-0 text-lime")}<span>{t}</span></li>' for i, t in rows)
    star = '<span class="ps-eyebrow text-lime">★</span>' if p["featured"] else ""
    return f'''<article data-format="{p["format"]}" class="flex h-full flex-col overflow-hidden rounded-brand bg-graphite text-paper">
<div class="flex flex-1 flex-col gap-6 p-6 sm:p-7"><div class="flex items-start justify-between gap-4">{badge(loc, p["format"])}{star}</div>
<div><p class="font-display text-giant font-black italic text-lime">{p["hours"]}<span class="text-[0.45em] align-top">h</span></p><p class="ps-eyebrow mt-2 text-paper/70">{T(loc, "common.hoursOfPadel")}</p></div>
<div><h3 class="font-display text-title font-black uppercase italic">{p["name"]}</h3><p class="mt-2 text-paper/80">{H.escape(p["tagline"][loc])}</p></div>
<ul class="space-y-3 text-sm text-paper/85">{lis}</ul>
<div class="mt-auto flex flex-wrap items-end justify-between gap-4 border-t border-paper/15 pt-5"><p><span class="ps-eyebrow block text-paper/60">{T(loc, "common.from")}</span><span class="font-display text-3xl font-black italic">XXX €</span><span class="ml-1 text-sm text-paper/60">{T(loc, "common.perPerson")}</span></p>
{button(T(loc, "common.viewPack"), href="#", extra="js-soon")}</div></div>{LIMEBAR}</article>'''

def formatcard(loc, fmt):
    days, mx, _ = FORMATS[fmt]
    return f'''<article class="relative flex h-full flex-col overflow-hidden rounded-brand bg-ink text-paper"><div class="flex flex-1 flex-col gap-7 p-7 sm:p-10">
<div class="self-start">{badge(loc, fmt)}</div><div><h3 class="font-display text-display font-black uppercase italic">{T(loc, f"formats.{fmt}.name")}</h3>
<p class="mt-3 max-w-md text-lg text-paper/80">{T(loc, f"formats.{fmt}.summary")}</p></div>{daystrip(loc, days)}
<div class="mt-auto flex flex-wrap items-end justify-between gap-6"><p>{counter(mx, "h", "font-display text-giant font-black italic text-lime")}
<span class="ps-eyebrow mt-2 block text-paper/70">{T(loc, f"formats.{fmt}.maxHours", hours=mx)}</span></p>{button(T(loc, "common.discoverPacks"), size="lg", href=f"#packs-{loc}")}</div></div>{LIMEBAR}</article>'''

LOGO_DARK = B["svg"]("ps-logo-horizontal-negative.svg", "LOGOCLS")
WRAP = "wrap mx-auto max-w-7xl"

def header(loc):
    t = lambda k: T(loc, "nav." + k)
    drop = "".join(f'<li><a href="#formats-{loc}" class="block rounded-[6px] p-4 hover:bg-ink">{badge(loc, f)}<span class="mt-3 block font-display text-lg font-black uppercase italic">{T(loc, f"formats.{f}.name")}</span></a></li>' for f in FORMATS)
    links = [("howItWorks", f"#metode-{loc}"), ("academy", f"#equip-{loc}"), ("facilities", f"#galeria-{loc}"), ("faq", f"#faq-{loc}")]
    nav = "".join(f'<a href="{h}" class="ps-eyebrow inline-flex min-h-11 items-center px-3 text-paper/90 hover:text-paper">{t(k)}</a>' for k, h in links)
    mob = "".join(f'<li><a href="{h}" class="js-close block py-2 font-display text-3xl font-black uppercase italic">{t(k)}</a></li>' for k, h in links)
    mobf = "".join(f'<a href="#formats-{loc}" class="js-close flex items-center justify-between gap-4 border-b border-paper/10 py-3"><span class="font-display text-3xl font-black uppercase italic">{T(loc, f"formats.{f}.name")}</span>{badge(loc, f, "shrink-0")}</a>' for f in FORMATS)
    return f'''<header class="js-header fixed inset-x-0 top-0 z-50 text-paper transition-[background-color,box-shadow] duration-300" style="top:env(safe-area-inset-top,0px)">
<div class="{WRAP} flex h-16 items-center justify-between gap-6 lg:h-20">
<a href="#top-{loc}" aria-label="{t('home')}" class="shrink-0">{LOGO_DARK.replace("LOGOCLS", "h-9 w-auto lg:h-11")}</a>
<nav aria-label="{t('menu')}" class="hidden items-center gap-1 lg:flex">
<div class="group relative"><button type="button" class="ps-eyebrow inline-flex min-h-11 items-center gap-2 px-3 text-paper/90 hover:text-paper">{t('experiences')}
<svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true" class="transition-transform group-hover:rotate-180 group-focus-within:rotate-180"><path d="M1 3l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.8"/></svg></button>
<div class="invisible absolute left-0 top-full w-80 pt-2 opacity-0 transition group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
<ul class="overflow-hidden rounded-brand bg-graphite p-2 shadow-2xl ring-1 ring-paper/10">{drop}<li><a href="#packs-{loc}" class="ps-eyebrow block rounded-[6px] p-4 text-lime hover:bg-ink">{t('allExperiences')} →</a></li></ul></div></div>
{nav}</nav>
<div class="hidden items-center gap-4 lg:flex">{langs(loc)}{button(t('book'), href=f"#reserva-{loc}")}</div>
<button type="button" class="js-burger grid size-12 place-items-center lg:hidden" aria-expanded="false" aria-label="{t('openMenu')}" data-open="{t('openMenu')}" data-close="{t('closeMenu')}">
<span aria-hidden="true" class="relative block h-4 w-7"><span class="b1 absolute left-0 top-0 h-[3px] w-7 bg-paper transition-transform"></span><span class="b2 absolute left-0 top-1.5 h-[3px] w-5 bg-lime transition-opacity"></span><span class="b3 absolute left-0 top-3 h-[3px] w-7 bg-paper transition-transform"></span></span></button>
</div></header>
<div class="js-menu fixed inset-0 z-40 overflow-y-auto bg-ink pt-16 text-paper lg:hidden" hidden>
<nav aria-label="{t('menu')}" class="wrap flex min-h-full flex-col gap-8 pb-32 pt-8"><div class="space-y-3"><p class="ps-eyebrow text-paper/60">{t('experiences')}</p>{mobf}
<a href="#packs-{loc}" class="js-close ps-eyebrow inline-block py-2 text-lime">{t('allExperiences')} →</a></div><ul class="space-y-1">{mob}</ul>{langs(loc)}</nav></div>'''

def langs(loc):
    return ('<div role="group" class="flex items-center gap-1">' + "".join(
        f'<button type="button" data-lang="{l}" class="ps-eyebrow min-h-10 min-w-10 rounded-[3px] px-2 transition-colors {"bg-paper text-ink" if l == loc else "text-paper/70 hover:text-paper"}">{l}</button>'
        for l in LOCS) + "</div>")

def wa_href(loc):
    from urllib.parse import quote
    return "https://wa.me/34640226321?text=" + quote(MSG[loc]["contact"]["whatsappGeneric"])

def footer(loc):
    t = lambda k: T(loc, "footer." + k)
    lk = "text-paper/85 hover:text-lime"
    ex = "".join(f'<li><a href="#formats-{loc}" class="{lk}">{T(loc, f"formats.{f}.name")}</a></li>' for f in FORMATS)
    ex += "".join(f'<li><a href="{h}" class="{lk}">{T(loc, "nav." + k)}</a></li>' for k, h in [("howItWorks", f"#metode-{loc}"), ("academy", f"#equip-{loc}"), ("facilities", f"#galeria-{loc}"), ("faq", f"#faq-{loc}")])
    wa = "".join(f'<li><a href="https://wa.me/{n}" target="_blank" rel="noopener noreferrer" class="{lk} inline-flex items-center gap-2">{icon("whatsapp", 18, "text-lime")}{d}</a></li>'
                 for n, d in [("34640226321", "640 226 321"), ("34643448859", "643 448 859")])
    return f'''<footer class="bg-ink text-paper">{LIMEBAR}<div class="{WRAP} grid gap-12 pb-32 pt-16 md:grid-cols-2 md:pb-16 lg:grid-cols-4">
<div class="space-y-5">{LOGO_DARK.replace("LOGOCLS", "w-56")}<p class="max-w-xs text-paper/75">{t("tagline")}</p><p class="ps-eyebrow text-paper/60">Maresme · El Masnou · Montgat</p></div>
<div><h2 class="ps-eyebrow mb-4 text-paper/60">{t("contact")}</h2><ul class="space-y-3"><li><span class="select-all break-all text-paper/85">marc.lis94@gmail.com</span></li>{wa}</ul>
<div class="mt-6 grid aspect-[16/9] max-w-full place-items-center rounded-brand border border-dashed border-paper/20 p-4 text-center text-sm text-paper/55">{t("mapSoon")}</div></div>
<div><h2 class="ps-eyebrow mb-4 text-paper/60">{t("explore")}</h2><ul class="space-y-3">{ex}</ul></div>
<div class="space-y-8"><div><h2 class="ps-eyebrow mb-4 text-paper/60">{t("legal")}</h2><ul class="space-y-3"><li><span class="text-paper/60">{t("legalNotice")}</span></li><li><span class="text-paper/60">{t("privacy")}</span></li><li><span class="text-paper/60">{t("cookies")}</span></li></ul></div>
<div><h2 class="ps-eyebrow mb-4 text-paper/60">{T(loc, "nav.language")}</h2><div class="-ml-2">{langs(loc)}</div></div>
<div><a href="#styleguide" class="ps-eyebrow text-lime underline underline-offset-4">Styleguide →</a></div></div></div>
<div class="border-t border-paper/10"><p class="{WRAP} py-6 text-sm text-paper/55">© 2026 Padel System Academy. {t("rights")}</p></div></footer>
<a href="{wa_href(loc)}" target="_blank" rel="noopener noreferrer" aria-label="{T(loc, "common.whatsapp")}" class="fixed z-40 hidden size-14 place-items-center rounded-full bg-lime text-ink shadow-[0_10px_32px_-8px_rgba(0,0,0,0.6)] transition-transform hover:scale-105 md:grid" style="right:calc(24px + env(safe-area-inset-right,0px));bottom:calc(24px + env(safe-area-inset-bottom,0px))">{icon("whatsapp", 28)}</a>
<div class="fixed inset-x-0 bottom-0 z-40 border-t border-paper/10 bg-ink/95 pt-3 backdrop-blur md:hidden" style="padding-bottom:max(12px,env(safe-area-inset-bottom));padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px))">
<div class="flex gap-3"><a href="#reserva-{loc}" class="ps-skew flex min-h-12 flex-1 items-center justify-center rounded-[4px] bg-lime font-display text-sm font-extrabold uppercase tracking-[0.12em] text-ink"><span class="ps-unskew inline-flex items-center gap-2">{T(loc, "nav.book")}{icon("arrow", 18, "", 2.4)}</span></a>
<a href="{wa_href(loc)}" target="_blank" rel="noopener noreferrer" aria-label="{T(loc, "common.whatsapp")}" class="ps-skew grid min-h-12 w-14 place-items-center rounded-[4px] border-2 border-paper text-paper"><span class="ps-unskew">{icon("whatsapp", 24)}</span></a></div></div>'''

def home(loc):
    t = lambda k, **kw: T(loc, "home." + k, **kw)
    tc = lambda k: T(loc, "common." + k)
    tp = lambda k: T(loc, "photo." + k)
    inc = "".join(f'''<li class="bg-paper p-7"><span class="ps-skew grid size-14 place-items-center rounded-[4px] bg-ink text-lime"><span class="ps-unskew">{icon(i, 26)}</span></span>
<h3 class="mt-6 font-display text-2xl font-black uppercase italic">{t("includes." + k)}</h3><p class="mt-3 text-mute-strong">{t("includes." + k + "Text")}</p></li>'''
                  for i, k in [("racket", "padel"), ("bed", "stay"), ("meal", "meals"), ("chart", "tracking")])
    steps = "".join(f'''<li class="flex flex-col rounded-brand bg-ink p-7 text-paper"><span class="font-display text-7xl font-black italic text-lime" aria-hidden="true">{n}</span>
<h3 class="mt-4 font-display text-2xl font-black uppercase italic">{t(f"method.s{n}")}</h3><p class="mt-3 text-paper/75">{t(f"method.s{n}Text")}</p></li>''' for n in range(1, 5))
    padel = {"t0930", "t1200", "t1630", "t1830"}
    dayl = "".join(f'''<li class="relative pb-6 pl-8 last:pb-0"><span aria-hidden="true" class="absolute -left-[9px] top-1.5 size-4 rounded-full {"bg-lime ring-2 ring-ink" if k in padel else "bg-ink"}"></span>
<p class="flex flex-wrap items-baseline gap-x-4 gap-y-1"><span class="w-16 font-display text-xl font-black italic tabular-nums">{tm}</span><span class="text-lg {"font-semibold" if k in padel else "text-mute-strong"}">{t("day." + k)}</span>
{skewtag(t("includes.padel"), extra="text-[0.6rem]") if k in padel else ""}</p></li>'''
                   for tm, k in [("08:00", "t0800"), ("09:00", "t0900"), ("09:30", "t0930"), ("12:00", "t1200"), ("13:30", "t1330"), ("15:00", "t1500"), ("16:30", "t1630"), ("18:30", "t1830"), ("21:00", "t2100")])
    team = "".join(f'''<li class="group overflow-hidden rounded-brand bg-graphite">{photo(loc, tp("coach"), "aspect-[4/5] w-full transition-[filter] duration-500 group-hover:grayscale-0", True)}
<div class="p-6"><p class="font-display text-2xl font-black uppercase italic">[Nom]</p><p class="ps-eyebrow mt-2 text-lime">{t("team." + r)}</p><p class="mt-3 text-sm text-paper/60">{t("team.placeholder")}</p></div></li>''' for r in ["role1", "role2", "role3"])
    testi = "".join(f'''<li><figure class="flex h-full flex-col gap-6 rounded-brand border-2 border-dashed border-ink/25 p-7"><div class="flex items-center justify-between"><p aria-hidden="true">★★★★★</p>{skewtag(t("testimonials.example"))}</div>
<blockquote class="flex-1 text-lg italic text-mute-strong">{t("testimonials." + q)}</blockquote><figcaption class="ps-eyebrow">{t("testimonials.name")}</figcaption></figure></li>''' for q in ["q1", "q2", "q3"])
    gal = "".join(photo(loc, tp(k), f"{a} w-full break-inside-avoid rounded-brand mb-4") for k, a in
                  [("match", "aspect-[3/4]"), ("group", "aspect-square"), ("stay", "aspect-[4/3]"), ("detail", "aspect-square"), ("food", "aspect-[3/4]"), ("court", "aspect-[4/3]")])
    faq = "".join(f'''<details class="group py-2"><summary class="flex min-h-14 cursor-pointer list-none items-center justify-between gap-6 font-display text-lg font-extrabold uppercase italic [&::-webkit-details-marker]:hidden">{t(f"faq.q{n}")}
<span aria-hidden="true" class="ps-skew grid size-8 shrink-0 place-items-center rounded-[3px] bg-ink text-lime transition-transform group-open:rotate-45"><span class="ps-unskew text-xl leading-none">+</span></span></summary><p class="pb-4 pr-12 text-mute-strong">{t(f"faq.a{n}")}</p></details>''' for n in range(1, 6))
    filters = f'<button type="button" data-filter="all" aria-pressed="true" class="js-filter ps-skew min-h-11 rounded-[3px] px-5 transition-colors"><span class="ps-unskew ps-eyebrow">{t("packs.all")}</span></button>' + "".join(
        f'<button type="button" data-filter="{f}" aria-pressed="false" class="js-filter ps-skew min-h-11 rounded-[3px] px-5 transition-colors"><span class="ps-unskew ps-eyebrow">{T(loc, f"formats.{f}.badge")}</span></button>' for f in FORMATS)
    return f'''<main id="top-{loc}">
<section class="relative isolate overflow-hidden bg-ink text-paper">{photo(loc, tp("hero"), "absolute inset-0 -z-10 h-full w-full")}<div aria-hidden="true" class="absolute inset-0 -z-10 bg-ink/55"></div>
<div class="{WRAP} flex flex-col justify-end gap-8 pb-16 pt-32 sm:pb-20 sm:pt-40"><p class="ps-eyebrow text-lime">{t("hero.eyebrow")}</p>
<h1 class="max-w-5xl font-display text-hero font-black uppercase italic">{t("hero.title")}</h1><p class="max-w-xl text-lg text-paper/85 sm:text-xl">{t("hero.subtitle")}</p>
<div class="flex flex-wrap gap-4">{button(tc("discoverPacks"), size="lg", href=f"#packs-{loc}")}{button(tc("talkToUs"), "secondary", ic="whatsapp", size="lg", href=wa_href(loc))}</div>
<a href="#xifres-{loc}" class="ps-eyebrow mt-4 inline-flex items-center gap-3 self-start text-paper/70 hover:text-paper">{ball(18, "animate-bounce motion-reduce:animate-none")}{t("hero.scroll")}</a></div></section>
<section id="xifres-{loc}" class="bg-lime text-ink"><div class="{WRAP} grid grid-cols-2 gap-x-6 gap-y-10 py-12 lg:grid-cols-4">
<div>{counter(20, "h", "font-display text-giant font-black italic")}<p class="ps-eyebrow mt-2">{t("stats.weekend")}</p></div>
<div>{counter(30, "h", "font-display text-giant font-black italic")}<p class="ps-eyebrow mt-2">{t("stats.stage")}</p></div>
<div class="flex flex-col justify-end"><p class="font-display text-title font-black uppercase italic">{t("stats.allIn")}</p><p class="ps-eyebrow mt-2">{t("stats.allInSub")}</p></div>
<div class="flex flex-col justify-end"><p class="font-display text-title font-black uppercase italic">{t("stats.groups")}</p><p class="ps-eyebrow mt-2">{t("stats.groupsSub")}</p></div></div></section>
<section id="formats-{loc}" class="bg-stone"><div class="{WRAP} py-20 sm:py-28">{heading(loc, t("formats.eyebrow"), t("formats.title"), extra="mb-12")}
<div class="grid gap-5 lg:grid-cols-2">{formatcard(loc, "weekend")}{formatcard(loc, "stage")}</div></div></section>
<section class="bg-paper"><div class="{WRAP} py-20 sm:py-28">{heading(loc, t("includes.eyebrow"), t("includes.title"), extra="mb-12")}
<ul class="grid gap-px overflow-hidden rounded-brand bg-ink/10 sm:grid-cols-2 lg:grid-cols-4">{inc}</ul></div></section>
<section id="packs-{loc}" class="bg-ink text-paper"><div class="{WRAP} py-20 sm:py-28"><div class="mb-10 flex flex-wrap items-end justify-between gap-6">{heading(loc, t("packs.eyebrow"), t("packs.title"), dark=True)}
<span class="ps-eyebrow text-lime">{t("packs.seeAll")} →</span></div><div role="group" aria-label="{t("packs.filterLabel")}" class="js-filters mb-8 flex flex-wrap gap-3">{filters}</div>
<div class="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{"".join(packcard(loc, p) for p in PACKS)}</div></div></section>
<section id="metode-{loc}" class="bg-paper"><div class="{WRAP} py-20 sm:py-28">{heading(loc, t("method.eyebrow"), t("method.title"), t("method.intro"), extra="mb-14")}<ol class="grid gap-5 md:grid-cols-2 lg:grid-cols-4">{steps}</ol></div></section>
<section class="bg-stone"><div class="{WRAP} grid gap-12 py-20 sm:py-28 lg:grid-cols-[1fr_1.2fr]"><div>{heading(loc, t("day.eyebrow"), t("day.title"))}<p class="mt-6 max-w-md text-mute-strong">{t("day.note")}</p></div>
<ol class="relative border-l-[3px] border-ink">{dayl}</ol></div></section>
<section id="equip-{loc}" class="bg-ink text-paper"><div class="{WRAP} py-20 sm:py-28">{heading(loc, t("team.eyebrow"), t("team.title"), dark=True, extra="mb-12")}<ul class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{team}</ul></div></section>
<section class="bg-paper"><div class="{WRAP} py-20 sm:py-28">{heading(loc, t("testimonials.eyebrow"), t("testimonials.title"), t("testimonials.note"), extra="mb-12")}<ul class="grid gap-5 md:grid-cols-3">{testi}</ul></div></section>
<section id="galeria-{loc}" class="bg-ink text-paper"><div class="{WRAP} py-20 sm:py-28">{heading(loc, t("gallery.eyebrow"), t("gallery.title"), dark=True, extra="mb-12")}<div class="columns-2 gap-4 md:columns-3">{gal}</div></div></section>
<section id="faq-{loc}" class="bg-stone"><div class="{WRAP} grid gap-12 py-20 sm:py-28 lg:grid-cols-[1fr_1.4fr]"><div>{heading(loc, t("faq.eyebrow"), t("faq.title"))}<p class="ps-eyebrow mt-8">{t("faq.more")} →</p></div>
<div class="divide-y divide-ink/15 border-y border-ink/15">{faq}</div></div></section>
<section id="reserva-{loc}" class="bg-ink text-paper"><div class="{WRAP} flex flex-col items-start gap-8 py-24 sm:py-32"><h2 class="max-w-5xl font-display text-display font-black uppercase italic">{t("finalCta.title")}</h2>
<p class="max-w-xl text-lg text-paper/80">{t("finalCta.subtitle")}</p>{button(tc("requestSpot"), size="lg", href=wa_href(loc))}<p class="text-sm text-paper/55">El formulari de reserva arriba a la Fase 4. De moment, aquest botó obre WhatsApp.</p></div></section>
</main>'''

# ── Styleguide de la Fase 1 (sense el seu hero provisional) ──
sg = open(SCR + "_styleguide_tmp.html").read()
head_part = sg[:sg.index("<div class=\"bg-ink text-paper\">")]
script_part = sg[sg.index("<script>\n// Comptadors"):]
sg_main = sg[sg.index("<main>") + 6:sg.index("</main>")]
sg_main = sg_main[sg_main.index("</section>") + len("</section>"):]  # treu el hero provisional
sg_main = sg_main.replace('class="mx-auto max-w-6xl', 'class="wrap mx-auto max-w-6xl')

head_part = head_part.replace(".wrap {", ".wrap { --unused: 0; }\n  .wrap {").replace("max(20px", "max(20px")
head_part += """<style>
.js-header.is-solid { background: #0b0b0b; box-shadow: 0 1px 0 rgba(255,255,255,0.08); }
body::before { content: ""; position: fixed; inset: 0 0 auto; height: env(safe-area-inset-top, 0px); z-index: 60; background: #0b0b0b; }
.js-filter[aria-pressed="true"] { background: #d6ff2e; color: #0b0b0b; }
.js-filter[aria-pressed="false"] { border: 1px solid rgba(255,255,255,0.3); color: #fff; }
.js-burger[aria-expanded="true"] .b1 { transform: translateY(6px) rotate(45deg); }
.js-burger[aria-expanded="true"] .b2 { opacity: 0; }
.js-burger[aria-expanded="true"] .b3 { transform: translateY(-6px) rotate(-45deg); }
#ps-toast { transition: opacity .3s, transform .3s; }
</style>
<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs><linearGradient id="ps-photo-light" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2a2a28"/><stop offset="1" stop-color="#121212"/></linearGradient></defs></svg>
"""

views = "".join(f'<div data-view="{l}"{"" if l == "ca" else " hidden"} lang="{l}">{header(l)}{home(l)}{footer(l)}</div>' for l in LOCS)
sg_view = f'''<div data-view="styleguide" hidden><div class="bg-ink text-paper"><div class="wrap mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 py-4">
<p class="ps-eyebrow text-lime">Styleguide · Fase 1</p><a href="#" class="js-back ps-eyebrow text-paper underline underline-offset-4">← Tornar a la Home</a></div></div>
<main>{sg_main}</main></div>'''

app_js = """<div id="ps-toast" role="status" aria-live="polite" class="pointer-events-none fixed left-1/2 z-[70] -translate-x-1/2 rounded-[6px] bg-paper px-4 py-3 text-sm font-medium text-ink opacity-0 shadow-xl" style="bottom:calc(96px + env(safe-area-inset-bottom,0px))"></div>
<script>
(function () {
  const views = [...document.querySelectorAll("[data-view]")];
  let current = "ca";
  function show(name) {
    views.forEach((v) => (v.hidden = v.dataset.view !== name));
    if (name !== "styleguide") current = name;
    document.documentElement.lang = name === "styleguide" ? "ca" : name;
    window.scrollTo(0, 0);
    onScroll();
  }
  document.addEventListener("click", (e) => {
    const lang = e.target.closest("[data-lang]");
    if (lang) { closeMenus(); show(lang.dataset.lang); return; }
    if (e.target.closest('a[href="#styleguide"]')) { e.preventDefault(); show("styleguide"); return; }
    if (e.target.closest(".js-back")) { e.preventDefault(); show(current); return; }
    const burger = e.target.closest(".js-burger");
    if (burger) {
      const menu = burger.closest("[data-view]").querySelector(".js-menu");
      const open = menu.hidden;
      menu.hidden = !open;
      burger.setAttribute("aria-expanded", String(open));
      burger.setAttribute("aria-label", open ? burger.dataset.close : burger.dataset.open);
      document.body.style.overflow = open ? "hidden" : "";
      return;
    }
    if (e.target.closest(".js-close")) closeMenus();
    const f = e.target.closest(".js-filter");
    if (f) {
      const scope = f.closest("section");
      scope.querySelectorAll(".js-filter").forEach((b) => b.setAttribute("aria-pressed", String(b === f)));
      scope.querySelectorAll("article[data-format]").forEach((a) => (a.hidden = f.dataset.filter !== "all" && a.dataset.format !== f.dataset.filter));
      return;
    }
    if (e.target.closest(".js-soon")) { e.preventDefault(); toast("La pàgina de detall de cada pack arriba a la Fase 3."); }
  });
  function closeMenus() {
    document.querySelectorAll(".js-menu").forEach((m) => (m.hidden = true));
    document.querySelectorAll(".js-burger").forEach((b) => { b.setAttribute("aria-expanded", "false"); b.setAttribute("aria-label", b.dataset.open); });
    document.body.style.overflow = "";
  }
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeMenus(); });
  function onScroll() {
    const solid = window.scrollY > 24;
    document.querySelectorAll(".js-header").forEach((h) => h.classList.toggle("is-solid", solid || !h.closest("[data-view]").querySelector(".js-menu").hidden));
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  let tt;
  function toast(msg) {
    const el = document.getElementById("ps-toast");
    el.textContent = msg; el.style.opacity = "1";
    clearTimeout(tt); tt = setTimeout(() => (el.style.opacity = "0"), 2600);
  }
  if (location.hash === "#styleguide") show("styleguide"); else onScroll();
})();
</script>
"""

page = head_part.replace("<title>Padel System Academy</title>", "<title>Padel System Academy</title>") + views + sg_view + app_js + script_part
open(OUT, "w").write(page)
print("ok", len(page), "packs", len(PACKS))
