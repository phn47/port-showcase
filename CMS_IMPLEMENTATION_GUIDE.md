# 🚀 CMS Implementation Guide - 9F Universe

Hướng dẫn triển khai CMS dựa trên thiết kế trong `CMS_DESIGN.md`.

---

## 📋 Quick Start

### 1. Setup Supabase

1. Tạo project mới tại [supabase.com](https://supabase.com)
2. Lấy **Project URL** và **Anon Key** từ Settings → API
3. Chạy migration SQL từ `database/schema.sql`:
   - Vào SQL Editor trong Supabase Dashboard
   - Copy toàn bộ nội dung `database/schema.sql`
   - Execute

### 2. Setup Storage Bucket

1. Vào Storage trong Supabase Dashboard
2. Tạo bucket mới: `artwork-media`
3. Set public access: `true`
4. RLS policies đã được setup trong schema.sql

### 3. Install Dependencies

```bash
npm install @supabase/supabase-js @tanstack/react-query zod react-router-dom
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-select @radix-ui/react-toast
npm install react-hook-form @hookform/resolvers react-dnd react-dnd-html5-backend
npm install date-fns clsx
```

### 4. Environment Variables

Tạo file `.env.local`:

```env
VITE_SUPABASE_URL=https://[your-project-id].supabase.co
VITE_SUPABASE_ANON_KEY=[your-anon-key]
```

### 5. Setup API Client

1. Copy `src/services/api/supabase.example.ts` → `src/services/api/supabase.ts`
2. Update imports nếu cần

### 6. Create First Admin User

**Option A: Via Supabase Dashboard**
1. Authentication → Users → Add User
2. Tạo user với email/password
3. Vào Database → SQL Editor, chạy:
   ```sql
   INSERT INTO users (id, email, role)
   VALUES ('[user-id-from-auth]', 'admin@9f.com', 'admin');
   ```

**Option B: Via Supabase CLI**
```bash
supabase auth signup --email admin@9f.com --password your_password
# Sau đó update role trong DB như trên
```

---

## 📁 File Structure

Sau khi setup, cấu trúc sẽ như sau:

```
src/
├── services/
│   └── api/
│       ├── supabase.ts          # Supabase client (copy từ example)
│       └── types.ts             # TypeScript types
├── hooks/
│   ├── useArtworks.ts           # React Query hook cho artworks
│   ├── useTimeline.ts           # React Query hook cho timeline
│   ├── useSiteSettings.ts       # React Query hook cho settings
│   └── useAuth.ts               # Auth hook
├── features/
│   └── admin/                   # Admin dashboard
│       ├── components/
│       ├── pages/
│       └── hooks/
└── components/                  # Public components (giữ nguyên)
```

---

## 🔧 Implementation Steps

### Step 1: Create React Query Hooks

**`src/hooks/useArtworks.ts`:**
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { artworks } from '@/services/api/supabase';
import type { ArtworkFilters, CreateArtworkRequest } from '@/services/api/types';

export const useArtworks = (filters?: ArtworkFilters) => {
  return useQuery({
    queryKey: ['artworks', filters],
    queryFn: () => artworks.list(filters || {}),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCreateArtwork = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (payload: CreateArtworkRequest) => artworks.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['artworks'] });
    },
  });
};

// Tương tự cho update, delete, publish...
```

### Step 2: Refactor Gallery Component

**Update `src/components/sections/Gallery.tsx`:**
```typescript
import { useArtworks } from '@/hooks/useArtworks';
import { artworkToGalleryItem } from '@/services/api/types';
import { galleryData } from '@/data/index'; // Fallback

const Gallery: React.FC = () => {
  const { data: artworks, isLoading, error } = useArtworks({ 
    status: 'published' 
  });
  
  // Fallback to static data if API fails
  const displayData = artworks 
    ? artworks.map(artworkToGalleryItem)
    : galleryData;
  
  // ... rest of component logic (giữ nguyên animations, filters, etc.)
};
```

### Step 3: Create Admin Routes

**`src/App.tsx`:**
```typescript
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import PublicApp from './PublicApp';
import AdminApp from './features/admin/AdminApp';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin/*" element={<AdminApp />} />
        <Route path="/*" element={<PublicApp />} />
      </Routes>
    </BrowserRouter>
  );
}
```

**`src/features/admin/AdminApp.tsx`:**
```typescript
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import AdminLayout from './components/AdminLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ArtworksPage from './pages/ArtworksPage';
import ArtworkEditorPage from './pages/ArtworkEditorPage';
// ... other pages

export default function AdminApp() {
  const { user, isLoading } = useAuth();
  
  if (isLoading) return <div>Loading...</div>;
  
  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/admin/login" />} />
      </Routes>
    );
  }
  
  return (
    <AdminLayout>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/artworks" element={<ArtworksPage />} />
        <Route path="/artworks/:id" element={<ArtworkEditorPage />} />
        <Route path="/artworks/new" element={<ArtworkEditorPage />} />
        {/* ... other routes */}
      </Routes>
    </AdminLayout>
  );
}
```

### Step 4: Implement Admin Pages

Xem wireframes trong `CMS_DESIGN.md` section 4.2 để implement từng page.

**Key components cần tạo:**
- `AdminLayout` - Sidebar + Header
- `ArtworksList` - Table với filters
- `ArtworkEditor` - Form với media upload
- `MediaLibrary` - Grid view với upload
- `SettingsForm` - Hero/SEO/Social/Chat settings

---

## 🧪 Testing

### Test API Connection

```typescript
// Test trong browser console hoặc component
import { supabase } from '@/services/api/supabase';

// Test connection
const { data, error } = await supabase.from('artworks').select('*').limit(1);
console.log('Connection test:', data, error);
```

### Test Authentication

```typescript
import { auth } from '@/services/api/supabase';

// Test login
await auth.signIn('admin@9f.com', 'password');
```

---

## 🚢 Deployment

### Vercel

1. Push code lên GitHub
2. Connect repo trong Vercel
3. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy

### Supabase

- Không cần deploy riêng, chỉ cần setup project trên Supabase Dashboard

---

## 📝 Migration từ Static Data

Tạo script `scripts/migrate-data.ts`:

```typescript
import { artworks } from '../src/services/api/supabase';
import { galleryData } from '../src/data/index';

async function migrate() {
  for (const item of galleryData) {
    // Transform galleryData item to CreateArtworkRequest
    // Insert vào Supabase
    await artworks.create({
      title: item.title,
      slug: item.id,
      category: item.category as ArtworkCategory,
      // ... map other fields
    });
  }
}

migrate();
```

---

## 🔒 Security Checklist

- [ ] RLS policies đã được enable trên tất cả tables
- [ ] Admin routes được protect bằng auth check
- [ ] Service role key chỉ dùng ở server-side (Edge Functions)
- [ ] File upload có validation (type, size)
- [ ] Rate limiting được setup (Supabase hoặc Vercel)

---

## 📚 Resources

- [Supabase Docs](https://supabase.com/docs)
- [React Query Docs](https://tanstack.com/query/latest)
- [Design Document](./CMS_DESIGN.md)

---

## 🆘 Troubleshooting

### RLS Policy Errors

Nếu gặp lỗi "new row violates row-level security policy":
- Check user role trong `users` table
- Verify RLS policies trong Supabase Dashboard
- Test với service role key (chỉ trong development)

### CORS Issues

Supabase tự động handle CORS, nhưng nếu gặp vấn đề:
- Check `VITE_SUPABASE_URL` có đúng không
- Verify Supabase project settings

### Image Upload Fails

- Check bucket name: `artwork-media`
- Verify bucket is public
- Check file size limits (Supabase free tier: 50MB max)

---

**Happy Coding! 🎨**
