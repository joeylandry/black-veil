"""
Joins every print file into one PDF, ready to print DOUBLE-SIDED (flip on the long edge).

The character cards use both sides of each sheet. Every other page is single-sided, so a blank
back is inserted after it: that way one double-sided print gives every sheet the right front
and back. A contents page comes first, and HOST-ONLY pages are grouped at the end.

    python3 scripts/print/combine.py        (run after `npm run game:print`)
"""
from io import BytesIO
from pypdf import PdfReader, PdfWriter
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas

SRC = "docs/print/game"
OUT = f"{SRC}/PRINT-EVERYTHING.pdf"

# (file, title, duplex?, how to use it)
PARTS = [
    ("A. FOR THE GUESTS", None, None, None),
    ("character-cards.pdf", "Character cards", True, "Do not cut. One card per guest, alphabetical, 2 pages each (front and back). Into that guest's envelope."),
    ("envelope-sheets.pdf", "Envelope sheets", False, "Do not cut. One per guest, alphabetical. Folds into that guest's envelope."),
    ("house-invitations.pdf", "House invitations", False, "Cut along the dotted line, 2 per page. Each is addressed to a guest: into that guest's envelope."),
    ("B. THINGS TO CUT OUT AND PLACE", None, None, None),
    ("slips.pdf", "Slips (and standby copies)", False, "Cut on the dashed lines. The line above each slip says whose envelope it goes in. The second half is the STANDBY set for the bar."),
    ("tags.pdf", "Code tags", False, "Cut on the dashed grid. The line under each tag says what it goes on; trim it off after matching. Spares go in the standby tray."),
    ("exhibits.pdf", "Exhibits (binder, black table, scene, sealed pages)", False, "Cut each page out. The foot of each page says where it goes. Last page: the secret tie-breaker stub for the jacket lining. (These pages are landscape.)"),
    ("fortune-cards.pdf", "Fortune cards", False, "Cut apart. Keep at the bar for Josh."),
    ("vial-labels.pdf", "Vial label", False, "Cut the House Stock label (row 1) and glue it round the small bottle. Other rows optional."),
    ("door-cards.pdf", "Door and table cards", False, "Pages 1 and 2 on the door; pages 3 and 4 on the tables."),
    ("menu.pdf", "Bar menu", False, "One copy on the bar."),
    ("menu-table-card.pdf", "Table menu card", False, "Cut in half for the tables."),
    ("C. HOST ONLY (spoilers: keep these)", None, None, None),
    ("survivor-kit.pdf", "Survivor kit", False, "Page 1 is yours. Then for each survivor: the Flap and a cut sheet (invitation, marker, address label). The strip at the top names the survivor."),
    ("tag-key.pdf", "Tag key", False, "Which tag goes on which object."),
    ("exhibits-index.pdf", "Exhibits index", False, "Every exhibit and where it goes."),
    ("host-sheet.pdf", "Host sheet", False, "Every approval word. Keep behind the bar."),
]

def blank(width: float, height: float):
    writer = PdfWriter()
    writer.add_blank_page(width=width, height=height)
    return writer.pages[0]

# first pass: page counts, so the contents page can quote sheet numbers
counts = {}
for file, title, duplex, _ in PARTS:
    if title is not None:
        counts[file] = len(PdfReader(f"{SRC}/{file}").pages)

def layout():
    """Contents is one page plus a blank back = sheet 1. Then each file in order."""
    rows, sheet = [], 2
    for file, title, duplex, how in PARTS:
        if title is None:
            rows.append(("section", file, None, None, None))
            continue
        sheets = counts[file] // 2 if duplex else counts[file]
        rows.append(("file", title, how, sheet, sheets))
        sheet += sheets
    return rows, sheet - 1

def contents_page(rows, total_sheets):
    buffer = BytesIO()
    pdf = canvas.Canvas(buffer, pagesize=letter)
    width, height = letter
    y = height - 54
    pdf.setFont("Helvetica-Bold", 16)
    pdf.drawString(48, y, "THE BLACK VEIL: everything to print")
    y -= 18
    pdf.setFont("Helvetica", 9.5)
    pdf.drawString(48, y, f"Print this whole file DOUBLE-SIDED (flip on the long edge), letter paper, background graphics ON. {total_sheets} sheets.")
    y -= 13
    pdf.drawString(48, y, "Every page has a blank back except the character cards, which print front and back. Do not use 'fit to page'.")
    y -= 20
    for kind, title, how, sheet, sheets in rows:
        if kind == "section":
            y -= 6
            pdf.setFont("Helvetica-Bold", 10.5)
            pdf.drawString(48, y, title)
            y -= 14
            continue
        pdf.setFont("Helvetica-Bold", 9.5)
        pdf.drawString(54, y, f"{title}")
        pdf.setFont("Helvetica", 9.5)
        pdf.drawRightString(width - 48, y, f"sheet{'s' if sheets != 1 else ''} {sheet}" + (f"-{sheet + sheets - 1}" if sheets != 1 else ""))
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
writer.add_page(blank(*letter))
outline_parent = None
for file, title, duplex, _ in PARTS:
    if title is None:
        continue
    reader = PdfReader(f"{SRC}/{file}")
    first = len(writer.pages)
    for page in reader.pages:
        writer.add_page(page)
        if not duplex:
            writer.add_page(blank(float(page.mediabox.width), float(page.mediabox.height)))
    writer.add_outline_item(title, first)
with open(OUT, "wb") as handle:
    writer.write(handle)
print(f"wrote {OUT}: {len(writer.pages)} pages = {len(writer.pages) // 2} sheets (contents said {total})")
