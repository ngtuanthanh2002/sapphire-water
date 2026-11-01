# Kết nối Blog với Supabase

Project: [`lftldpcjlgfrrwxgdykw`](https://supabase.com/dashboard/project/lftldpcjlgfrrwxgdykw)

Làm lần lượt 5 bước dưới đây, mất khoảng 10 phút.

## Bước 1. Điền key vào `.env.local`

1. Mở Dashboard → **Project Settings** → **API Keys**.
2. Sao chép **Publishable key** (bắt đầu bằng `sb_publishable_`). Nếu project chỉ hiện key `anon`, dùng key đó cũng được.
3. Mở file `.env.local` ở thư mục gốc dự án và dán key vào:

```env
NEXT_PUBLIC_SUPABASE_URL=https://lftldpcjlgfrrwxgdykw.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxxxxxxx
```

Nếu chưa có file này, sao chép từ `.env.example`:

```bash
cp .env.example .env.local
```

> Không dùng **Secret key** (`sb_secret_…`) hay `service_role` ở đây: giá trị `NEXT_PUBLIC_` sẽ lộ ra trình duyệt. Publishable key thì an toàn để công khai, vì quyền được kiểm soát bằng RLS trong database.

## Bước 2. Tạo bảng

Chọn **một** trong hai cách. File SQL chạy lại nhiều lần vẫn an toàn.

### Cách A: dùng SQL Editor (đơn giản nhất)

1. Mở [SQL Editor](https://supabase.com/dashboard/project/lftldpcjlgfrrwxgdykw/sql/new).
2. Dán toàn bộ nội dung file [`supabase/migrations/20261101000000_blog.sql`](../supabase/migrations/20261101000000_blog.sql).
3. Bấm **Run**.

### Cách B: dùng lệnh

```bash
npx supabase login
npx supabase link --project-ref lftldpcjlgfrrwxgdykw
npx supabase db push
```

Lệnh `link` sẽ hỏi mật khẩu database. Nếu quên, đặt lại ở **Project Settings** → **Database**.

### Migration tạo những gì

| Thành phần | Công dụng |
| --- | --- |
| Bảng `posts` | Bài viết, cả nháp và đã đăng |
| Bảng `comments` | Bình luận: tên người viết, nội dung, thời gian |
| Bảng `admin_users` | Danh sách tài khoản được quyền quản trị |
| Hàm `is_admin()` | Kiểm tra quyền quản trị |
| Hàm `set_post_like()` | Tăng hoặc giảm lượt thích |
| Bucket `blog-images` | Lưu ảnh bài viết, tối đa 10 MB mỗi ảnh |

## Bước 3. Tạo tài khoản quản trị

1. Mở Dashboard → **Authentication** → **Users** → **Add user** → **Create new user**.
2. Nhập email và mật khẩu, tích **Auto Confirm User**, rồi bấm tạo.
3. Vào [SQL Editor](https://supabase.com/dashboard/project/lftldpcjlgfrrwxgdykw/sql/new), thay email của bạn rồi chạy:

```sql
insert into public.admin_users (user_id)
select id from auth.users where email = 'email-cua-ban@example.com';
```

Kết quả phải là `INSERT 0 1` (hoặc `1 row`). Nếu là 0 dòng thì email chưa khớp với tài khoản vừa tạo.

Muốn thêm quản trị viên khác, lặp lại bước này. Tài khoản không có trong `admin_users` sẽ bị từ chối ở trang đăng nhập.

Đăng nhập ở website bằng chính email và mật khẩu vừa tạo. Để kiểm tra tài khoản đã đủ điều kiện chưa, chạy lệnh sau: cả hai cột `da_xac_nhan` và `la_quan_tri` phải là `true`.

```sql
select u.email,
       u.email_confirmed_at is not null as da_xac_nhan,
       a.user_id is not null as la_quan_tri
from auth.users u
left join public.admin_users a on a.user_id = u.id;
```

## Bước 4. Tắt đăng ký công khai

Vào **Authentication** → **Sign In / Providers** → **Email**, tắt **Allow new users to sign up**, rồi **Save**.

Website không có trang đăng ký và các tài khoản lạ không làm được gì, nhưng tắt đi để không ai tạo được tài khoản qua API. Bạn vẫn thêm tài khoản được bằng tay ở Bước 3.

## Bước 5. Chạy và kiểm tra

```bash
npm install
npm run dev
```

Khởi động lại `npm run dev` nếu nó đang chạy từ trước khi sửa `.env.local`.

1. Mở <http://localhost:3000>, bấm biểu tượng người dùng trên menu, đăng nhập bằng tài khoản ở Bước 3.
2. Trang `/blog` hiện thêm nút **Đăng bài** và **Quản lý bài viết**. Bấm biểu tượng người dùng để mở menu tài khoản và **Đăng xuất**.
3. Viết thử một bài, chèn một ảnh, bấm **Đăng bài**.
4. Mở cửa sổ ẩn danh, vào bài vừa đăng, gửi thử một bình luận.
5. Kiểm tra dữ liệu ở Dashboard → **Table Editor** → `posts` và `comments`.

## Đưa lên hosting (Vercel hoặc nơi khác)

Khai báo cùng 2 biến ở Bước 1 trong phần Environment Variables của hosting, rồi **build lại**. Các biến này được gắn vào lúc build, nên chỉ thêm biến mà không build lại thì không có tác dụng.

## Sử dụng trình soạn thảo

- **Chèn ảnh:** đặt con trỏ tại vị trí muốn chèn rồi bấm biểu tượng ảnh, hoặc kéo thả, hoặc dán ảnh thẳng vào nội dung.
- **Chỉnh ảnh:** bấm vào ảnh để chọn độ rộng, căn trái/giữa/phải, nhập mô tả hoặc xóa. Kéo ảnh để đổi vị trí.
- **Xuống dòng:** `Enter` tạo đoạn mới, `Shift+Enter` xuống dòng trong cùng đoạn.
- **Phím tắt:** `Ctrl+B` đậm, `Ctrl+I` nghiêng, `Ctrl+U` gạch chân, `Ctrl+Z` hoàn tác.
- **Ảnh đại diện** chỉ hiện ở danh sách bài viết. Muốn có ảnh trong bài thì chèn vào nội dung.
- **Xóa bình luận:** khi đã đăng nhập, mỗi bình luận có biểu tượng thùng rác.

## Xử lý lỗi thường gặp

| Hiện tượng | Nguyên nhân và cách xử lý |
| --- | --- |
| Nút **Đăng nhập** bị mờ, không bấm được | `.env.local` chưa có key (lưu ý: ứng dụng không đọc `.env.example`), hoặc chưa khởi động lại `npm run dev` |
| "Email hoặc mật khẩu không đúng" | Sai email hoặc mật khẩu. Nếu quên mật khẩu, xóa tài khoản rồi làm lại Bước 3 |
| "Tài khoản chưa được xác nhận email" | Quên tích **Auto Confirm User**. Xóa tài khoản rồi làm lại Bước 3 |
| "Tài khoản này không có quyền quản trị" | Chưa chạy lệnh `insert` ở Bước 3, hoặc email trong lệnh chưa khớp |
| "Không lưu được bài viết" hoặc Blog trống | Chưa chạy migration ở Bước 2. Xem lỗi chi tiết trong terminal |
| "Không tải được ảnh lên" | Chưa chạy migration nên chưa có bucket `blog-images`, hoặc định dạng ảnh không được hỗ trợ |

## Đổi hoặc thêm chuyên mục

Chuyên mục được khai báo ở hai nơi và phải khớp nhau:

1. `CATEGORIES` trong [`src/lib/blog/types.ts`](../src/lib/blog/types.ts).
2. Ràng buộc `check (category in (...))` của bảng `posts`.
