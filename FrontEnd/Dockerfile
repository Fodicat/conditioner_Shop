# 1. Берём Node.js для сборки React
FROM node:20 AS build
WORKDIR /app

# 2. Копируем package.json и устанавливаем зависимости
COPY package*.json ./
RUN npm install

# 3. Копируем остальной код и собираем проект
COPY . .
RUN npm run build

# 4. Берём чистый Nginx для отдачи статических файлов
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80