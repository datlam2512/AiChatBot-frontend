
FROM node:22-alpine

WORKDIR /app

# Cài thư viện từ package-lock.json
COPY package.json package-lock.json ./
RUN npm ci

# Đưa source code vào image
COPY . .

# URL backend mà trình duyệt sẽ gọi
ARG NEXT_PUBLIC_API_URL=http://localhost:8001
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Build Next.js cho production
RUN npm run build

ENV NODE_ENV=production

EXPOSE 3000

# Chạy Next.js trên mọi network interface
CMD ["npm", "run", "start", "--", "-H", "0.0.0.0"]
