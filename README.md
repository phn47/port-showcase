# 9F Universe - Portfolio Showcase + CMS

A creative portfolio website with avant-garde black-white minimal aesthetic, built with React 19 + TypeScript + Vite + Tailwind CSS + Framer Motion.

## ✨ Features

- 🎨 **Public Portfolio**: Hero, Interactive Gallery (filter + search), Timeline, Contact
- 🛠️ **Admin Dashboard**: Content management system for artworks, timeline, and settings
- 🎭 **Animations**: Preloader, Custom Cursor (magnetic), Parallax scroll, Floating controls
- 📦 **Headless CMS**: Supabase backend with REST API

## 🚀 Quick Start

See `README_SETUP.md` for detailed setup instructions.

### Basic Setup

1. **Database**: Run `database/schema.sql` in Supabase SQL Editor
2. **Storage**: Create bucket `artwork-media` (public)
3. **Admin User**: Create user and insert into `users` table with role `admin`
4. **Run**: `npm install && npm run dev`

## 📚 Documentation

- `README_SETUP.md` - Setup & usage guide
- `CMS_DESIGN.md` - Full CMS design document (1300+ lines)
- `CMS_IMPLEMENTATION_GUIDE.md` - Implementation details
- `ADMIN_SETUP.md` - Admin dashboard setup
- `CHECK_RLS_GUIDE.md` - RLS policies troubleshooting
- `SETUP_COMPLETE.md` - Initial setup checklist

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Framer Motion
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **State**: React Query (@tanstack/react-query)
- **Routing**: React Router v6

## 📁 Project Structure

```
src/
├── components/     # Public UI components
│   ├── layout/    # Navigation, Footer
│   ├── sections/  # Hero, Gallery, Timeline, Contact
│   ├── ui/        # Custom Cursor, Marquee, Floating Controls
│   └── common/    # Preloader
├── features/       # Feature modules
│   └── admin/     # Admin dashboard (CRUD, Settings)
├── hooks/          # React hooks (useArtworks, useAuth, useTags)
├── services/      # API clients (Supabase)
├── providers/     # Context providers (QueryProvider)
└── data/          # Static data (fallback)
```

## 🎯 Admin Dashboard

- URL: `http://localhost:5173/admin`
- Features:
  - ✅ Dashboard overview
  - ✅ Artworks CRUD (List, Create, Edit, Delete, Publish)
  - ⏳ Timeline editor (coming soon)
  - ⏳ Settings page (coming soon)

## 📦 Database Scripts

- `database/schema.sql` - Main database schema
- `database/fix-rls-policies.sql` - Fix RLS policies
- `database/check-rls-and-roles.sql` - Diagnostic queries
- `database/allow-migration-insert.sql` - Temporary policies for migration

## 🔧 Scripts

- `scripts/setup-database.md` - Database setup guide
- `scripts/MIGRATE_DATA.md` - Data migration guide
- `scripts/verify-migration.sql` - Verify migration results

---

**Built with ❤️ for 9F Universe**
