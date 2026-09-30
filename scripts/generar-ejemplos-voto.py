# Genera las ilustraciones de ejemplo de voto (válido, nulo, en blanco) en
# client/public/ejemplos/. Uso: python3 scripts/generar-ejemplos-voto.py
import os
OUT = "client/public/ejemplos"
PEN = "#1d4ed8"
FONT = "font-family='Segoe UI, Roboto, Helvetica, Arial, sans-serif'"

def symbol(kind, x, y, s):
    cx, cy = x + s/2, y + s/2
    c = "#9aa7b4"
    if kind == 0: return f"<circle cx='{cx}' cy='{cy}' r='{s*0.24}' fill='none' stroke='{c}' stroke-width='3'/>"
    if kind == 1: return f"<polygon points='{cx},{y+s*0.24} {x+s*0.76},{y+s*0.74} {x+s*0.24},{y+s*0.74}' fill='none' stroke='{c}' stroke-width='3'/>"
    return f"<rect x='{x+s*0.28}' y='{y+s*0.28}' width='{s*0.44}' height='{s*0.44}' fill='none' stroke='{c}' stroke-width='3'/>"

def column(x, y, w, title=None, rowh=64, names=("Organización A", "Organización B", "Organización C")):
    """Columna de cédula: 3 filas (nombre + recuadro del símbolo). Devuelve svg y posiciones de recuadros."""
    parts = []
    top = y
    if title:
        parts.append(f"<rect x='{x}' y='{y}' width='{w}' height='30' fill='#0b3d68' rx='4'/>")
        parts.append(f"<text x='{x+w/2}' y='{y+21}' text-anchor='middle' fill='#fff' font-size='16' font-weight='700' {FONT}>{title}</text>")
        top = y + 36
    s = rowh - 12
    boxes = []
    for i, name in enumerate(names):
        ry = top + i * rowh
        parts.append(f"<rect x='{x}' y='{ry}' width='{w}' height='{rowh-6}' fill='#fff' stroke='#c9d3de' stroke-width='2' rx='4'/>")
        parts.append(f"<text x='{x+12}' y='{ry+rowh/2+3}' fill='#34495e' font-size='17' {FONT}>{name}</text>")
        bx, by = x + w - s - 8, ry + 3
        parts.append(f"<rect x='{bx}' y='{by}' width='{s}' height='{s}' fill='#f7f9fb' stroke='#0b3d68' stroke-width='2.5'/>")
        parts.append(symbol(i, bx, by, s))
        boxes.append((bx, by, s))
    return "".join(parts), boxes, top + 3 * rowh

def aspa(cx, cy, r):
    return (f"<path d='M{cx-r},{cy-r} L{cx+r},{cy+r} M{cx+r},{cy-r} L{cx-r},{cy+r}' stroke='{PEN}' stroke-width='5' stroke-linecap='round' fill='none'/>")

def cruz(cx, cy, r):
    return (f"<path d='M{cx},{cy-r} L{cx},{cy+r} M{cx-r},{cy} L{cx+r},{cy}' stroke='{PEN}' stroke-width='5' stroke-linecap='round' fill='none'/>")

def check(cx, cy, r):
    return (f"<path d='M{cx-r},{cy} L{cx-r*0.3},{cy+r*0.7} L{cx+r},{cy-r*0.8}' stroke='{PEN}' stroke-width='5' stroke-linecap='round' stroke-linejoin='round' fill='none'/>")

def dot(cx, cy):
    return f"<circle cx='{cx}' cy='{cy}' r='7' fill='#e11d48' stroke='#fff' stroke-width='2'/>"

def panel(x, y, w, h, verdict_ok, caption_lines, body):
    color = {True: "#1f9d55", False: "#c0392b", None: "#566573"}[verdict_ok]
    icon = {True: "✓", False: "✗", None: "○"}[verdict_ok]
    parts = [f"<rect x='{x}' y='{y}' width='{w}' height='{h}' rx='14' fill='#f5f8fb' stroke='{color}' stroke-width='3'/>",
             body]
    cy = y + h - 22 * len(caption_lines) - 8
    parts.append(f"<text x='{x+16}' y='{cy}' fill='{color}' font-size='20' font-weight='800' {FONT}>{icon} {caption_lines[0]}</text>")
    for i, l in enumerate(caption_lines[1:]):
        parts.append(f"<text x='{x+16}' y='{cy+24*(i+1)}' fill='#34495e' font-size='17' {FONT}>{l}</text>")
    return "".join(parts)

def doc(w, h, title, color, content):
    return (f"<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 {w} {h}' width='{w}' height='{h}' role='img' aria-label='{title}'>"
            f"<rect width='{w}' height='{h}' fill='#ffffff' rx='16'/>"
            f"<text x='20' y='38' fill='{color}' font-size='26' font-weight='800' {FONT}>{title}</text>"
            f"{content}"
            f"<text x='{w/2}' y='{h-12}' text-anchor='middle' fill='#8a97a5' font-size='14' {FONT}>Ilustración referencial basada en la cartilla ONPE ERM 2026 (no es la cédula oficial)</text>"
            "</svg>")

PW, PH, GAP, X0, Y0 = 330, 330, 20, 20, 58

def build_panel(col, row, verdict, caption, marks_fn, title=None):
    x = X0 + col * (PW + GAP); y = Y0 + row * (PH + GAP)
    colsvg, boxes, _ = column(x + 14, y + 14, PW - 28, title)
    return panel(x, y, PW, PH, verdict, caption, colsvg + marks_fn(boxes))

def center(b): return (b[0] + b[2]/2, b[1] + b[2]/2)

# ---------- VÁLIDO ----------
p = [
    build_panel(0, 0, True, ["Aspa dentro del recuadro", "El cruce de líneas está", "dentro del recuadro."],
                lambda b: aspa(*center(b[1]), 16)),
    build_panel(1, 0, True, ["La marca se sale, pero…", "el cruce (punto rojo) sigue", "dentro del recuadro."],
                lambda b: (lambda cx, cy: f"<path d='M{cx},{cy-40} L{cx},{cy+40} M{cx-46},{cy} L{cx+30},{cy}' stroke='{PEN}' stroke-width='5' stroke-linecap='round' fill='none'/>" + dot(cx, cy))(center(b[1])[0] - 4, center(b[1])[1] - 4)),
]
open(f"{OUT}/voto-valido.svg", "w").write(doc(2*PW + GAP + 40, Y0 + PH + 40, "VOTO VÁLIDO", "#1f9d55", "".join(p)))

# ---------- NULO ----------
def fuera(b):
    bx, by, s = b[1]
    cx, cy = bx - 26, by + s/2
    return aspa(cx, cy, 24) + dot(cx, cy)
def dos(b):
    return aspa(*center(b[0]), 16) + aspa(*center(b[2]), 16)
def ajeno(b):
    bx, by, s = b[0]
    return aspa(*center(b[0]), 16) + f"<text x='{bx-8}' y='{b[2][1]+s/2+6}' text-anchor='end' fill='{PEN}' font-size='16' font-style='italic' font-weight='700' {FONT}>J. Pérez</text>"
p = [
    build_panel(0, 0, False, ["Cruce fuera del recuadro", "El punto rojo (cruce) quedó", "fuera del recuadro."], fuera),
    build_panel(1, 0, False, ["Signo distinto", "Un visto (✓), círculo u otro", "signo que no es cruz ni aspa."],
                lambda b: check(*center(b[1]), 18)),
    build_panel(0, 1, False, ["Dos organizaciones", "Marcó más de una en la", "misma columna."], dos),
    build_panel(1, 1, False, ["Nombre, firma o DNI", "del elector, o palabras", "ajenas al proceso."], ajeno),
]
open(f"{OUT}/voto-nulo.svg", "w").write(doc(2*PW + GAP + 40, Y0 + 2*PH + GAP + 40, "VOTO NULO", "#c0392b", "".join(p)))

# ---------- EN BLANCO ----------
def dos_columnas():
    x = X0 + (PW + GAP); y = Y0
    cw = (PW - 28 - 10) / 2
    c1, b1, _ = column(x + 14, y + 14, cw, "Provincial", rowh=58, names=("Org. A", "Org. B", "Org. C"))
    c2, b2, _ = column(x + 14 + cw + 10, y + 14, cw, "Distrital", rowh=58, names=("Org. A", "Org. B", "Org. C"))
    return panel(x, y, PW, PH, None, ["Blanco solo en una", "Provincial: válido.", "Distrital: en blanco."], c1 + c2 + aspa(*center(b1[0]), 11))
def columna_compacta_names():
    pass
p = [
    build_panel(0, 0, None, ["Columna sin ninguna marca", "Ningún recuadro de esa", "columna está marcado."], lambda b: ""),
    dos_columnas(),
]
open(f"{OUT}/voto-en-blanco.svg", "w").write(doc(2*PW + GAP + 40, Y0 + PH + 40, "VOTO EN BLANCO", "#566573", "".join(p)))
print("ok")
