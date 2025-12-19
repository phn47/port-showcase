# 🎭 CMS Design Document - 9F Universe

**Version:** 1.0  
**Date:** 2025-01-XX  
**Author:** Senior Full-stack Architect + Product Designer

---

## 📋 Mục lục

1. [Kiến trúc tổng quan](#1-kiến-trúc-tổng-quan)
2. [Data Model (Schema)](#2-data-model-schema)
3. [API Specification](#3-api-specification)
4. [Admin UI/UX Design](#4-admin-uiux-design)
5. [Package Dependencies](#5-package-dependencies)
6. [Tích hợp vào codebase hiện tại](#6-tích-hợp-vào-codebase-hiện-tại)
7. [Deploy & Vận hành](#7-deploy--vận-hành)
8. [Lộ trình triển khai](#8-lộ-trình-triển-khai)

---

## 1. Kiến trúc tổng quan

### 1.1. Sơ đồ kiến trúc

```
┌─────────────────────────────────────────────────────────────┐
│                    PUBLIC FRONTEND                          │
│  React 19 + Vite + Tailwind + Framer Motion                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Hero       │  │   Gallery    │  │   Timeline   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│         │                  │                  │             │
│         └──────────────────┼──────────────────┘             │
│                            │                                 │
│                    ┌───────▼────────┐                        │
│                    │  API Client    │                        │
│                    │  (React Query) │                        │
│                    └───────┬────────┘                        │
└────────────────────────────┼─────────────────────────────────┘
                             │
                             │ HTTPS / REST API
                             │
┌────────────────────────────▼─────────────────────────────────┐
│                    ADMIN DASHBOARD                           │
│  Route: /admin (Protected)                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Login      │  │  Artworks     │  │   Timeline   │      │
│  │   Auth       │  │   Manager     │  │   Editor     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Settings   │  │   Media      │  │   Audit Log  │      │
│  │   (Hero/SEO) │  │   Library    │  │              │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└────────────────────────────┬─────────────────────────────────┘
                             │
                             │ Supabase Client / API
                             │
┌────────────────────────────▼─────────────────────────────────┐
│                    BACKEND (Supabase)                        │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  PostgreSQL Database                                  │   │
│  │  - users, artworks, tags, timeline_entries, etc.      │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Supabase Auth (JWT)                                  │   │
│  │  - Email/Password, OAuth (optional)                   │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Supabase Storage                                     │   │
│  │  - artwork-media/ (images, videos)                    │   │
│  │  - timeline-media/                                    │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Edge Functions (Optional)                           │   │
│  │  - Image optimization, webhook handlers              │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 1.2. Lựa chọn Backend

**Default: Supabase (Lựa chọn A)**

**Lý do:**
- ✅ Deploy nhanh trên Vercel (không cần server riêng)
- ✅ Built-in Auth + RBAC
- ✅ PostgreSQL với Row Level Security (RLS)
- ✅ Storage tích hợp sẵn
- ✅ Real-time subscriptions (optional)
- ✅ Edge Functions cho serverless logic
- ✅ Free tier đủ cho MVP

**Trade-offs:**
- ⚠️ Vendor lock-in (nhưng có thể export data)
- ⚠️ Giới hạn free tier (500MB DB, 1GB storage)
- ⚠️ Ít control hơn so với self-hosted

**Alternatives:**

**Lựa chọn B: Node/Express + Prisma + PostgreSQL**
- ✅ Full control
- ✅ Deploy trên Vercel Serverless Functions
- ⚠️ Cần setup Auth (NextAuth.js hoặc JWT)
- ⚠️ Cần setup Storage (S3/Cloudflare R2)
- ⚠️ Phức tạp hơn, tốn thời gian hơn

**Lựa chọn C: Firebase**
- ✅ Real-time tốt
- ⚠️ NoSQL (không phù hợp với relational data)
- ⚠️ Pricing cao hơn khi scale

**Kết luận:** Chọn Supabase làm default, dễ deploy và đủ tính năng cho MVP.

---

## 2. Data Model (Schema)

### 2.1. Database Schema (PostgreSQL)

#### 2.1.1. `users`
Quản lý người dùng và roles.

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT, -- NULL nếu dùng OAuth
  role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin', 'editor', 'viewer')),
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
```

**Note:** Supabase Auth sẽ có bảng `auth.users` riêng. Bảng `users` này là profile extension.

#### 2.1.2. `tags`
Tags để filter và search artworks.

```sql
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  color TEXT DEFAULT '#000000', -- Màu hiển thị (optional)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tags_slug ON tags(slug);
CREATE INDEX idx_tags_name ON tags(name);
```

#### 2.1.3. `artworks`
Artworks/Projects chính.

```sql
CREATE TABLE artworks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  category TEXT NOT NULL, -- 'Illustration', 'Animation', 'Logo', etc.
  year INTEGER,
  medium TEXT, -- 'Digital', 'Traditional', etc.
  dimensions TEXT, -- '1500x1200' hoặc JSON
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  featured BOOLEAN DEFAULT FALSE,
  display_order INTEGER DEFAULT 0, -- Thứ tự hiển thị
  metadata JSONB, -- Flexible: colorPalette, keywords, etc.
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ,
  created_by UUID REFERENCES users(id),
  updated_by UUID REFERENCES users(id)
);

CREATE INDEX idx_artworks_status ON artworks(status);
CREATE INDEX idx_artworks_category ON artworks(category);
CREATE INDEX idx_artworks_display_order ON artworks(display_order);
CREATE INDEX idx_artworks_featured ON artworks(featured);
CREATE INDEX idx_artworks_slug ON artworks(slug);
CREATE INDEX idx_artworks_published_at ON artworks(published_at) WHERE status = 'published';
CREATE INDEX idx_artworks_metadata ON artworks USING GIN(metadata); -- Full-text search
```

#### 2.1.4. `artwork_media`
Media files (images/videos) của artworks.

```sql
CREATE TABLE artwork_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artwork_id UUID NOT NULL REFERENCES artworks(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('image', 'video')),
  url TEXT NOT NULL, -- Public URL từ Supabase Storage
  storage_key TEXT NOT NULL, -- Path trong bucket
  width INTEGER,
  height INTEGER,
  file_size BIGINT, -- Bytes
  alt_text TEXT,
  dominant_color TEXT, -- Hex color cho placeholder
  display_order INTEGER DEFAULT 0,
  is_primary BOOLEAN DEFAULT FALSE, -- Ảnh chính
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_artwork_media_artwork_id ON artwork_media(artwork_id);
CREATE INDEX idx_artwork_media_display_order ON artwork_media(display_order);
CREATE INDEX idx_artwork_media_is_primary ON artwork_media(is_primary);
```

#### 2.1.5. `artwork_tags`
Many-to-many relationship giữa artworks và tags.

```sql
CREATE TABLE artwork_tags (
  artwork_id UUID NOT NULL REFERENCES artworks(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (artwork_id, tag_id)
);

CREATE INDEX idx_artwork_tags_artwork_id ON artwork_tags(artwork_id);
CREATE INDEX idx_artwork_tags_tag_id ON artwork_tags(tag_id);
```

#### 2.1.6. `timeline_entries`
Timeline milestones.

```sql
CREATE TABLE timeline_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date_label TEXT NOT NULL, -- '2021 – 2022', '2025', etc.
  title TEXT NOT NULL,
  body TEXT,
  media_url TEXT, -- Optional image/video
  media_alt TEXT,
  display_order INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  metadata JSONB, -- Additional data (position: 'left'/'right'/'center')
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ,
  created_by UUID REFERENCES users(id),
  updated_by UUID REFERENCES users(id)
);

CREATE INDEX idx_timeline_entries_status ON timeline_entries(status);
CREATE INDEX idx_timeline_entries_display_order ON timeline_entries(display_order);
CREATE INDEX idx_timeline_entries_published_at ON timeline_entries(published_at) WHERE status = 'published';
```

#### 2.1.7. `site_settings`
Global settings (Hero, SEO, Social, Chat).

```sql
CREATE TABLE site_settings (
  key TEXT PRIMARY KEY, -- 'hero', 'seo', 'social', 'chat', etc.
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES users(id)
);

-- Seed data
INSERT INTO site_settings (key, value) VALUES
('hero', '{
  "headline": "WE DREAM",
  "subheadline": "WE DO",
  "cta": "WE DELIVER",
  "background_video_url": "https://...",
  "background_image_url": null
}'),
('seo', '{
  "title": "9F Universe",
  "description": "Creative portfolio of 9F Studio",
  "og_image": null,
  "twitter_handle": "@9FStudioArt"
}'),
('social', '{
  "twitter": "https://x.com/9FStudioArt",
  "email": "hello@9f.com",
  "instagram": null,
  "discord": null
}'),
('chat', '{
  "enabled": true,
  "provider": "gemini",
  "provider_key_reference": "GEMINI_API_KEY",
  "welcome_message": "Welcome to 9F Universe. How can we elevate your vision today?"
}');
```

#### 2.1.8. `revisions`
Version history (lightweight).

```sql
CREATE TABLE revisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL, -- 'artwork', 'timeline_entry', 'site_setting'
  entity_id UUID NOT NULL,
  snapshot JSONB NOT NULL, -- Full entity data tại thời điểm này
  author_id UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  comment TEXT -- Optional: "Updated description"
);

CREATE INDEX idx_revisions_entity ON revisions(entity_type, entity_id);
CREATE INDEX idx_revisions_created_at ON revisions(created_at DESC);
```

#### 2.1.9. `audit_logs`
Audit trail cho security và compliance.

```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES users(id),
  action TEXT NOT NULL, -- 'create', 'update', 'delete', 'publish', 'login', etc.
  entity_type TEXT, -- 'artwork', 'timeline_entry', 'user', etc.
  entity_id UUID,
  metadata JSONB, -- Additional context
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_actor_id ON audit_logs(actor_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
```

### 2.2. Row Level Security (RLS) Policies

**Assumption:** Supabase RLS sẽ được enable để bảo mật data.

```sql
-- Public read cho published artworks
ALTER TABLE artworks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view published artworks"
  ON artworks FOR SELECT
  USING (status = 'published');

-- Admin/Editor có thể CRUD
CREATE POLICY "Admins and editors can manage artworks"
  ON artworks FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'editor')
    )
  );

-- Tương tự cho các bảng khác...
```

---

## 3. API Specification

### 3.1. Base URL

- **Development:** `http://localhost:54321` (Supabase Local)
- **Production:** `https://[project-id].supabase.co`

### 3.2. Authentication

Tất cả protected endpoints yêu cầu JWT token trong header:

```
Authorization: Bearer <jwt_token>
```

Token được lấy từ Supabase Auth sau khi login.

### 3.3. Endpoints

#### 3.3.1. Authentication

**POST `/auth/v1/token?grant_type=password`**
- Login với email/password
- **Request:**
  ```json
  {
    "email": "admin@9f.com",
    "password": "secure_password"
  }
  ```
- **Response:**
  ```json
  {
    "access_token": "eyJ...",
    "refresh_token": "...",
    "user": {
      "id": "uuid",
      "email": "admin@9f.com",
      "role": "admin"
    }
  }
  ```

**POST `/auth/v1/logout`**
- Logout và invalidate token

#### 3.3.2. Artworks

**GET `/rest/v1/artworks`**
- Lấy danh sách artworks (public hoặc admin)
- **Query params:**
  - `status=published|draft|all` (default: published cho public, all cho admin)
  - `category=Illustration|Animation|...`
  - `tags=tag-slug-1,tag-slug-2`
  - `year=2024`
  - `featured=true`
  - `q=search+query` (full-text search)
  - `order=display_order.asc,created_at.desc`
  - `limit=20&offset=0`
- **Response:**
  ```json
  [
    {
      "id": "uuid",
      "title": "Anime Girl Portrait",
      "slug": "anime-girl-portrait",
      "description": "...",
      "category": "Illustration",
      "year": 2024,
      "status": "published",
      "featured": true,
      "display_order": 1,
      "created_at": "2024-01-01T00:00:00Z",
      "media": [
        {
          "id": "uuid",
          "url": "https://...",
          "type": "image",
          "is_primary": true,
          "alt_text": "..."
        }
      ],
      "tags": [
        { "id": "uuid", "name": "anime", "slug": "anime" }
      ]
    }
  ]
  ```

**GET `/rest/v1/artworks?id=eq.{id}`**
- Lấy chi tiết 1 artwork
- **Response:** Object artwork với đầy đủ media và tags

**POST `/rest/v1/artworks`** (Admin/Editor only)
- Tạo artwork mới
- **Request:**
  ```json
  {
    "title": "New Artwork",
    "slug": "new-artwork",
    "description": "...",
    "category": "Illustration",
    "year": 2024,
    "status": "draft",
    "tags": ["tag-id-1", "tag-id-2"],
    "media": [
      {
        "url": "https://...",
        "storage_key": "artwork-media/uuid.jpg",
        "type": "image",
        "is_primary": true,
        "alt_text": "..."
      }
    ]
  }
  ```
- **Response:** Created artwork object

**PATCH `/rest/v1/artworks?id=eq.{id}`** (Admin/Editor only)
- Update artwork
- **Request:** Partial object (chỉ gửi fields cần update)

**DELETE `/rest/v1/artworks?id=eq.{id}`** (Admin only)
- Xóa artwork (soft delete: set status='archived')

**POST `/rest/v1/artworks/reorder`** (Admin/Editor only)
- Bulk reorder artworks
- **Request:**
  ```json
  {
    "items": [
      { "id": "uuid-1", "display_order": 1 },
      { "id": "uuid-2", "display_order": 2 }
    ]
  }
  ```

**POST `/rest/v1/artworks/{id}/publish`** (Admin/Editor only)
- Publish artwork (set status='published', published_at=NOW())

**POST `/rest/v1/artworks/{id}/unpublish`** (Admin/Editor only)
- Unpublish artwork (set status='draft')

#### 3.3.3. Tags

**GET `/rest/v1/tags`**
- Lấy tất cả tags
- **Response:**
  ```json
  [
    { "id": "uuid", "name": "anime", "slug": "anime", "color": "#000000" }
  ]
  ```

**POST `/rest/v1/tags`** (Admin/Editor only)
- Tạo tag mới
- **Request:**
  ```json
  {
    "name": "New Tag",
    "slug": "new-tag",
    "color": "#000000"
  }
  ```

**PATCH `/rest/v1/tags?id=eq.{id}`** (Admin/Editor only)
- Update tag

**DELETE `/rest/v1/tags?id=eq.{id}`** (Admin only)
- Xóa tag (cascade xóa artwork_tags)

#### 3.3.4. Timeline

**GET `/rest/v1/timeline_entries?status=eq.published&order=display_order.asc`**
- Lấy published timeline entries (public)
- **Response:**
  ```json
  [
    {
      "id": "uuid",
      "date_label": "2021 – 2022",
      "title": "Undoxxed Artist",
      "body": "...",
      "media_url": "https://...",
      "display_order": 1,
      "metadata": { "position": "left" }
    }
  ]
  ```

**GET `/rest/v1/timeline_entries?id=eq.{id}`**
- Lấy chi tiết 1 entry

**POST `/rest/v1/timeline_entries`** (Admin/Editor only)
- Tạo entry mới

**PATCH `/rest/v1/timeline_entries?id=eq.{id}`** (Admin/Editor only)
- Update entry

**DELETE `/rest/v1/timeline_entries?id=eq.{id}`** (Admin only)
- Xóa entry

**POST `/rest/v1/timeline_entries/reorder`** (Admin/Editor only)
- Reorder entries

#### 3.3.5. Site Settings

**GET `/rest/v1/site_settings`**
- Lấy tất cả settings (public read, nhưng một số fields có thể ẩn)

**GET `/rest/v1/site_settings?key=eq.hero`**
- Lấy setting cụ thể

**PATCH `/rest/v1/site_settings?key=eq.{key}`** (Admin only)
- Update setting
- **Request:**
  ```json
  {
    "value": {
      "headline": "WE DREAM",
      "subheadline": "WE DO",
      "cta": "WE DELIVER",
      "background_video_url": "https://..."
    }
  }
  ```

#### 3.3.6. Media

**POST `/storage/v1/object/artwork-media/{filename}`**
- Upload file lên Supabase Storage
- **Headers:**
  ```
  Authorization: Bearer <token>
  Content-Type: image/jpeg (hoặc video/mp4)
  ```
- **Request:** Binary file data
- **Response:**
  ```json
  {
    "url": "https://[project].supabase.co/storage/v1/object/public/artwork-media/filename.jpg",
    "storage_key": "artwork-media/filename.jpg"
  }
  ```

**DELETE `/storage/v1/object/artwork-media/{filename}`** (Admin/Editor only)
- Xóa file

**POST `/rest/v1/artwork_media`** (Admin/Editor only)
- Tạo record trong DB sau khi upload
- **Request:**
  ```json
  {
    "artwork_id": "uuid",
    "url": "https://...",
    "storage_key": "artwork-media/uuid.jpg",
    "type": "image",
    "width": 1500,
    "height": 1200,
    "alt_text": "...",
    "is_primary": true,
    "display_order": 0
  }
  ```

#### 3.3.7. Revisions

**GET `/rest/v1/revisions?entity_type=eq.artwork&entity_id=eq.{id}&order=created_at.desc`**
- Lấy history của một entity
- **Response:**
  ```json
  [
    {
      "id": "uuid",
      "snapshot": { ... },
      "author": { "id": "uuid", "email": "admin@9f.com" },
      "created_at": "2024-01-01T00:00:00Z",
      "comment": "Updated description"
    }
  ]
  ```

**POST `/rest/v1/revisions/{id}/rollback`** (Admin/Editor only)
- Rollback về version cũ
- **Request:**
  ```json
  {
    "entity_type": "artwork",
    "entity_id": "uuid"
  }
  ```

#### 3.3.8. Audit Logs

**GET `/rest/v1/audit_logs?order=created_at.desc&limit=100`** (Admin only)
- Lấy audit logs
- **Query params:**
  - `actor_id=eq.{id}`
  - `action=eq.create`
  - `entity_type=eq.artwork`
  - `created_at=gte.2024-01-01`

#### 3.3.9. Search

**GET `/rest/v1/artworks?q=fts.{search_term}`**
- Full-text search (sử dụng PostgreSQL FTS)
- Hoặc filter bằng metadata JSONB

### 3.4. Validation

Sử dụng **Zod** cho validation ở client và server (Supabase Edge Functions).

**Example schema:**
```typescript
import { z } from 'zod';

export const artworkSchema = z.object({
  title: z.string().min(1).max(200),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  description: z.string().optional(),
  category: z.enum(['Illustration', 'Animation', 'Logo', 'Banner', 'NFT', 'Meme', 'Sticker', 'GIF', 'Social Media', 'Comic']),
  year: z.number().int().min(2000).max(2100).optional(),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
  featured: z.boolean().default(false),
  display_order: z.number().int().default(0),
});
```

### 3.5. Rate Limiting

**Assumption:** Sử dụng Supabase Rate Limiting hoặc Vercel Edge Middleware.

- Public endpoints: 100 requests/minute
- Authenticated: 500 requests/minute
- Upload: 10 requests/minute

---

## 4. Admin UI/UX Design

### 4.1. Design Principles

- **Minimalist:** Black/white only, clean typography
- **Keyboard-first:** Support keyboard shortcuts
- **Fast:** Optimistic updates, loading states
- **Safe:** Autosave, unsaved changes guard
- **Accessible:** WCAG 2.1 AA compliance

### 4.2. Wireframes & Components

#### 4.2.1. Login Screen

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│                                                     │
│              ┌─────────────────────┐                │
│              │                     │                │
│              │   9F UNIVERSE       │                │
│              │   ADMIN PORTAL      │                │
│              │                     │                │
│              │  ┌───────────────┐  │                │
│              │  │ Email         │  │                │
│              │  └───────────────┘  │                │
│              │                     │                │
│              │  ┌───────────────┐  │                │
│              │  │ Password      │  │                │
│              │  └───────────────┘  │                │
│              │                     │                │
│              │  [ LOGIN ]          │                │
│              │                     │                │
│              └─────────────────────┘                │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Features:**
- Email/password input
- "Remember me" checkbox
- Error messages (red text)
- Loading state khi submit

#### 4.2.2. Dashboard Overview

```
┌─────────────────────────────────────────────────────────────┐
│  [9F] ADMIN  │  Artworks  │  Timeline  │  Settings  │  [Logout] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  DASHBOARD                                                  │
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Published│  │  Drafts  │  │  Total   │  │  Recent  │   │
│  │    42    │  │    8     │  │   50     │  │  Edits   │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│                                                             │
│  RECENT ACTIVITY                                            │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ • Updated "Anime Girl Portrait" - 2 hours ago      │   │
│  │ • Published "Logo Design #5" - 5 hours ago        │   │
│  │ • Created "New Illustration" - 1 day ago           │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  QUICK ACTIONS                                              │
│  [ + New Artwork ]  [ + Timeline Entry ]  [ View Site ]    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Features:**
- Stats cards (published, drafts, total)
- Recent activity feed
- Quick actions buttons
- "View Site" mở public site trong tab mới

#### 4.2.3. Artworks List

```
┌─────────────────────────────────────────────────────────────┐
│  [9F] ADMIN  │  Artworks  │  Timeline  │  Settings  │  [Logout] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ARTWORKS                                    [ + New ]      │
│                                                             │
│  [Search...]  [Filter: All ▼]  [Category: All ▼]          │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ [✓] Thumb │ Title          │ Category │ Status │ ...│   │
│  ├─────────────────────────────────────────────────────┤   │
│  │ [ ] [img] │ Anime Girl     │ Illus.   │ Pub.   │ ...│   │
│  │ [ ] [img] │ Logo Design #5 │ Logo     │ Pub.   │ ...│   │
│  │ [ ] [img] │ New Work       │ Illus.   │ Draft  │ ...│   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  [Bulk: Publish] [Delete] [Reorder]                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Features:**
- Table view với sortable columns
- Search bar
- Filters (status, category, tags, year)
- Bulk actions (publish, delete, reorder)
- Click row để edit
- Quick publish toggle (switch)
- Drag-drop để reorder (optional)

#### 4.2.4. Artwork Editor

```
┌─────────────────────────────────────────────────────────────┐
│  [9F] ADMIN  │  Artworks  │  Timeline  │  Settings  │  [Logout] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  EDIT ARTWORK                          [Preview] [Save] [Publish]│
│                                                             │
│  ┌──────────────────────┐  ┌──────────────────────────┐    │
│  │                      │  │ Title: [____________]    │    │
│  │   [Media Upload]     │  │ Slug:  [____________]    │    │
│  │                      │  │                          │    │
│  │  [img] [img] [img]   │  │ Category: [Illustration▼]│    │
│  │  [Drag to reorder]   │  │ Year:    [2024]          │    │
│  │                      │  │                          │    │
│  │  [+ Add Media]       │  │ Description:             │    │
│  │                      │  │ [___________________]    │    │
│  │                      │  │ [___________________]    │    │
│  │                      │  │                          │    │
│  │                      │  │ Tags:                    │    │
│  │                      │  │ [anime] [portrait] [x]  │    │
│  │                      │  │ [+ Add Tag]             │    │
│  │                      │  │                          │    │
│  │                      │  │ Status: [Draft ▼]        │    │
│  │                      │  │ [✓] Featured             │    │
│  │                      │  │ Order: [1]              │    │
│  └──────────────────────┘  └──────────────────────────┘    │
│                                                             │
│  [Autosaved 2 minutes ago]                                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Features:**
- Split view: Media left, Form right
- Drag-drop media ordering
- Upload multiple files
- Tag picker (autocomplete)
- Autosave indicator
- Preview button (mở public page)
- Unsaved changes guard (confirm before leave)

#### 4.2.5. Timeline Editor

Tương tự Artwork Editor, nhưng fields:
- Date Label (text)
- Title
- Body (rich text optional)
- Media URL
- Display Order
- Position (left/right/center)

#### 4.2.6. Settings

```
┌─────────────────────────────────────────────────────────────┐
│  [9F] ADMIN  │  Artworks  │  Timeline  │  Settings  │  [Logout] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  SETTINGS                                                    │
│                                                             │
│  [Hero] [SEO] [Social] [Chat]                               │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ HERO SETTINGS                                        │   │
│  │                                                      │   │
│  │ Headline:        [WE DREAM]                          │   │
│  │ Subheadline:     [WE DO]                            │   │
│  │ CTA:             [WE DELIVER]                       │   │
│  │ Background Video: [URL____________] [Upload]        │   │
│  │                                                      │   │
│  │ [Save Changes]                                      │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ SEO SETTINGS                                         │   │
│  │                                                      │   │
│  │ Site Title:      [9F Universe]                       │   │
│  │ Description:     [Creative portfolio...]            │   │
│  │ OG Image:        [URL____________] [Upload]          │   │
│  │                                                      │   │
│  │ [Save Changes]                                      │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ CHAT SETTINGS                                         │   │
│  │                                                      │   │
│  │ [✓] Enable Chat                                     │   │
│  │ Provider:        [Gemini ▼]                         │   │
│  │ API Key Ref:     [GEMINI_API_KEY]                   │   │
│  │ Welcome Message: [Welcome to 9F...]                 │   │
│  │                                                      │   │
│  │ [Save Changes]                                      │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### 4.2.7. Media Library

```
┌─────────────────────────────────────────────────────────────┐
│  MEDIA LIBRARY                               [Upload Files] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  [Search...]  [Filter: All ▼]  [Sort: Newest ▼]           │
│                                                             │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐                       │
│  │[img]│ │[img]│ │[img]│ │[img]│ │[img]│                       │
│  └────┘ └────┘ └────┘ └────┘ └────┘                       │
│                                                             │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐                       │
│  │[img]│ │[img]│ │[img]│ │[img]│ │[img]│                       │
│  └────┘ └────┘ └────┘ └────┘ └────┘                       │
│                                                             │
│  Click image to edit: Alt text, Delete, Copy URL           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### 4.2.8. Audit Log

```
┌─────────────────────────────────────────────────────────────┐
│  AUDIT LOG                                                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  [Filter: All Actions ▼]  [User: All ▼]  [Date Range]      │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 2024-01-15 14:30  │ admin@9f.com │ Updated │ Artwork│   │
│  │                   │              │         │ #123   │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │ 2024-01-15 12:00  │ editor@9f.com│ Created │ Artwork│   │
│  │                   │              │         │ #124   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 4.3. Component Library

**Core Components:**
- `Button` (primary, secondary, danger)
- `Input` (text, textarea, select)
- `Modal` (confirm, form)
- `Table` (sortable, selectable)
- `Upload` (drag-drop, preview)
- `TagPicker` (autocomplete)
- `LoadingSpinner`
- `Toast` (success, error, info)

**Layout:**
- `AdminLayout` (sidebar navigation, header)
- `PageHeader` (title, actions)
- `Section` (card container)

---

## 5. Package Dependencies

### 5.1. Frontend (Public + Admin)

```json
{
  "dependencies": {
    "react": "^19.2.3",
    "react-dom": "^19.2.3",
    "react-router-dom": "^6.28.0",
    "framer-motion": "^12.23.26",
    "lucide-react": "^0.561.0",
    
    // API & Data
    "@supabase/supabase-js": "^2.47.0",
    "@tanstack/react-query": "^5.56.0",
    "zod": "^3.23.8",
    
    // Admin UI
    "@radix-ui/react-dialog": "^1.1.1",
    "@radix-ui/react-dropdown-menu": "^2.1.1",
    "@radix-ui/react-select": "^2.1.1",
    "@radix-ui/react-toast": "^1.2.1",
    "react-hook-form": "^7.53.0",
    "@hookform/resolvers": "^3.9.0",
    "react-dnd": "^16.0.1",
    "react-dnd-html5-backend": "^16.0.1",
    
    // Utils
    "date-fns": "^3.6.0",
    "clsx": "^2.1.1"
  },
  "devDependencies": {
    "@types/node": "^22.14.0",
    "@vitejs/plugin-react": "^5.0.0",
    "typescript": "~5.8.2",
    "vite": "^6.2.0",
    "@types/react": "^18.3.12",
    "@types/react-dom": "^18.3.5"
  }
}
```

### 5.2. Backend (Supabase)

**Không cần install packages riêng** - Supabase cung cấp:
- PostgreSQL database
- Auth service
- Storage service
- Edge Functions (optional, dùng Deno)

**Nếu dùng Edge Functions:**
- Deno runtime (built-in)
- `zod` cho validation
- `@supabase/supabase-js` (server-side)

---

## 6. Tích hợp vào codebase hiện tại

### 6.1. Refactor Plan

#### Step 1: Setup API Client

**Tạo `src/services/api/supabase.ts`:**
```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

#### Step 2: Create Data Hooks

**Tạo `src/hooks/useArtworks.ts`:**
```typescript
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/services/api/supabase';

export const useArtworks = (filters?: {
  category?: string;
  tags?: string[];
  status?: 'published' | 'draft' | 'all';
}) => {
  return useQuery({
    queryKey: ['artworks', filters],
    queryFn: async () => {
      let query = supabase
        .from('artworks')
        .select('*, media:artwork_media(*), tags:artwork_tags(tag:tags(*))');
      
      if (filters?.status === 'published') {
        query = query.eq('status', 'published');
      }
      
      // ... apply filters
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
};
```

#### Step 3: Update Gallery Component

**Refactor `src/components/sections/Gallery.tsx`:**
```typescript
// Thay thế:
import { galleryData } from '@/data/index';

// Bằng:
import { useArtworks } from '@/hooks/useArtworks';

const Gallery: React.FC = () => {
  const { data: artworks, isLoading } = useArtworks({ status: 'published' });
  
  // Fallback to static data nếu API fail
  const displayData = artworks || galleryData;
  
  // ... rest of component logic
};
```

#### Step 4: Update Timeline Component

Tương tự, tạo `useTimeline` hook và refactor `Timeline.tsx`.

#### Step 5: Update Hero Component

Tạo `useSiteSettings` hook để fetch Hero content từ API.

### 6.2. File Structure Mới

```
src/
├── services/
│   └── api/
│       ├── supabase.ts
│       └── types.ts (generated từ Supabase)
├── hooks/
│   ├── useArtworks.ts
│   ├── useTimeline.ts
│   ├── useSiteSettings.ts
│   └── useAuth.ts
├── features/
│   └── admin/
│       ├── components/
│       ├── pages/
│       └── hooks/
├── data/ (giữ lại làm fallback/seed)
└── components/ (giữ nguyên, chỉ thay data source)
```

### 6.3. Caching Strategy

- **React Query** với staleTime: 5 phút
- **Fallback:** Nếu API fail, dùng static data từ `src/data/`
- **Optimistic updates** cho admin actions

### 6.4. Migration Script

Tạo script để migrate static data vào Supabase:

**`scripts/migrate-data.ts`:**
```typescript
// Đọc từ src/data/*.ts
// Transform sang format DB
// Insert vào Supabase
```

---

## 7. Deploy & Vận hành

### 7.1. Environment Variables

**.env.local:**
```env
VITE_SUPABASE_URL=https://[project-id].supabase.co
VITE_SUPABASE_ANON_KEY=[anon-key]
VITE_SUPABASE_SERVICE_ROLE_KEY=[service-role-key] # Chỉ dùng ở server-side
GEMINI_API_KEY=[key] # Cho chat feature (optional)
```

### 7.2. Database Migrations

**Sử dụng Supabase CLI:**
```bash
supabase init
supabase migration new create_tables
# Edit migration file
supabase db push
```

**Hoặc dùng Supabase Dashboard:**
- SQL Editor → chạy migration scripts

### 7.3. Seeding Data

**Tạo seed script:**
```typescript
// scripts/seed.ts
// Insert sample artworks, tags, timeline entries
```

### 7.4. Vercel Deployment

1. **Connect repo** lên Vercel
2. **Set environment variables** trong Vercel dashboard
3. **Build command:** `npm run build`
4. **Output directory:** `dist`
5. **Deploy**

**Note:** Supabase không cần deploy riêng, chỉ cần setup project trên Supabase dashboard.

### 7.5. Storage Setup

**Trong Supabase Dashboard:**
1. Storage → Create bucket `artwork-media`
2. Set public access
3. Set RLS policies (public read, admin write)

### 7.6. Backup & Export

**Backup:**
- Supabase tự động backup hàng ngày (paid plan)
- Hoặc dùng `pg_dump` để export

**Export/Import JSON:**
```typescript
// scripts/export.ts
// Query all artworks + timeline
// Export thành JSON file

// scripts/import.ts
// Read JSON
// Insert vào DB
```

---

## 8. Lộ trình triển khai

### Milestone 1: MVP (2-3 tuần)

**Week 1: Setup & Core**
- [ ] Setup Supabase project
- [ ] Tạo database schema (migrations)
- [ ] Setup API client trong frontend
- [ ] Implement authentication (login/logout)
- [ ] Tạo admin layout (navigation, routing)

**Week 2: Artworks Management**
- [ ] Artworks list page (table, filters, search)
- [ ] Artwork editor (form, media upload)
- [ ] CRUD operations (create, update, delete)
- [ ] Publish/unpublish
- [ ] Bulk actions

**Week 3: Timeline & Settings**
- [ ] Timeline editor
- [ ] Site settings (Hero, SEO, Social, Chat)
- [ ] Media library
- [ ] Basic audit log

**Deliverable:** Admin có thể quản lý artworks và timeline, public site fetch data từ API.

---

### Milestone 2: v1.0 (1-2 tuần)

**Week 4: Polish & Features**
- [ ] Tags management
- [ ] Revisions/history
- [ ] Autosave
- [ ] Preview functionality
- [ ] Image optimization (resize, format conversion)
- [ ] Export/import JSON

**Week 5: Testing & Deploy**
- [ ] E2E testing (Playwright/Cypress)
- [ ] Performance optimization
- [ ] Security audit (RLS policies)
- [ ] Documentation
- [ ] Deploy to production

**Deliverable:** Production-ready CMS với đầy đủ tính năng.

---

### Milestone 3: v1.1 (Optional, 1 tuần)

**Enhancements:**
- [ ] Real-time collaboration (Supabase Realtime)
- [ ] Advanced search (full-text, filters)
- [ ] Analytics dashboard
- [ ] Webhook integrations
- [ ] Multi-language support (i18n)

---

## 9. Assumptions & Notes

### Assumptions:
1. **Supabase free tier đủ cho MVP** (500MB DB, 1GB storage)
2. **Chat feature dùng Gemini API** (hoặc có thể disable)
3. **Không cần real-time collaboration** trong MVP
4. **Single admin/editor** trong giai đoạn đầu (có thể scale sau)
5. **Media files < 10MB mỗi file** (Supabase limit)

### Notes:
- **RLS Policies:** Cần test kỹ để đảm bảo security
- **Image Optimization:** Có thể dùng Supabase Storage Transformations hoặc Cloudflare Images
- **Backup:** Nên setup automated backup ngay từ đầu
- **Monitoring:** Dùng Supabase Dashboard + Vercel Analytics

---

## 10. Next Steps

1. **Review design document** với team
2. **Setup Supabase project** và tạo schema
3. **Implement MVP** theo lộ trình
4. **Test thoroughly** trước khi deploy
5. **Iterate** dựa trên feedback

---

**End of Document**
