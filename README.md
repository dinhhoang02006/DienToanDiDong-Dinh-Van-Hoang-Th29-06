# 💬 Online Chat System (Admin - User)

Hệ thống **chat trực tuyến giữa Admin và Người dùng** giúp hỗ trợ khách hàng nhanh chóng thông qua giao diện web.
Người dùng có thể gửi tin nhắn trực tiếp và Admin có thể phản hồi theo thời gian thực.

---

## 📌 Giới thiệu

Online Chat System là một ứng dụng web cho phép:

* Người dùng gửi tin nhắn hỗ trợ
* Admin nhận và trả lời tin nhắn
* Hiển thị tin nhắn theo thời gian thực
* Quản lý cuộc trò chuyện

Hệ thống giúp cải thiện trải nghiệm hỗ trợ khách hàng và tăng tốc độ phản hồi.

---

## 🚀 Chức năng chính

### 👤 Người dùng

* Đăng nhập / đăng ký tài khoản
* Gửi tin nhắn đến Admin
* Nhận phản hồi từ Admin
* Xem lịch sử chat

### 🛠️ Admin

* Đăng nhập hệ thống
* Xem danh sách người dùng
* Trả lời tin nhắn
* Quản lý cuộc trò chuyện
* Theo dõi lịch sử chat

---

## 🖥️ Công nghệ sử dụng

| Công nghệ             | Mô tả                   |
| --------------------- | ----------------------- |
| HTML / CSS            | Xây dựng giao diện      |
| JavaScript            | Xử lý logic phía client |
| PHP / NodeJS          | Xử lý backend           |
| MySQL / MongoDB       | Lưu trữ dữ liệu         |
| WebSocket / Socket.io | Chat thời gian thực     |

---

## ⚙️ Cài đặt dự án

### 1️⃣ Clone repository

```bash
git clone https://github.com/dinhhoang02006/DienToanDiDong-Dinh-Van-Hoang-Th29-06.git
```

### 2️⃣ Di chuyển vào thư mục project

```bash
cd online-chat-system
```

### 3️⃣ Cài đặt dependencies

```bash
npm install
```

### 4️⃣ Chạy server

```bash
npm start
```

---

## 🌐 Truy cập ứng dụng

Sau khi chạy server, mở trình duyệt:

```
http://localhost:3000
```

---

## 🗄️ Database

Ví dụ bảng tin nhắn:

| id | user_id | message             | sender | time  |
| -- | ------- | ------------------- | ------ | ----- |
| 1  | 2       | Xin chào            | user   | 10:30 |
| 2  | 2       | Tôi có thể giúp gì? | admin  | 10:31 |

---

## 🔒 Bảo mật

* Xác thực đăng nhập
* Phân quyền Admin / User
* Mã hóa mật khẩu

---

## 📈 Hướng phát triển

* Thông báo realtime
* Gửi file / hình ảnh
* Chat nhóm
* Lưu trữ lịch sử chat lâu dài
* Tích hợp AI chatbot

---

## 👨‍💻 Tác giả

**Dinh Van Hoang**

---

## 📄 License

This project is licensed under the MIT License.
