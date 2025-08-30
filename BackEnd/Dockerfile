FROM node:20
WORKDIR /app

# 1. Копируем package.json и устанавливаем зависимости
COPY package*.json ./
RUN npm install

# 2. Копируем код
COPY . .

# 3. Указываем порт
EXPOSE 5000

# 4. Запускаем сервер
CMD ["npm", "start"]
