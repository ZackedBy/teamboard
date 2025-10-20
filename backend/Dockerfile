# Stage: Backend
FROM node:22-alpine

# Устанавливаем рабочую директорию
WORKDIR /app

# Сначала копируем только package.json для кеширования npm install
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем остальной код
COPY ./ ./

# Команда запуска
CMD ["npm", "run", "start"]
