# 🚀 Quick Start - 9F Universe CMS

## Setup nhanh (5 phút)

### 1. Database Setup (QUAN TRỌNG NHẤT)

```bash
# 1. Mở Supabase Dashboard
# https://supabase.com/dashboard → Chọn project

# 2. SQL Editor → New Query
# Copy toàn bộ database/schema.sql → Paste → Run

# 3. Storage → New bucket
# Tên: artwork-media, Public: ON

# 4. Authentication → Users → Add user
# Sau đó chạy SQL:
# INSERT INTO users (id, email, role) 
# VALUES ('[user-id]', 'email@example.com', 'admin');
```

### 2. Chạy Project

```bash
npm run dev
```

### 3. Test

Mở browser console, chạy:
```javascript
// Test connection
const { supabase } = await import('./src/services/api/supabase');
const { data } = await supabase.from('artworks').select('*');
console.log('✅ Connected!', data);
```

## ✅ Checklist

- [ ] Đã chạy `database/schema.sql` trong Supabase
- [ ] Đã tạo bucket `artwork-media` (public)
- [ ] Đã tạo admin user và insert vào `users` table
- [ ] Đã chạy `npm install`
- [ ] Đã có file `.env.local` với Supabase credentials

## 📖 Chi tiết

- **Full setup guide**: `SETUP_COMPLETE.md`
- **Database setup**: `scripts/setup-database.md`
- **CMS Design**: `CMS_DESIGN.md`

---

**Nếu gặp lỗi, check `SETUP_COMPLETE.md` để troubleshoot!**
