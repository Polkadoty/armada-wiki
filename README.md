# Armada Wiki

Reference and discovery site for Star Wars: Armada cards/content (ships, squadrons, upgrades, objectives) across multiple formats.

## Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS + shadcn/ui
- Supabase (comments / bug reports)

## Ecosystem Role

`armada-wiki` is the read-focused companion app in the Armada suite:

- Browses and visualizes card metadata from `the-isb-api`
- Supports multiple content packs/formats used by Star Forge
- Provides resource links and supporting player documentation

## Integration Points

- Primary data source: `https://api.swarmada.wiki`
- Backup data source: `https://api-backup.swarmada.wiki`
- Deep-links to Star Forge (`https://star-forge.tools`) from resources/about pages
- Uses browser cache/localStorage data strategy compatible with Star Forge content keys

## Routing

`/` redirects to `/rulings`, the **Rules & Rulings** reference: server-rendered App Router
pages (`app/rulings/`) built from the card API and regenerated hourly. The model lives in
`lib/rulings/` — `build.ts` (pure: normalizes cards and rulings, applies the Community
layer, builds cross-links; covered by `npm run test:rulings`), `pages.ts` (every page and
the navigation) and `data.ts` (fetching). The rulings used to be static HTML under
`public/rulings/`; `next.config.ts` redirects those `.html` URLs, and card anchors are
unchanged.

The card wiki pages live at their own routes (`/ships`, `/squadrons`, …). `/changelog` is
the Community Edition changelog and `/changelog/arm` mirrors the Armada Reference Manual
changelog (`lib/armChangelog.ts`).

## Content

The wiki and rulings cover **Core + Community + Nexus**. A Community erratum replaces the
core card it amends (matched by API key: strip `-community`, then `-errata`); Community
cards with no core counterpart are added. ARC, Legacy, Legends, Naboo and beta/playtest
content are not fetched.

## Features

- Browse pages for ships, squadrons, upgrades, objectives
- Detail pages for individual cards
- Rules & Rulings reference in the Armada Reference Manual's layout and typefaces
- Favorites and compare pages
- Bug report and comments APIs

## Development

### Prerequisites

- Node.js 18+
- npm

### Environment

Use `.env.local` (see `.env.local.example`):

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
REVALIDATE_SECRET=   # bearer token the-isb-api sends to /api/revalidate
CRON_SECRET=         # set by Vercel for the daily backstop cron
```

### Card data refresh

Server-rendered pages (`/rulings/**`, `/changelog`) are static until the card data
changes. They read the API's manifest (`/lastModified`) under the `card-catalog` cache
tag and its immutable, hash-addressed `/catalog/<dataset>.<hash>.json` snapshots
(`lib/cardApi.ts`). `POST /api/revalidate` (from the-isb-api's
`refresh-consumers.yml` workflow) and a daily `GET` (Vercel cron, `vercel.json`) compare
the live manifest's hashes with the ones the pages were built from and invalidate the
tag only when a watched dataset changed.

### Commands

```bash
npm install
npm run dev
npm run lint
npm run build
npm run start
```

Build note:
- In restricted environments, Turbopack may fail due sandbox process/port limits. Use:

```bash
npm run build -- --webpack
```

## Project Layout

- `app/` routes and server handlers
- `components/` UI and feature components
- `hooks/` client data hooks
- `utils/dataFetcher.ts` API fetching + caching
- `lib/` Supabase and shared helpers

## Related Repos

- `the-isb-api` (card/content backend)
- `armada-list-builder` (Star Forge listbuilder)
- `armadacommunity` (community portal)
- `t5-tools` (tournament platform)

## License

Fan/community project.
