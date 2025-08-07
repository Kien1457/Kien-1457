# Sử dụng Node.js 18 alpine image làm base
FROM node:18-alpine

# Thiết lập thư mục làm việc
WORKDIR /app

# Copy package.json và package-lock.json (nếu có)
COPY package*.json ./

# Cài đặt dependencies
RUN npm install

# Copy toàn bộ source code
COPY . .

# Chạy build để compile TypeScript
RUN npm run build

# Expose port 5000
EXPOSE 5000

# Chạy ứng dụng
CMD ["node", "dist/server.js"]
