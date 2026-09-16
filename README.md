# BC95 Capstone Next.js

Ứng dụng học và quản lý khóa học trực tuyến cho CyberSoft Academy.

## Phát triển

Cài đặt dependency và khởi động development server:

```bash
npm install
npm run dev
```

Tạo file môi trường từ mẫu trước khi chạy:

```bash
copy .env.example .env.local
```

Trên macOS/Linux có thể dùng:

```bash
cp .env.example .env.local
```

Các biến bắt buộc:

- `CYBERSOFT_API_BASE_URL`: URL API CyberSoft.
- `CYBERSOFT_API_TOKEN`: token ứng dụng CyberSoft.
- `AUTH_SESSION_SECRET`: chuỗi bí mật dài, dùng để mã hóa session cookie. Có thể tạo bằng `openssl rand -base64 32`.

Các tên cũ `NEXT_PUBLIC_API_BASE_URL` và `NEXT_PUBLIC_API_TOKEN_CYBERSOFT` vẫn được hỗ trợ tạm thời để tương thích với môi trường hiện tại, nhưng không nên dùng cho môi trường mới vì biến `NEXT_PUBLIC_*` có thể bị đưa vào client bundle.

Mở [http://localhost:3000](http://localhost:3000) trong trình duyệt.

> API CyberSoft hiện không trả trường trạng thái trong `chiTietKhoaHocGhiDanh`, và các endpoint `ChoXetDuyet`/`DaXetDuyet` yêu cầu quyền quản trị trên môi trường này. Vì vậy giao diện học viên dùng nhãn trung lập "Đã đăng ký" khi API chỉ xác nhận có đăng ký; trạng thái "Đang chờ xét duyệt" được hiển thị sau khi thao tác đăng ký thành công. Màn quản trị vẫn dùng các endpoint trạng thái để xét duyệt chính xác.

## Kiểm tra

```bash
npm run lint
npx tsc --noEmit
npm run test
npm run build
```
