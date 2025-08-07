# Docker Setup for Mongo Express App

## Yêu cầu

- Docker
- Docker Compose

## Cách sử dụng

### 1. Chuẩn bị environment variables

Chỉnh sửa file `.env.docker` với thông tin của bạn:

```bash
PORT=5000
MONGO_URI=mongodb://mongo:27017/imageapp
JWT_SECRET=your_secret_key_here

# Cloudinary config
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 2. Build và chạy containers

```bash
# Build và chạy tất cả services
docker-compose up --build

# Chạy trong background
docker-compose up -d --build
```

### 3. Kiểm tra logs

```bash
# Xem logs của tất cả services
docker-compose logs

# Xem logs của app
docker-compose logs app

# Xem logs của MongoDB
docker-compose logs mongo
```

### 4. Dừng containers

```bash
# Dừng containers
docker-compose down

# Dừng và xóa volumes (xóa database)
docker-compose down -v
```

### 5. Các lệnh hữu ích khác

```bash
# Xem status của containers
docker-compose ps

# Restart một service
docker-compose restart app

# Exec vào container
docker-compose exec app sh
docker-compose exec mongo mongosh
```

## API Endpoints

Sau khi chạy thành công, API sẽ có sẵn tại:

- Base URL: `http://localhost:5000`
- Health check: `http://localhost:5000/api`

## Cấu trúc Services

- **app**: Node.js backend application (port 5000)
- **mongo**: MongoDB database (port 27017)

## Volume Mapping

- `./uploads`: Thư mục lưu trữ file uploads
- `mongo_data`: Volume cho MongoDB data persistence
