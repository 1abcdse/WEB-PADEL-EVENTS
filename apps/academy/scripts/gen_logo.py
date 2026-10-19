"""Genera el logo PS (disseny placa) en SVG amb el text convertit a traçats.

Ús: python3 gen_logo.py <dir_public_brand> <fitxer_ts_paths>
"""
import sys, os
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen

OUT_DIR, TS_OUT = sys.argv[1], sys.argv[2]
os.makedirs(OUT_DIR, exist_ok=True)

INK, LIME, PAPER = "#0B0B0B", "#D6FF2E", "#FFFFFF"
FONTS = "/usr/share/fonts/opentype/inter/"


def text_path(text, font_file, size, x, baseline, tracking=0.0, anchor="start"):
    """Devuelve (d, ancho) del texto como trazado SVG (y hacia abajo)."""
    f = TTFont(FONTS + font_file)
    gs, cmap = f.getGlyphSet(), f.getBestCmap()
    upm = f["head"].unitsPerEm
    s = size / upm
    names = [cmap[ord(c)] for c in text]
    advs = [f["hmtx"][n][0] * s for n in names]
    width = sum(advs) + tracking * (len(text) - 1)
    if anchor == "middle":
        x -= width / 2
    pen = SVGPathPen(gs)
    cx = x
    for n, a in zip(names, advs):
        tp = TransformPen(pen, (s, 0, 0, -s, cx, baseline))
        gs[n].draw(tp)
        cx += a + tracking
    return pen.getCommands(), width


def ball(cx, cy, r, fill, seam, outline=None):
    k = r * 0.9
    o = f' stroke="{outline}" stroke-width="{r*0.09:.2f}"' if outline else ""
    return (f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="{fill}"{o}/>'
            f'<path d="M{cx-k:.2f} {cy-r*0.42:.2f}Q{cx} {cy+r*0.05:.2f} {cx+k:.2f} {cy-r*0.42:.2f}'
            f'M{cx-k:.2f} {cy+r*0.42:.2f}Q{cx} {cy-r*0.05:.2f} {cx+k:.2f} {cy+r*0.42:.2f}" '
            f'fill="none" stroke="{seam}" stroke-width="{r*0.13:.2f}" stroke-linecap="round"/>')


# --- Geometria de la marca (viewBox 0 0 248 144, desplaçat +4,+10) ---
PLATE = "34,18 226,18 196,138 4,138"
STRIP = "8,122 200,122 196,138 4,138"
PS_D, _ = text_path("PS", "Inter-BlackItalic.otf", 112, 114, 114, tracking=-5, anchor="middle")
BALL = (224, 24, 20)


def mark(tone):
    """tone='light' -> per a fons clars (placa negra); 'dark' -> per a fons foscos (placa blanca)."""
    plate, letters, outline = (INK, PAPER, INK) if tone == "light" else (PAPER, INK, None)
    return (f'<polygon points="{PLATE}" fill="{plate}"/>'
            f'<polygon points="{STRIP}" fill="{LIME}"/>'
            f'<path d="{PS_D}" fill="{letters}"/>' + ball(*BALL, LIME, INK, outline))


def svg(w, h, inner, title):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" role="img" aria-label="{title}">'
            f'<title>{title}</title>{inner}</svg>\n')


TITLE = "Padel System Academy"

# Marca sola
open(f"{OUT_DIR}/ps-mark.svg", "w").write(svg(248, 144, mark("light"), TITLE))
open(f"{OUT_DIR}/ps-mark-negative.svg", "w").write(svg(248, 144, mark("dark"), TITLE))

# Wordmark en tres línies
W_SIZE, W_TRACK, W_LEAD = 30, 7.5, 38
lines = ["PADEL", "SYSTEM", "ACADEMY"]
WX = 248 + 34 + 4 + 30  # marca + aire + separador + aire
word_d = ""
word_w = 0
top = 72 - W_LEAD  # centre vertical aproximat
for i, t in enumerate(lines):
    d, w = text_path(t, "Inter-ExtraBold.otf", W_SIZE, WX, top + i * W_LEAD + 11, tracking=W_TRACK)
    word_d += d
    word_w = max(word_w, w)
HW = int(WX + word_w + 6)


def horizontal(tone):
    ink = INK if tone == "light" else PAPER
    return (mark(tone) + f'<rect x="{248 + 34}" y="26" width="4" height="100" fill="{ink}"/>'
            f'<path d="{word_d}" fill="{ink}"/>')


open(f"{OUT_DIR}/ps-logo-horizontal.svg", "w").write(svg(HW, 144, horizontal("light"), TITLE))
open(f"{OUT_DIR}/ps-logo-horizontal-negative.svg", "w").write(svg(HW, 144, horizontal("dark"), TITLE))

# Icona d'app (quadrat negre arrodonit, marca en negatiu)
icon_inner = (f'<rect width="512" height="512" rx="104" fill="{INK}"/>'
              f'<g transform="translate(72 140) scale(1.48)">{mark("dark")}</g>')
open(f"{OUT_DIR}/ps-icon.svg", "w").write(svg(512, 512, icon_inner, TITLE))

# Traçats per al component React
ts = f'''// Generat per scripts/gen_logo.py a partir del disseny "placa". No editar a mà.
export const MARK_VIEWBOX = "0 0 248 144";
export const PLATE_POINTS = "{PLATE}";
export const STRIP_POINTS = "{STRIP}";
export const PS_PATH = "{PS_D}";
export const BALL = {{ cx: {BALL[0]}, cy: {BALL[1]}, r: {BALL[2]} }};
export const WORDMARK_PATH = "{word_d}";
export const WORDMARK_X = {WX};
export const HORIZONTAL_WIDTH = {HW};
'''
open(TS_OUT, "w").write(ts)
print("ok", HW)
