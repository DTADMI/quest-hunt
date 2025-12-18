# QuestHunt - Geocaching Adventure Platform

## 📱 Overview

QuestHunt is a mobile-first web application that transforms geocaching into an engaging, social, and interactive
experience. It enables users to create, participate in, and share location-based treasure hunts with friends and the
community.

## 🚀 Quick Start

### Prerequisites

- Node.js 20.x (LTS)
- pnpm 8.x
- Supabase account
- Mapbox access token (for maps)

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
   ```bash
   cp .env.example .env.local
   ```
   Update the `.env.local` file with your credentials.

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

- **Framework**: Next.js 14.1.0 (App Router)
- **Language**: TypeScript 5.3.3
- **Styling**: Tailwind CSS 3.4.0 + shadcn/ui
- **State Management**: TanStack Query v5 + Zustand
- **Maps**: MapLibre GL (OpenStreetMap)
- **Forms**: React Hook Form + Zod
- **Authentication**: NextAuth.js v4.24.5
- **UI Components**: Radix UI + shadcn/ui
- **Icons**: Lucide React
- **Notifications**: Sonner

### Backend

- **Runtime**: Node.js 20.11.0
- **Language**: TypeScript 5.3.3
- **API**: REST + WebSockets
- **Database**: Supabase PostgreSQL 15 with PostGIS
- **ORM**: Drizzle ORM
- **Auth**: Supabase Auth
- **Storage**: Supabase Storage
- **Real-time**: Supabase Realtime

### DevOps

- **Version Control**: Git + GitHub
- **Package Manager**: pnpm 8.14.0
- **Frontend Hosting**: Vercel
- **Backend Hosting**: Supabase + Vercel Edge Functions
- **CI/CD**: GitHub Actions
- **Monitoring**: Sentry + Vercel Analytics
- **Code Quality**: ESLint + Prettier

## 🏗 Project Structure

```
/questhunt
├── /apps
│   ├── /web/                  # Next.js 14 frontend
│   │   ├── app/               # App Router
│   │   ├── components/        # Reusable UI components
│   │   ├── lib/               # Utility functions
│   │   └── styles/            # Global styles
│   └── /api/                  # API routes
├── /packages
│   ├── /config/              # Shared configurations
│   │   ├── eslint/           # ESLint config
│   │   └── tailwind/         # Tailwind config
│   ├── /db/                  # Database schemas and types
│   └── /ui/                  # Shared UI components
├── /supabase
│   ├── /migrations/          # Database migrations
│   └── /seed/                # Seed data
├── .github/                  # GitHub configurations
├── .husky/                   # Git hooks
├── .vscode/                  # VS Code settings
├── public/                   # Static assets
└── .env.*                    # Environment configurations
├── /supabase            # Database migrations and seed data
└── /docs                # Project documentation
```

## 🚀 Quick Start

### Prerequisites

- Node.js 20.x
- pnpm 8.x
- Docker (for local development)
- Supabase account
- Mapbox access token (for MapLibre GL)

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
   Copy the example environment files and update with your credentials:
   ```bash
   cp apps/web/.env.example apps/web/.env.local
   cp apps/api/.env.example apps/api/.env
   ```

4. **Start Supabase locally**
   ```bash
   cd supabase
   docker-compose up -d
   ```

5. **Run database migrations**
   ```bash
   pnpm db:push
   pnpm db:seed
   ```

6. **Start development servers**
   In separate terminals:
   ```bash
   # Terminal 1 - Frontend
   pnpm dev:web
   
   # Terminal 2 - Backend
   pnpm dev:api
   ```

7. **Open the application**
   Visit `http://localhost:3000` in your browser

## 🔑 Environment Variables

### Frontend (`.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret
NEXT_PUBLIC_MAPBOX_TOKEN=your-mapbox-token
```

### Backend (`.env`)

```env
PORT=3001
NODE_ENV=development
DATABASE_URL=postgresql://postgres:postgres@localhost:54322/postgres
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-jwt-secret
SUPABASE_SERVICE_ROLE=your-supabase-service-role
```

## 🧪 Testing

### Run unit tests

```bash
pnpm test
```

### Run E2E tests

```bash
pnpm test:e2e
```

## 🚀 Deployment

### Production Build

```bash
pnpm build
```

### Deploy to Vercel

1. Push your code to GitHub
2. Connect your Vercel project to the repository
3. Set up environment variables in Vercel
4. Deploy!

### Database Migrations in Production

```bash
pnpm db:migrate:prod
```

## 📚 Documentation

- [API Documentation](/docs/API.md)
- [Database Schema](/docs/DATABASE.md)
- [Authentication Flow](/docs/AUTH.md)
- [Deployment Guide](/docs/DEPLOYMENT.md)

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
