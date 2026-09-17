# BC95 Capstone Next.js

Ứng dụng học và quản lý khóa học trực tuyến cho CyberSoft Academy.

## Phát triển

Cài đặt dependency và khởi động development server:

```bash
npm install
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000) trong trình duyệt. Các biến môi trường API được đọc từ file `.env.local`.

## Tài khoản demo

| Vai trò | Tài khoản | Mật khẩu |
| --- | --- | --- |
| user | `.99` | `1234` |
| admin | `.1` | `12312423` |

## Kiểm tra

```bash
npm run lint
npx tsc --noEmit
npm run build
```
