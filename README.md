# TMDT Shop

Website thương mại điện tử cho cửa hàng công nghệ TMDT Shop, gồm khu vực cửa hàng cho khách hàng và CMS quản trị nội bộ.

## Chức Năng Chính

- Cửa hàng: xem sản phẩm, lọc/tìm kiếm, giỏ hàng, đặt hàng, mã giảm giá, phí vận chuyển.
- Tài khoản khách hàng: đăng ký, đăng nhập, cập nhật hồ sơ/avatar, xem lịch sử đơn, hủy đơn chờ xác nhận.
- CMS quản trị: dashboard, sản phẩm, danh mục, coupon, đơn hàng, báo cáo, đánh giá, câu hỏi khách, bảo hành/đổi trả, AI training.
- Phân quyền: `SUPER_ADMIN`, `ADMIN`, `STAFF`, `CUSTOMER`.
- Chatbox hỗ trợ AI dùng dữ liệu training trong CMS.

## Yêu Cầu Cài Đặt

- Node.js 20 trở lên
- XAMPP hoặc MySQL local
- Visual Studio Code

Kiểm tra Node.js:

```bash
node -v
npm -v
```

## Cấu Hình Database

1. Mở XAMPP.
2. Start `MySQL`.
3. Mở phpMyAdmin:

```text
http://localhost/phpmyadmin
```

4. Tạo database:

```text
hoangminh_db
```

## Cài Đặt Project

Mở terminal tại thư mục `HoangMinh`, nơi có file `package.json`.

```bash
cd HoangMinh
npm install
```

Tạo file `.env` bằng cách copy từ `.env.example`:

```env
DATABASE_URL="mysql://root:@127.0.0.1:3306/hoangminh_db?connect_timeout=10"
ADMIN_SESSION_SECRET="doi-chuoi-bi-mat-khi-deploy"
GEMINI_API_KEY=""
GEMINI_MODEL="gemini-2.5-flash"
```

Nếu MySQL có mật khẩu, sửa `DATABASE_URL`.

Ví dụ mật khẩu MySQL là `123456`:

```env
DATABASE_URL="mysql://root:123456@127.0.0.1:3306/hoangminh_db?connect_timeout=10"
```

Đẩy schema Prisma và tạo dữ liệu mẫu:

```bash
npm run prisma:push
npm run db:seed
```

## Chạy Website

Chạy môi trường development:

```bash
npm run dev
```

Mở cửa hàng:

```text
http://localhost:3000
```

Mở CMS:

```text
http://localhost:3000/admin
```

## Tài Khoản Demo

Sau khi chạy `npm run db:seed`, có thể dùng các tài khoản sau:

| Vai trò | Email | Mật khẩu | Trang đăng nhập | Quyền chính |
|---|---|---|---|---|
| Super Admin | `admin@tmdtshop.local` | `admin123` | `/admin/login` | Toàn quyền CMS, quản lý người dùng và cài đặt |
| Admin | `manager@tmdtshop.local` | `admin123` | `/admin/login` | Quản lý catalog, coupon, vận chuyển và vận hành |
| Staff | `staff@tmdtshop.local` | `staff123` | `/admin/login` | Xử lý đơn hàng, đánh giá, câu hỏi khách, bảo hành/đổi trả, AI training |
| Customer | `customer@tmdtshop.local` | `customer123` | `/login` | Mua hàng, xem đơn cá nhân, hủy đơn chờ xác nhận, đánh giá, gửi hỗ trợ |

## Phân Quyền CMS

- `STAFF`: chỉ vào nhóm vận hành, không quản lý sản phẩm, danh mục, coupon, vận chuyển, người dùng, cài đặt.
- `ADMIN`: quản lý catalog, coupon, vận chuyển và vận hành, không quản lý người dùng/cài đặt hệ thống.
- `SUPER_ADMIN`: toàn quyền, gồm quản lý nhân sự, khóa/mở tài khoản và cài đặt hệ thống.

## Lệnh Kiểm Tra

Kiểm tra TypeScript:

```bash
npx tsc --noEmit
```

Kiểm tra lint:

```bash
npm run lint
```

Kiểm tra build production:

```bash
npm run build
```

Chạy smoke test:

```bash
npm run test:smoke
```

Mở Prisma Studio:

```bash
npm run prisma:studio
```

## Lỗi Thường Gặp

### Không tìm thấy `package.json`

Bạn đang chạy lệnh sai thư mục. Hãy vào đúng thư mục project:

```bash
cd HoangMinh
```

### Không kết nối được MySQL

Kiểm tra:

- XAMPP đã bật MySQL.
- Database `hoangminh_db` đã được tạo.
- File `.env` đúng thông tin kết nối.
- Nếu MySQL có mật khẩu, `DATABASE_URL` đã có mật khẩu.

### Port 3000 đã được dùng

Tắt terminal đang chạy project cũ, hoặc đổi port trong script `dev` của `package.json`.

### Sau khi đổi database bị thiếu bảng/dữ liệu

Chạy lại:

```bash
npm run prisma:push
npm run db:seed
```

## Ghi Chú Bàn Giao Source

Source bàn giao không cần kèm các thư mục/file sinh tự động:

- `node_modules`
- `.next`
- `.next-build`
- `.next-dev`
- `.next-dev-3001`
- `tsconfig.tsbuildinfo`
- `.env`
- các thư mục nội bộ của AI agent như `.agent`, `.agents`, `_bmad`, `_bmad-output`

Khi nhận source, chỉ cần chạy lại:

```bash
npm install
npm run prisma:push
npm run db:seed
npm run dev
```
