# KARM Rulings PDF Generator

This script builds a rulings book PDF from live API data for:
- Objectives
- Damage cards
- Upgrades
- Unique (ace) squadrons

It renders an HTML document using the KARM-style page template and can print to PDF via:
- Chrome/Chromium (headless `--print-to-pdf`)
- WeasyPrint

## Setup

1. Copy config:

```bash
cp scripts/karm/config.example.json scripts/karm/config.json
```

2. Edit `scripts/karm/config.json`:
- `pdfEngine`: `chrome` or `weasyprint`
- `chromeExecutable`: full path to Chrome/Chromium binary
- `weasyprintExecutable`: optional executable path (`weasyprint` by default)
- `pageBackgroundImage`: optional page background image file
- `staticPages.before` and `staticPages.after`: optional pre-authored fixed pages (cover, TOC, back matter)
- `factionIcons`: optional icon images

## Run

Dry run (HTML only):

```bash
npm run rulings:pdf:dry
```

Full run (HTML + PDF):

```bash
npm run rulings:pdf
```

Full run with WeasyPrint:

```bash
npm run rulings:pdf:weasy
```

Output defaults:
- HTML: `scripts/karm/out/rulings-book.html`
- PDF: `scripts/karm/out/rulings-book.pdf`

## Notes

- Markdown-like text conversion is supported in rulings text: block quotes (`>`), bullets (`-`), bold (`**`), italics (`*`/`_`), and inline code.
- `:shortcode:` patterns are converted to emoji for common Armada terms (for unknown shortcodes, original text is preserved).
- To reduce page overflow risk, long cards are split into continuation entries and paginated with an estimator.
- Escaped newline sequences in API text (e.g. `\\n`) are normalized before rendering.
- Static pages are inserted as-is and are not modified.
