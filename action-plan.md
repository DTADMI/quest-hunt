# QuestHunt Action Plan

*Last Updated: December 19, 2025*

## 🟢 Completed

### Core Infrastructure

- [x] Set up Next.js 16 project with TypeScript
- [x] Configured Tailwind CSS (v4) with shadcn/ui components
- [x] Set up ESLint and Prettier with custom rules
- [x] Configured TypeScript with strict type checking
- [x] Set up Supabase integration (DB/Auth/Storage)
- [x] Added Supabase SSR server client (`apps/web/lib/supabase/server.ts`)

### Backend API

- [x] Quest endpoints implemented (`/api/quests`, `/api/quests/[id]`)
- [x] Waypoints endpoints implemented (`/api/quests/[id]/waypoints`, `/api/quests/[id]/waypoints/[wpId]`)
- [x] Progress endpoints implemented (`/api/quests/[id]/start`, `/api/quests/[id]/complete`,
  `/api/waypoints/[wpId]/visit`)
- [x] Badges endpoints implemented (`/api/badges`, `/api/badges/stats`, `/api/badges/evaluate`)
- [x] Shared Zod schemas and service modules under `apps/web/lib/server/*` for forward-compatibility
- [x] Supabase migrations for progress, visits, and badges with RLS

### Map Integration

- [x] Integrated MapLibre GL JS for interactive maps
- [x] Created reusable MapContainer component
- [x] Added marker management system
- [x] Implemented current location detection
- [x] Added geolocation controls

### UI Components

- [x] Set up theme provider
- [x] Created responsive navigation
- [x] Implemented toast notifications
- [x] Added form validation with Zod

## 🟡 In Progress

### Quest Management

- [x] Set up quest API endpoints (Next.js Route Handlers under `apps/web/app/api/quests`)
- [ ] Implement quest creation form
  - [x] Add form fields for quest details (title, description, difficulty, duration) — basic Textarea for now
  - [x] Implement rich text editor for quest descriptions (TipTap) — sanitize on render
  - [ ] Add image upload for quest cover (deferred)
  - [x] Implement waypoint management with map integration (basic persistence on creation)
  - [x] Add waypoint edit/delete and reorder within the form UI
  - [x] Add form validation (Zod + RHF) and server-side validation
- [ ] Create quest listing page (basic server component exists, refine UI and filters)
    - [ ] Design and implement quest cards
  - [x] Add server-side filtering by difficulty (URL params → DB query)
  - [x] Implement sorting options (newest/oldest) server-side
  - [x] Add server-side search (ILIKE on title/description)
  - [x] Implement pagination (page/limit)

#### Quest Detail Page

- [x] Implement `/quests/[id]` page
  - [x] Fetch quest + waypoints (via API)
  - [x] Render map with markers
  - [x] Start quest action using `POST /api/quests/:id/start`
  - [x] Render rich description (stored HTML; sanitizer component available)

### User Profiles

- [ ] Design user profile page
    - [ ] User information section
    - [ ] User stats (quests completed, created, etc.)
    - [ ] Activity feed
    - [ ] Badges and achievements
- [ ] Implement profile editing
    - [ ] Basic info (name, bio, location)
    - [ ] Avatar upload
    - [ ] Social links
    - [ ] Notification preferences
- [ ] Add user statistics dashboard
    - [ ] Quest completion metrics
    - [ ] Activity history
    - [ ] Achievement progress

## 🔴 Planned

### Social Features

- [ ] Implement friend system
- [ ] Add activity feed
- [ ] Create messaging system
- [ ] Add social sharing

### Advanced Map Features

- [ ] Add route planning
- [ ] Implement offline maps
- [ ] Add custom map styles
- [ ] Integrate with more map providers

### Gamification

- [ ] Design achievement system
- [ ] Implement leaderboards
- [ ] Add badges and rewards
- [ ] Create challenges and events

### Performance & Optimization

- [ ] Implement image optimization
- [ ] Add code splitting
- [ ] Set up performance monitoring
- [ ] Implement caching strategies

### Testing

- [ ] Add unit tests
- [ ] Implement integration tests
- [ ] Set up E2E testing
- [ ] Add accessibility testing

### Documentation

- [x] Write API documentation (README updated with endpoints)
- [ ] Create user guides
- [ ] Add developer documentation
- [ ] Create deployment guides

## 📅 Upcoming Milestones

### Milestone 1: MVP (Target: Jan 15, 2026)

- [ ] Complete quest creation flow
- [ ] Implement basic user profiles
- [ ] Deploy to staging environment

### Milestone 2: Social Features (Target: Feb 15, 2026)

- [ ] Implement friend system
- [ ] Add activity feed
- [ ] Create messaging system

### Milestone 3: Gamification (Target: Mar 15, 2026)

- [ ] Implement achievement system
- [ ] Add leaderboards
- [ ] Create challenges and events

## 📊 Progress

```mermaid
gantt
    title QuestHunt Development Timeline
    dateFormat  YYYY-MM-DD
    section Core
    Project Setup           :done,    des1, 2025-12-10, 7d
    Authentication         :done,    des2, after des1, 5d
    Map Integration        :done,    des3, after des2, 5d
    section Quests
    Quest Creation         :active,  des4, after des3, 10d
    Quest Discovery        :         des5, after des4, 7d
    section Social
    User Profiles          :         des6, after des5, 7d
    Friend System          :         des7, after des6, 7d
    section Gamification
    Achievements           :         des8, after des7, 7d
    Leaderboards           :         des9, after des8, 5d
```

## 📝 Notes

- All dates are estimates and subject to change
- Priorities may shift based on user feedback
- New features may be added to the roadmap as needed

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
