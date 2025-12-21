# QuestHunt - Geocaching Adventure Platform

## 📱 Overview

QuestHunt is a mobile-first web application that transforms geocaching into an engaging, social, and interactive
experience. It enables users to create, participate in, and share location-based treasure hunts with friends and the
community.

## 🚀 Quick Start

### Prerequisites

- Node.js 20.x (LTS)
- pnpm 10.x
- Supabase account
- Optional: Map tiles token (MapTiler/Mapbox) if you plan to use a hosted tiles service with MapLibre

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/quest-hunt.git
   cd quest-hunt
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
    - Copy the root env example into the Next.js app (the app reads env from its folder):
   ```bash
   cp .env.example apps/web/.env.local
   ```
    - Fill in `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` from your Supabase project settings.
    - If you use hosted map tiles, set the map token as well (see Environment Variables below).

4. **Start the development server**
   ```bash
   pnpm dev
   ```
   The app will be available at `http://localhost:3000`

## 🎯 Key Features

### 🧭 Core Functionality

- **Interactive Treasure Hunts**: Create and participate in multi-location quests
- **Real-time Location Tracking**: Follow friends' progress in real-time
- **QR Code Integration**: Verify locations and unlock clues
- **Social Features**: In-app messaging, friend system, and activity sharing
- **Media Rich**: Support for photos, videos, and audio notes
- **Offline Support**: Continue your adventure even without internet

## 🛠 Tech Stack

### Frontend

- Framework: Next.js 16 (App Router)
- Language: TypeScript 5.9
- Styling: Tailwind CSS (v4 in app) + shadcn/ui + Radix UI
- State/Data: TanStack Query v5
- Maps: MapLibre GL (OpenStreetMap tiles by default)
- Forms/Validation: React Hook Form + Zod
- Rich text editor: TipTap for quest descriptions (sanitized on render)
- Authentication: Supabase Auth via `@supabase/ssr` (cookie-based SSR helpers)
- Icons/Notifications: Lucide React, Sonner

### Backend

- Runtime: Node.js 20+
- API: Next.js Route Handlers (in-app API under `apps/web/app/api/**`) using a cookie-aware Supabase server client
- Database: Supabase PostgreSQL (with PostGIS)
- Auth: Supabase Auth (via cookies on server components/route handlers)
- Storage/Realtime: Supabase Storage and Realtime
- Structure for forward-compatibility: shared Zod schemas and service modules under `apps/web/lib/server/*` to enable an
  easy migration to a NestJS service in `apps/api` later if needed

#### Rich text (TipTap) decision

- Pros: Excellent UX, extensible nodes/marks, collaborative potential; good React integration.
- Cons: Outputs HTML/ProseMirror JSON that must be sanitized before rendering; slightly heavier bundle than markdown.
- Alternatives: Simple Markdown editor (lighter, but fewer formatting options).
- Security: We sanitize HTML on the client using `dompurify` before injecting into the DOM.

### DevOps

- Monorepo: Turborepo workspaces (`apps/*`, `packages/*`)
- Package Manager: pnpm 10
- Hosting: Vercel (Next.js app) + Supabase (DB/Auth/Storage)
- CI/CD: GitHub Actions (planned)
- Monitoring: Vercel Analytics/Sentry (optional)
- Code Quality: ESLint + Prettier + TypeScript

## 🏗 Project Structure

```
quest-hunt/
├── apps/
│   └── web/                 # Next.js 16 App Router frontend (API routes included)
│       ├── app/             # Routes, server components, route handlers
│       ├── components/      # Reusable UI
│       ├── lib/             # Clients, utils (e.g., supabase client)
│       └── public/          # Static assets for the app
├── packages/                # (reserved for shared packages)
├── supabase/                # DB migrations and seed scripts (Supabase CLI)
├── README.md
├── action-plan.md
└── .env.example             # Example environment variables (copy to apps/web/.env.local)
```

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- pnpm 10+
- Supabase account (and CLI if you want local DB)
- Optional: Docker + Supabase CLI for local database

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/questhunt.git
   cd questhunt
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   Copy the example and update with your credentials:
   ```bash
   cp .env.example apps/web/.env.local
   ```

4. (Optional) **Start Supabase locally**
    - Install Supabase CLI: https://supabase.com/docs/guides/cli
    - Start local stack:
      ```bash
      cd supabase
      supabase start
      ```

5. **Run database migrations**
   ```bash
   pnpm db:push    # applies SQL in supabase/migrations
   pnpm db:seed    # optional: seeds demo data if configured
   ```

6. **Start the app**
    - From the repo root (Turborepo):
      ```bash
      pnpm dev
      ```
    - Or only the web app:
      ```bash
      pnpm -F web dev
      ```

7. **Open the application**
   Visit `http://localhost:3000` in your browser

## 🔑 Environment Variables

### Frontend (`apps/web/.env.local`)

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
# If you use Mapbox tiles with MapLibre
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your-mapbox-token
# If you use MapTiler tiles with MapLibre
NEXT_PUBLIC_MAPTILER_KEY=your-maptiler-key
```

Notes:

- Supabase project settings → API → copy Project URL and anon public key.
- For local Supabase (via CLI), the URL and keys are printed after `supabase start`.

## 🧪 Testing

### Run unit tests (Vitest)

```bash
# run all workspace tests
pnpm test

# or only web app tests
pnpm -F web test
```

### E2E tests (Playwright)

E2E tests are planned for the next milestone. A basic smoke suite will open `/quests` and verify filters update the URL.

## 🚀 Deployment

### Production Build

```bash
pnpm build
```

### Deploy to Vercel

1. Push your code to GitHub
2. Import the repository in Vercel and select `apps/web` as the app
3. Add env vars (same as local) in Vercel Project Settings → Environment Variables
4. Set Build Command: `pnpm -w install && pnpm -w build` or use Vercel’s Turborepo preset
5. Set Output: default (Next.js)
6. Deploy

### Database Migrations in Production

Use the Supabase dashboard or Supabase CLI to manage migrations against your hosted project. Root helpers:
```bash
pnpm db:push   # push SQL to Supabase project configured by CLI in ./supabase
pnpm db:seed   # seed helper script
```

## 📚 Documentation

- Key docs in repo:
    - geocaching-app-documentation.md (high-level architecture and choices)
    - action-plan.md (roadmap and current status)
    - supabase/migrations/* (DB schema)

## 🔒 Security Notes

- Use Supabase Row Level Security (RLS) on all tables (enable by default and add policies).
- Never expose service role keys in the client. Only use `NEXT_PUBLIC_SUPABASE_ANON_KEY` in the browser.
- Store secrets only in environment variables (local `.env.local`, Vercel env settings).
- Validate all inputs (Zod schemas used in Route Handlers).

## 🧭 Alternatives (and why we chose current stack)

- Authentication: NextAuth.js vs Supabase Auth
    - We use Supabase Auth for tight integration with the database and SSR cookies. NextAuth remains an option if we add
      OAuth providers decoupled from DB.
- Maps: MapLibre + OSM vs Mapbox GL
    - We use MapLibre for open-source flexibility; can swap in Mapbox/MapTiler hosted tiles if needed.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- OpenStreetMap for the amazing map data
- The open-source community for all the amazing tools and libraries
- All the beta testers and contributors

---

Built with ❤️ by the QuestHunt Team

## 🧩 Backend API Endpoints

All endpoints live inside the Next.js app (App Router) under `apps/web/app/api/**` and use Supabase Auth via cookies.

Auth/session:

- `GET /api/auth/me` → returns `{ user }` or `{ user: null }`

Quests:

- `GET /api/quests` → list quests (requires auth)
- `POST /api/quests` → create quest (requires auth)
- `GET /api/quests/:id` → get quest by id
- `PUT /api/quests/:id` → update own quest (requires auth)
- `DELETE /api/quests/:id` → delete own quest (requires auth)

Waypoints (child of quest):

- `GET /api/quests/:id/waypoints` → list waypoints for a quest
- `POST /api/quests/:id/waypoints` → create waypoint (quest owner only)
- `PUT /api/quests/:id/waypoints/:wpId` → update waypoint (quest owner only)
- `DELETE /api/quests/:id/waypoints/:wpId` → delete waypoint (quest owner only)

Progress:

- `POST /api/quests/:id/start` → start quest for current user
- `POST /api/quests/:id/complete` → complete quest for current user
- `POST /api/waypoints/:wpId/visit` → record a waypoint visit

Badges:

- `GET /api/badges` → list all badges
- `GET /api/badges/stats` → summary of user badge progress (requires auth)
- `POST /api/badges/evaluate` → trigger server-side badge evaluation (requires auth)

User Profiles:

- `GET /api/users/me` → current user profile
- `PUT /api/users/me` → update current profile (username, display_name, bio, location, avatar_url)
- `GET /api/users/:id` → public profile by id

Social:

- `GET /api/friends` → list friendships and pending requests (auth)
- `POST /api/friends` → send friend request with body `{ friend_id }` (auth)
- `PUT /api/friends/:id?action=accept|decline` → respond to a friend request (auth)
- `DELETE /api/friends/:id` → remove friendship (auth)
- `GET /api/activities` → development-only mocked activity feed (will be DB-backed)

Gamification:

- `GET /api/leaderboard` → top users by quests completed; query: `limit` (default 10, max 50)

### Database schema additions (Supabase)

New tables added via migrations in `supabase/migrations`:

- `quest_progress` (track user progress per quest)
- `waypoint_visits` (track visits per waypoint)
- `badges`, `user_badges` (simple badge system)

RLS policies are enabled for all tables. See migration files for details.

### Example: start a quest (curl)

```bash
curl -X POST http://localhost:3000/api/quests/<questId>/start \
  -H "Cookie: <your auth cookies>"
```

### Architecture note: NestJS later

We keep MVP velocity by using in-app API routes. Service modules and Zod schemas live under `apps/web/lib/server/*` so
we can migrate to a dedicated NestJS backend (`apps/api`) later with minimal rewrite. If/when complexity, background
jobs, or multiple clients demand it, we will introduce NestJS and move these modules over.

### Listing: /api/quests query parameters

Server-side filtering, sorting and pagination are supported via URL query params:

- `q` — optional search string (ILIKE on `title` and `description`)
- `difficulty` — optional: one of `easy|medium|hard|expert`
- `sort` — optional: `newest` (default) or `oldest`
- `page` — optional: page number starting at `1` (default `1`)
- `limit` — optional: page size (default `12`, max `50`)

Response shape:

```json
{
  "items": [],
  "page": 1,
  "limit": 12,
  "total": 42
}
```

Examples:

```bash
# Newest medium difficulty quests, page 2
curl "http://localhost:3000/api/quests?difficulty=medium&page=2&limit=12"

# Search by text and order oldest first
curl "http://localhost:3000/api/quests?q=forest&sort=oldest"
```

### Editor choice for quest descriptions

We use TipTap for rich text in quest descriptions.

Pros:

- Great developer ergonomics and extensibility
- Output as JSON or HTML; collaborative features available
- Active ecosystem and fine-grained control over toolbars and nodes

Cons:

- Heavier than a simple Markdown editor
- Requires sanitization before rendering (we use DOMPurify)

Alternatives considered: a light Markdown editor (smaller bundle, simpler) or a plain textarea (fastest, but no
formatting).
