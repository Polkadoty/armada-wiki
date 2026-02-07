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

## Features

- Browse pages for ships, squadrons, upgrades, objectives
- Detail pages for individual cards
- Content toggles (legacy, legends, nexus, arc, naboo)
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
```

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
