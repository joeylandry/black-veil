"""
Joins the essential print files into one single-sided PDF (60 pages).

Print it single-sided on letter paper with background graphics on. A contents page comes first
and the HOST-ONLY pages are grouped at the end.

    python3 scripts/print/combine.py        (run after `npm run game:print`)
"""
from io import BytesIO
from pypdf import PdfReader, PdfWriter
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas

SRC = "docs/print/game"
OUT = f"{SRC}/PRINT-EVERYTHING.pdf"

# (file, title, how to use it)
PARTS = [
    ("A. FOR THE GUESTS", None, None),
    ("guest-cards.pdf", "Guest cards", "Do not cut (survivors: cut out the marker at the bottom of their sheet, or leave it for them). One sheet per guest, alphabetical. Everything the guest needs is on it."),
    ("B. THINGS TO CUT OUT AND PLACE", None, None),
    ("slips.pdf", "Slips", "Cut on the dashed lines. The line above each slip says whose envelope it goes in."),
    ("tags.pdf", "Code tags", "Cut on the dashed grid. The line under each tag says what it goes on; trim it off after matching."),
    ("exhibits.pdf", "Exhibits (binder, black table, scene, sealed pages)", "Cut each page out. The foot of each page says where it goes. Last page: the secret tie-breaker stub for the jacket lining. These pages are landscape."),
    ("fortune-cards.pdf", "Fortune cards", "Cut apart. Keep at the bar for Josh."),
    ("vial-labels.pdf", "Vial label", "Cut the House Stock label (row 1) and glue it round the small bottle. Other rows are optional."),
    ("door-cards.pdf", "Door posters", "Page 1 (the brief) and page 2 (the rules): one of each, at the door."),
    ("cocktail-menu.pdf", "Cocktail menu", "Two menus per sheet: cut across the dashed line. Put them on the bar."),
    ("food-menu.pdf", "Food menu", "Two menus per sheet: cut across the dashed line. Put them by the food."),
    ("C. HOST ONLY (spoilers: keep these)", None, None),
    ("survivor-kit.pdf", "Survivor kit", "One page for you: the five markers and who holds them. (Each survivor's secret page and marker are on their own guest card.)"),
    ("host-sheet.pdf", "Host sheet", "Every approval word. Keep behind the bar."),
]

counts = {file: len(PdfReader(f"{SRC}/{file}").pages) for file, title, _ in PARTS if title is not None}

def layout():
    rows, page = [], 2
    for file, title, how in PARTS:
        if title is None:
            rows.append(("section", file, None, None, None))
            continue
        rows.append(("file", title, how, page, counts[file]))
        page += counts[file]
    return rows, page - 1

def contents_page(rows, total):
    buffer = BytesIO()
    pdf = canvas.Canvas(buffer, pagesize=letter)
    width, height = letter
    y = height - 54
    pdf.setFont("Helvetica-Bold", 16)
    pdf.drawString(48, y, "THE BLACK VEIL: everything to print")
    y -= 18
    pdf.setFont("Helvetica", 9.5)
    pdf.drawString(48, y, f"Print this whole file SINGLE-SIDED on letter paper, background graphics ON, no 'fit to page'. {total} pages.")
    y -= 24
    for kind, title, how, page, pages in rows:
        if kind == "section":
            y -= 6
            pdf.setFont("Helvetica-Bold", 10.5)
            pdf.drawString(48, y, title)
            y -= 14
            continue
        pdf.setFont("Helvetica-Bold", 9.5)
        pdf.drawString(54, y, title)
        pdf.setFont("Helvetica", 9.5)
        pdf.drawRightString(width - 48, y, f"page{'s' if pages != 1 else ''} {page}" + (f"-{page + pages - 1}" if pages != 1 else ""))
        y -= 11.5
        pdf.setFont("Helvetica", 8.5)
        text = how
        while text:
            cut = text[:112]
            if len(text) > 112:
                cut = cut[: cut.rfind(" ")]
            pdf.drawString(66, y, cut)
            text = text[len(cut):].lstrip()
            y -= 10.5
        y -= 4
    pdf.showPage()
    pdf.save()
    buffer.seek(0)
    return PdfReader(buffer).pages[0]

rows, total = layout()
writer = PdfWriter()
writer.add_page(contents_page(rows, total))
for file, title, _ in PARTS:
    if title is None:
        continue
    first = len(writer.pages)
    for page in PdfReader(f"{SRC}/{file}").pages:
        writer.add_page(page)
    writer.add_outline_item(title, first)
with open(OUT, "wb") as handle:
    writer.write(handle)
print(f"wrote {OUT}: {len(writer.pages)} pages (contents said {total})")
