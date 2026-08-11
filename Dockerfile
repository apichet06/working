FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

# NEXT_PUBLIC_* ถูกฝังเข้า client bundle ตอน build เท่านั้น ต้องส่งผ่าน --build-arg
# (แก้ทีหลังต้อง rebuild image ใหม่เสมอ ไม่ใช่แค่ restart container)
ARG NEXT_PUBLIC_API_BASE_URL
ARG NEXT_PUBLIC_API_EIS_URL
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_API_EIS_URL=$NEXT_PUBLIC_API_EIS_URL

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]