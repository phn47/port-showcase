# Database Setup Instructions

## Bước 1: Chạy SQL Schema

1. Mở Supabase Dashboard: https://supabase.com/dashboard
2. Chọn project của bạn
3. Vào **SQL Editor** (menu bên trái)
4. Click **New Query**
5. Copy toàn bộ nội dung file `database/schema.sql`
6. Paste vào SQL Editor
7. Click **Run** hoặc nhấn `Ctrl+Enter`

## Bước 2: Tạo Storage Bucket

1. Vào **Storage** trong Supabase Dashboard
2. Click **New bucket**
3. Tên bucket: `artwork-media`
4. **Public bucket**: Bật ON
5. Click **Create bucket**

## Bước 3: Tạo Admin User

### Option A: Via Supabase Dashboard

1. Vào **Authentication** → **Users**
2. Click **Add user** → **Create new user**
3. Nhập email và password
4. Copy **User ID** (UUID)
5. Vào **SQL Editor**, chạy:

```sql
INSERT INTO users (id, email, role)
VALUES ('[paste-user-id-here]', 'admin@9f.com', 'admin');
```

### Option B: Via SQL (nếu đã có user)

```sql
-- Tìm user ID từ auth.users
SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';

-- Insert vào users table với role admin
INSERT INTO users (id, email, role)
VALUES ('[user-id-from-above]', 'your-email@example.com', 'admin');
```

## Bước 4: Verify Setup

Chạy query này để verify:

```sql
-- Check tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check RLS policies
SELECT tablename, policyname FROM pg_policies 
WHERE schemaname = 'public';

-- Check users
SELECT id, email, role FROM users;
```

## Troubleshooting

- **RLS Policy Error**: Đảm bảo đã chạy toàn bộ schema.sql, không bỏ sót phần RLS policies
- **Storage Error**: Kiểm tra bucket name phải đúng là `artwork-media` và public access đã bật
- **Auth Error**: Đảm bảo user đã được tạo trong `auth.users` trước khi insert vào `users` table
