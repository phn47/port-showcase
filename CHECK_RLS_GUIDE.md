# 🔍 Hướng dẫn Check RLS Policies & User Roles

## Cách 1: Sử dụng SQL Script (KHUYẾN NGHỊ)

### Bước 1: Mở Supabase Dashboard
1. Vào https://supabase.com/dashboard
2. Chọn project của bạn
3. Click **SQL Editor** (menu bên trái)

### Bước 2: Chạy Script
1. Copy toàn bộ nội dung file `database/check-rls-and-roles.sql`
2. Paste vào SQL Editor
3. Click **Run** hoặc nhấn `Ctrl+Enter`

### Bước 3: Xem kết quả
Script sẽ hiển thị:
- ✅ User roles trong database
- ✅ RLS policies status (enabled/disabled)
- ✅ Chi tiết tất cả policies
- ✅ Test permissions của current user
- ✅ Helper functions status

---

## Cách 2: Check qua Supabase Dashboard UI

### Check User Roles

1. **Table Editor** → `users` table
2. Xem columns: `id`, `email`, `role`
3. Verify user của bạn có `role = 'admin'` hoặc `'editor'`

### Check RLS Policies

1. **Authentication** → **Policies**
2. Hoặc **Table Editor** → Chọn table (ví dụ `artworks`)
3. Click tab **Policies**
4. Xem danh sách policies:
   - Policy name
   - Command (SELECT, INSERT, UPDATE, DELETE)
   - Using expression (điều kiện)
   - With check expression

---

## Cách 3: Test trực tiếp trong Browser Console

### Test 1: Check Current User

```javascript
const { supabase } = await import('/src/services/api/supabase.ts');

// Get current user
const { data: { user }, error: authError } = await supabase.auth.getUser();
console.log('Current Auth User:', user);

// Get user profile with role
const { data: profile, error: profileError } = await supabase
  .from('users')
  .select('*')
  .eq('id', user?.id)
  .single();
console.log('User Profile:', profile);
console.log('Role:', profile?.role);
```

### Test 2: Test RLS với Direct Query

```javascript
const { supabase } = await import('/src/services/api/supabase.ts');

// Test SELECT (should work for admin)
const { data, error } = await supabase
  .from('artworks')
  .select('*')
  .limit(5);
console.log('Artworks:', data);
console.log('Error:', error);

// Test INSERT (should work for admin/editor)
const testData = {
  title: 'Test Artwork',
  slug: 'test-artwork-' + Date.now(),
  category: 'Illustration',
  status: 'draft'
};
const { data: inserted, error: insertError } = await supabase
  .from('artworks')
  .insert(testData)
  .select();
console.log('Insert test:', inserted, insertError);
```

### Test 3: Check Policies

```javascript
// This requires service role key (not available in browser)
// Use Supabase Dashboard SQL Editor instead
```

---

## 🔧 Common Issues & Fixes

### Issue 1: User không có role

**Symptom:** User tồn tại trong `auth.users` nhưng không có trong `users` table

**Fix:**
```sql
-- Tìm user ID từ auth.users
SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';

-- Insert vào users table với role admin
INSERT INTO users (id, email, role)
VALUES ('[user-id-from-above]', 'your-email@example.com', 'admin');
```

### Issue 2: RLS Policies không hoạt động

**Symptom:** Policies tồn tại nhưng không apply

**Check:**
```sql
-- Verify RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'artworks';

-- Should return: rowsecurity = true
```

**Fix nếu RLS disabled:**
```sql
ALTER TABLE artworks ENABLE ROW LEVEL SECURITY;
```

### Issue 3: Policies quá strict

**Symptom:** Admin không thể access data

**Check policies:**
```sql
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'artworks';
```

**Fix:** Chạy lại `database/fix-rls-policies.sql` để đảm bảo policies đúng

### Issue 4: Helper Functions không tồn tại

**Check:**
```sql
SELECT proname FROM pg_proc 
WHERE proname IN ('is_admin', 'is_admin_or_editor');
```

**Fix:** Chạy lại `database/schema.sql` hoặc `database/fix-rls-policies.sql`

---

## ✅ Checklist

- [ ] User có trong `users` table với role `admin` hoặc `editor`
- [ ] RLS enabled trên tất cả tables (`rowsecurity = true`)
- [ ] Policies tồn tại cho tất cả tables
- [ ] Helper functions (`is_admin`, `is_admin_or_editor`) tồn tại
- [ ] Test query thành công (không có RLS error)

---

## 🎯 Quick Test

Chạy query này để verify tất cả:

```sql
-- Quick verification
SELECT 
  (SELECT COUNT(*) FROM users WHERE role IN ('admin', 'editor')) as admin_users,
  (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'artworks') as artwork_policies,
  (SELECT COUNT(*) FROM pg_proc WHERE proname IN ('is_admin', 'is_admin_or_editor')) as helper_functions,
  (SELECT COUNT(*) FROM artworks) as total_artworks;
```

Nếu tất cả > 0 → Setup đúng! ✅

---

**Chạy script `check-rls-and-roles.sql` để xem chi tiết!**
