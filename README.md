# Popket - Project Management Platform
Demo clip: https://drive.google.com/file/d/1YF3Yxb_l2IJx7fWKxQBhV3NJoeO58Pe6/view?usp=drive_link
Popket là một nền tảng quản lý dự án mạnh mẽ, giúp các nhóm làm việc (teams) lên kế hoạch, phân chia công việc (task management), theo dõi tiến độ và cộng tác một cách hiệu quả. Được xây dựng dựa trên kiến trúc Microservices hiện đại, Popket đảm bảo hiệu suất cao, khả năng mở rộng tốt và tính khả dụng cao cho doanh nghiệp.

## ✨ Tính năng chính (Dự kiến)

- **Quản lý Dự án & Task:** Tạo dự án, phân công công việc, thiết lập trạng thái (Kanban board), deadline và độ ưu tiên.
- **Cộng tác:** Bình luận, đính kèm file, và theo dõi lịch sử hoạt động của task.
- **Thông báo (Notifications):** Thông báo thời gian thực về các thay đổi quan trọng trong dự án.
- **Quản lý người dùng & Phân quyền:** Quản lý thành viên, vai trò (roles) và quyền hạn (permissions).
- **Báo cáo & Phân tích:** Thống kê tiến độ, năng suất của team và các metrics quan trọng khác.

## 🛠 Công nghệ sử dụng

Dự án được xây dựng với các công nghệ tiên tiến nhất hiện nay:

| Thành phần            | Công nghệ                                                                            |
| --------------------- | ------------------------------------------------------------------------------------ |
| **Frontend**          | [Next.js](https://nextjs.org/) (React Framework)                                     |
| **Backend**           | [NestJS](https://nestjs.com/) (Node.js Framework), [Nx](https://nx.dev/) (Nx)        |
| **Kiến trúc**         | Microservices                                                                        |
| **Database chính**    | [MySQL](https://www.mysql.com/) (Lưu trữ data)                                       |
| **Database phụ**      | [PostgreSQL](https://www.postgresql.org/) (Lưu giữ vector comment)                   |
| **Caching & Session** | [Redis](https://redis.io/)                                                           |
| **Message Broker**    | [RabbitMQ](https://www.rabbitmq.com/) (Giao tiếp bất đồng bộ giữa các Microservices) |
| **Containerization**  | [Docker](https://www.docker.com/) & Docker Compose                                   |

## 📁 Cấu trúc dự án

```
project-management-system/
├── backend/                      # NestJS Microservices
│   ├── apps/
│   │   ├── api-gateway/         # API Gateway Service
│   │   ├── auth-service/        # Authentication & Authorization
│   │   ├── project-service/     # Project Management
│   │   ├── audit-service/       # Audit Logging
│   │   ├── notification-service/ # Notifications
│   │   └── storage-service/     # File Storage
│   ├── packages/                # Shared libraries & utilities
│   └── Dockerfile
├── frontend/                     # Next.js Application
│   ├── src/
│   │   ├── components/          # Reusable React components
│   │   ├── pages/               # Next.js pages
│   │   ├── services/            # API service clients
│   │   ├── store/               # State management
│   │   ├── types/               # TypeScript type definitions
│   │   └── utils/               # Utility functions
│   └── Dockerfile
├── scripts/                      # Database initialization scripts
├── documents/                    # Project documentation & diagrams
└── docker-compose.yml           # Main orchestration file

```

## Hướng dẫn cài đặt và chạy dự án (Local Development)

Để chạy dự án Popket trên máy cá nhân, vui lòng đảm bảo máy bạn đã cài đặt sẵn:

- **[Docker](https://docs.docker.com/get-docker/)** (phiên bản 20.10+)
- **[Docker Compose](https://docs.docker.com/compose/install/)** (phiên bản 2.0+)
- **[Git](https://git-scm.com/)** (để clone repository)

### Bước 1: Clone Repository

```bash
git clone https://github.com/LiemLiemLiem12/project-management-system.git
cd project-management-system
```

### Bước 2: Cấu hình biến môi trường

Môi trường mặc định của dự án đã được định nghĩa trong file `.env.example`. Bạn cần tạo file `.env` thực tế từ file mẫu này.

Chạy lệnh sau trong terminal tại thư mục gốc của dự án:

```bash
# Trên Linux/macOS
cp .env.example .env

# Trên Windows (Command Prompt)
copy .env.example .env
```

**Lưu ý:** Mở file `.env` vừa tạo và điền/chỉnh sửa các thông số (như mật khẩu DB, API keys...) nếu cần thiết.

### Bước 3: Docker Build

```bash
docker compose build
```

### Bước 4: Khởi động hệ thống với Docker Compose

Popket sử dụng Docker Compose để khởi chạy toàn bộ các services (Next.js, NestJS, PostgreSQL, Redis, RabbitMQ...) chỉ bằng một lệnh duy nhất.

```bash
docker compose up -d
```

Cờ `-d` (detached mode) giúp các container chạy ngầm, giải phóng terminal của bạn.

Sau khi lệnh chạy xong, bạn có thể kiểm tra trạng thái các container bằng lệnh:

```bash
docker compose ps
```

### Bước 5: Truy cập ứng dụng

Sau khi các container khởi động thành công:

- **Frontend:** http://localhost:3000 (Next.js Application)
- **API Gateway:** http://localhost:4000 (NestJS API)
- **Storage Service:** http://localhost:4001

## 🛑 Xử lý sự cố (Troubleshooting)

### ❌ Lỗi: Port Already in Use (Port bị chiếm dụng)

Nếu bạn gặp lỗi thông báo một port nào đó (ví dụ: 3306 của MySQL, 6379 của Redis, 5432 của PostgreSQL, hoặc port 3000/3333 của Node.js) đã bị chiếm dụng, hãy làm theo các bước sau:

#### Cách 1: Tìm và tắt tiến trình đang chiếm port (Recommended)

**Dành cho Windows:**

1. Mở Command Prompt (Run as Administrator)

2. Tìm Process ID (PID) đang dùng port bị trùng (ví dụ port 5432 của PostgreSQL):

```cmd
netstat -ano | findstr :5432
```

_(Nhìn vào cột cuối cùng để lấy mã PID - ví dụ: 12345)_

3. Tắt tiến trình đó:

```cmd
taskkill /PID 12345 /F
```

**Dành cho Linux/macOS:**

1. Mở Terminal

2. Tìm PID đang dùng port bị trùng (ví dụ port 5432):

```bash
lsof -i :5432
```

3. Tắt tiến trình đó:

```bash
kill -9 <Mã_PID>
```

#### Cách 2: Thay đổi Port trong file cấu hình

Nếu tiến trình đang chiếm port là một service quan trọng của hệ thống bạn không thể tắt, hãy đổi port cho Popket.

1. Mở file `.env` của dự án
2. Tìm đến biến môi trường định nghĩa Port bị trùng (ví dụ: `DB_PORT=5432`)
3. Sửa thành một port khác chưa được sử dụng (ví dụ: `DB_PORT=5433`)
4. Nếu Docker container đã khởi động, hãy stop và xóa container cũ:

```bash
docker compose down
```

5. Chạy lại lệnh khởi động:

```bash
docker compose up -d
```

## 📖 Tài liệu thêm

Để biết thêm chi tiết về kiến trúc và cách sử dụng các services, vui lòng tham khảo:

- [Backend Documentation](./backend/README.md)
- [Frontend Documentation](./frontend/README.md)
- [Docker Deployment Guide](./DOCKER_README.md)
- [Architecture Diagram](./documents/ERD.drawio)

**Cảm ơn đã sử dụng Popket! Happy project managing! 🎉**
