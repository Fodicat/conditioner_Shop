#!/bin/bash

# Проверяем, занят ли порт 3000
echo "Проверка, занят ли порт 3000..."
PORT_PID=$(lsof -t -i:3000)

if [ -z "$PORT_PID" ]; then
  echo "Порт 3000 свободен."
else
  echo "Процесс с PID $PORT_PID использует порт 3000. Завершаем его..."
  kill -9 $PORT_PID
  if [ $? -eq 0 ]; then
    echo "Процесс на порту 3000 завершён."
  else
    echo "Не удалось завершить процесс на порту 3000."
  fi
fi

# Добавим небольшую задержку, чтобы сервер успел освободить порт
sleep 1

# Переход в директорию с проектом
cd "$HOME/Документы/GitHub/mystical-zhara-journey" || exit

# Запуск 'nodemon' в первой вкладке
konsole -e bash -c "nodemon $HOME/Документы/GitHub/mystical-zhara-journey/src/Server/Server.js; exec bash" &

sleep 1

# Запуск 'npm run dev' во второй вкладке
konsole -e bash -c "npm run dev; exec bash" &

sleep 1

wait




