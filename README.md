# Armada Wiki

A Next.js-based wiki for Star Wars Armada game cards and content.

## ✅ Completed Features (MVP)

### Core Infrastructure
- ✅ **Next.js 14** with App Router, TypeScript, and Tailwind CSS
- ✅ **shadcn/ui** with Mira preset and fuchsia theme
- ✅ **Data Fetching System** - Adapted from armada-list-builder
  - API health checks with automatic fallback
  - LocalStorage caching with timestamp tracking
  - Support for all formats (standard, legends, legacy, nexus, arc, naboo)
- ✅ **Supabase Integration** - Client configured and ready
- ✅ **TypeScript Types** - Complete type definitions for all card types

### Browse Pages (with Search & Filters)
- ✅ **Ships Browse Page** (`/ships`)
  - Search by name or chassis
  - Filter by faction (Rebel, Empire, Republic, Separatist)
  - Shows points, size, hull stats
  - Links to detail pages

- ✅ **Squadrons Browse Page** (`/squadrons`)
  - Search by name
  - Filter by faction
  - Shows hull, speed, points
  - Displays ace status and unique markers

- ✅ **Upgrades Browse Page** (`/upgrades`)
  - Search by name
  - Filter by type (commander, officer, weapons-team, etc.)
  - Shows points, modification status
  - Displays ability preview

- ✅ **Objectives Browse Page** (`/objectives`)
  - Search by name
  - Filter by type (assault, defense, navigation, special)
  - Shows special rule preview

### Detail Pages
- ✅ **Ship Detail Page** (`/ships/[chassisId]/[modelId]`)
  - Card image display
  - Complete stats (command, squadron, engineering)
  - Hull and shield values
  - Defense tokens
  - Upgrade slots
  - Armament display with dice icons
  - All game data visualized

## 🚧 Remaining Features

### Detail Pages (In Progress)
- ⏳ Squadron detail page
- ⏳ Upgrade detail page (with rulings display)
- ⏳ Objective detail page

### Interactive Features
- ⏳ Bug Report/Suggest Changes dialog
- ⏳ Comments system with Supabase
- ⏳ User authentication
- ⏳ Global search across all card types

### Future Enhancements
- 📋 AI-powered card questions (OpenRouter integration)
- 📋 How-to guides and tutorials
- 📋 Blog articles linked to cards
- 📋 Resources page for purchasing/printing
- 📋 Card comparison tool
- 📋 User favorites and bookmarks

## Getting Started

### Prerequisites
- Node.js 18+
- Supabase account (for comments and auth features)

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   ```bash
   # Edit .env.local with your Supabase credentials
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-key
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Open in browser:**
   ```
   http://localhost:3000
   ```

## Project Structure

```
armada-wiki/
├── app/                       # Next.js app directory
│   ├── page.tsx              # Homepage ✅
│   ├── ships/
│   │   ├── page.tsx          # Ships browse ✅
│   │   └── [chassisId]/[modelId]/page.tsx  # Ship detail ✅
│   ├── squadrons/
│   │   └── page.tsx          # Squadrons browse ✅
│   ├── upgrades/
│   │   └── page.tsx          # Upgrades browse ✅
│   └── objectives/
│       └── page.tsx          # Objectives browse ✅
├── components/
│   └── ui/                   # shadcn/ui components
├── hooks/
│   └── useCardData.ts        # Custom hooks for data fetching ✅
├── lib/
│   ├── utils.ts             # Utility functions ✅
│   └── supabase.ts          # Supabase client ✅
├── types/
│   └── cards.ts             # TypeScript type definitions ✅
└── utils/
    └── dataFetcher.ts       # API data fetching ✅
```

## Features in Detail

### Browse Pages
All browse pages include:
- **Real-time search** - Filter cards as you type
- **Faction/type filters** - Quick filtering buttons
- **Responsive grid layout** - Adapts to screen size
- **Card previews** - Key stats visible at a glance
- **Direct links** - Click to view full details

### Ship Detail Page
- **Card image** with optimized loading
- **Complete statistics**:
  - Command, Squadron, Engineering values
  - Hull and shield distribution
  - Defense tokens with counts
  - Upgrade slot breakdown
  - Armament by arc with dice visualization
- **Clean, scannable layout** for quick reference

### Data Fetching
- Fetches from `api.swarmada.wiki` with automatic backup
- Caches data in localStorage for offline access
- Only refetches when data is stale
- Per-file timestamp tracking for efficient updates

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui (Mira preset)
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Data Source**: api.swarmada.wiki
- **Deployment**: Vercel (recommended)

## Development Notes

- The project uses the `use client` directive for pages that need browser APIs (localStorage)
- Data fetching happens client-side to leverage localStorage caching
- All pages are responsive and mobile-friendly
- Dark mode support is built into the shadcn/ui theme

## Contributing

Contributions are welcome! The remaining features are tracked in the todo list above.

Priority areas:
1. Complete detail pages for squadrons, upgrades, and objectives
2. Add bug report/feedback dialog
3. Implement comments system
4. Add global search functionality

## License

TBD

## Acknowledgments

- Data provided by [api.swarmada.wiki](https://api.swarmada.wiki)
- UI components from [shadcn/ui](https://ui.shadcn.com)
- Built with [Next.js](https://nextjs.org)
