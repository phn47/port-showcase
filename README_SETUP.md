# 🚀 9F Universe - Setup & Usage Guide

## 📋 Quick Start

### 1. Setup Database
1. Mở Supabase Dashboard → SQL Editor
2. Chạy `database/schema.sql`
3. Chạy `database/fix-rls-policies.sql` (nếu cần)
4. Tạo storage bucket `artwork-media` (public)

### 2. Environment Variables
File `.env.local`:
```
VITE_SUPABASE_URL=https://sqinywduzoailnglfdta.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Install & Run
```bash
npm install
npm run dev
```

### 4. Create Admin User
1. Supabase Dashboard → Authentication → Users → Add user
2. SQL Editor:
```sql
INSERT INTO users (id, email, role)
VALUES ('[user-id]', 'your-email@example.com', 'admin');
```

### 5. Migrate Data (Optional)
Truy cập: `http://localhost:5173/?migrate=true`

---

## 📚 Documentation

- **CMS Design**: `CMS_DESIGN.md` - Full design document
- **Implementation Guide**: `CMS_IMPLEMENTATION_GUIDE.md`
- **Admin Setup**: `ADMIN_SETUP.md`
- **Check RLS**: `CHECK_RLS_GUIDE.md`
- **Database Scripts**: `database/` folder

---

## 🎯 Admin Dashboard

- URL: `http://localhost:5173/admin`
- Login với email/password đã tạo
- Features:
  - Dashboard overview
  - Artworks CRUD
  - Timeline (coming soon)
  - Settings (coming soon)

---

## 🔧 Troubleshooting

### RLS Issues
- Check: `database/check-rls-and-roles.sql`
- Fix: `database/fix-rls-policies.sql`

### Migration Issues
- Check: `scripts/MIGRATE_DATA.md`
- Use: `http://localhost:5173/?migrate=true`

### Cursor Not Showing in Admin
- ✅ Fixed: Cursor tự động enable trong admin area

---

**Happy Coding! 🎨**
