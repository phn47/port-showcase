# 🎨 Admin Dashboard Setup

## ✅ Đã hoàn thành

- ✅ Admin routing (`/admin/*`)
- ✅ Login page
- ✅ Admin layout với sidebar
- ✅ Dashboard page với stats
- ✅ Authentication hooks
- ✅ Protected routes

## 🚀 Cách sử dụng

### 1. Tạo Admin User (nếu chưa có)

Trong Supabase Dashboard → SQL Editor, chạy:

```sql
-- Tạo user trong auth.users trước (qua Supabase Auth UI)
-- Sau đó insert vào users table:
INSERT INTO users (id, email, role)
VALUES (
  '[user-id-from-auth]',
  'admin@9f.com',
  'admin'
);
```

### 2. Truy cập Admin Dashboard

1. Chạy dev server: `npm run dev`
2. Mở: `http://localhost:5173/admin`
3. Sẽ redirect đến `/admin/login`
4. Login với email/password đã tạo

### 3. Các trang hiện có

- **Dashboard** (`/admin`) - Overview với stats
- **Artworks** (`/admin/artworks`) - Coming soon
- **Timeline** (`/admin/timeline`) - Coming soon
- **Settings** (`/admin/settings`) - Coming soon

## 📋 Next Steps

### Bước tiếp theo: Artworks Management

1. **Artworks List Page**
   - Table view với filters
   - Search, sort, pagination
   - Quick actions (publish, delete)

2. **Artwork Editor**
   - Form để create/edit
   - Media upload
   - Tag management
   - Preview

3. **Timeline Editor**
   - CRUD cho timeline entries
   - Drag-drop reorder

4. **Settings Page**
   - Hero settings
   - SEO settings
   - Social links
   - Chat config

## 🎯 Files Structure

```
src/features/admin/
├── AdminApp.tsx          # Main admin router
├── components/
│   └── AdminLayout.tsx   # Sidebar + layout
└── pages/
    ├── LoginPage.tsx     # Login
    └── DashboardPage.tsx # Dashboard
```

## 🔒 Security

- Routes được protect bởi `useAuth` hook
- Chỉ authenticated users mới vào được
- RLS policies trong Supabase đảm bảo data security

---

**Admin Dashboard đã sẵn sàng! Bước tiếp theo: Implement Artworks CRUD 🎨**
