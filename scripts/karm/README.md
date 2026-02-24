# KARM Rulings PDF Generator

This script builds a rulings book PDF from live API data for:
- Objectives
- Damage cards
- Upgrades
- Ace squadrons (`ace = true`)

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
- `pdfDpi`: target Chrome render DPI (default `300`)
- `chromeExecutable`: full path to Chrome/Chromium binary
- `weasyprintExecutable`: optional executable path (`weasyprint` by default)
- `iconsMapSource`: local icon map JSON in this repo (`scripts/karm/icon-map.json`)
- `iconsMapSourceExternal`: optional fallback to `armada-list-builder` TypeScript icon map
- `pageBackgroundImage`: optional page background image file
- `staticPages.before` and `staticPages.after`: optional pre-authored fixed pages (cover, TOC, back matter)
- `factionIcons`: optional icon images
- `fonts`: set explicit font files (Optima, Teuton Fett, Aero Matics, Revenger, icons font)

## Run

Dry run (HTML only):

```bash
npm run rulings:pdf:dry
```

Full run (HTML + PDF):

```bash
npm run rulings:pdf
```

Full run with explicit DPI override:

```bash
node scripts/karm/generate-karm-rulings-book.mjs --dpi=300
```

Full run with WeasyPrint:

```bash
npm run rulings:pdf:weasy
```

Sync icon glyph mappings from armada-list-builder:

```bash
npm run rulings:icons:sync
```

Output defaults:
- HTML: `scripts/karm/out/rulings-book.html`
- PDF: `scripts/karm/out/rulings-book.pdf`
- Compile log: `scripts/karm/out/compile.log`

## Notes

- Markdown-like text conversion is supported in rulings text: block quotes (`>`), bullets (`-`), bold (`**`), italics (`*`/`_`), and inline code.
- `:shortcode:` patterns are rendered using the icon font map from `armada-list-builder` where available.
- `scripts/karm/icon-map.json` is the default source. Use `rulings:icons:sync` to refresh it from `armada-list-builder`.
- Cards are kept intact on one page (no card splitting); pagination moves a card to the next page if needed.
- Escaped newline sequences in API text (e.g. `\\n`) are normalized before rendering.
- Static pages are inserted as-is and are not modified.

## Sorting and Sections

- Objectives are sorted by objective type, then alphabetically.
- Upgrades are sorted by upgrade type. `weapons-team-offensive-retro` is treated as **Boarding Teams** and sorted first.
- A dedicated Commander header page is inserted before commander entries.
- Commanders, officers, and ace squadrons are faction-sorted; other groups are not.
- Rulings render in these section labels (empty sections omitted):
  - Card Text
  - Timing
  - Clarifications
  - Upgrade Interactions
  - Squadron Interactions
  - Objective Interactions
  - Counter and Salvo Interactions
  - Obstacle Interactions
  - Deployment Interactions
  - Campaign Interactions
- Source/date/version metadata is rendered as footnotes instead of inline body text.

## Editing Icons and Background

1. Update icon codepoint mappings in `armada-list-builder/src/constants/icons.ts`.
2. Update or replace `icons.otf` glyphs.
3. Run `npm run rulings:icons:sync` to refresh `scripts/karm/icon-map.json`.
4. Set `fonts.iconFont` in `scripts/karm/config.json` (and optionally override `iconsMapSource`).
5. For page backgrounds, set `pageBackgroundImage` in config and tune layout in `scripts/karm/template.css`.
