# 📦 Hướng dẫn Migrate Data vào Supabase

Có 3 cách để migrate data hiện có vào Supabase database:

## 🚀 Cách 1: Sử dụng Browser Console (KHUYẾN NGHỊ)

### Bước 1: Chạy Vite dev server
```bash
npm run dev
```

### Bước 2: Mở browser console (F12)

### Bước 3: Import Supabase và data
```javascript
// Import Supabase
const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');

// Setup client
const SUPABASE_URL = 'https://sqinywduzoailnglfdta.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxaW55d2R1em9haWxuZ2xmZHRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYxMTQwMjUsImV4cCI6MjA4MTY5MDAyNX0.evluE17Ei_5xk751BVwWrFwn1Mz6r4gBg7wH6p0scIk';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Import data từ Vite
const { galleryData } = await import('/src/data/index.ts?import');
// Hoặc import từng file:
const { illustrations } = await import('/src/data/illustrations.ts?import');
const { logos } = await import('/src/data/logos.ts?import');
// ... import các file khác

// Combine tất cả data
const allData = [
  ...illustrations,
  ...logos,
  // ... thêm các arrays khác
];
```

### Bước 4: Copy-paste script migration

Copy toàn bộ nội dung file `scripts/migrate-data-console.js` vào console, sau đó:

```javascript
// Run migration
await migrateData(allData);
```

---

## 🎨 Cách 2: Sử dụng HTML Migration Tool

1. Mở file `scripts/migrate-data-browser.html` trong browser
2. Nhập Supabase credentials (đã có sẵn)
3. Click "Test Connection" để verify
4. Trong browser console, import data và gọi:
   ```javascript
   migrateDataArray(yourDataArray);
   ```

---

## 💻 Cách 3: Tạo Script Node.js (Advanced)

Nếu bạn muốn chạy từ command line, cần setup tsx:

```bash
npm install -D tsx
```

Sau đó tạo script riêng để import và migrate data.

---

## 📋 Checklist trước khi migrate

- [ ] Đã chạy `database/schema.sql` trong Supabase
- [ ] Đã tạo storage bucket `artwork-media`
- [ ] Đã test connection thành công
- [ ] Đã backup data hiện tại (nếu cần)

## ⚠️ Lưu ý

- Migration sẽ **không duplicate** - nếu artwork đã tồn tại (theo slug) sẽ bỏ qua
- Tags sẽ được tạo tự động nếu chưa có
- Media URLs sẽ được lưu trực tiếp (không upload lại)
- Quá trình có thể mất vài phút nếu có nhiều data

## 🔍 Verify sau khi migrate

```sql
-- Check số lượng artworks
SELECT COUNT(*) FROM artworks;

-- Check tags
SELECT COUNT(*) FROM tags;

-- Check media
SELECT COUNT(*) FROM artwork_media;

-- Xem một vài artworks
SELECT id, title, category, status FROM artworks LIMIT 10;
```

---

**Sau khi migrate xong, bạn có thể refactor Gallery component để dùng API!**
