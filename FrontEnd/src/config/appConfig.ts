
// Определяем базовый URL API в зависимости от окружения
export const API_URL = 'http://localhost:5000'

// Определяем базовый URL приложения в зависимости от окружения
export const APP_URL = import.meta.env.MODE === 'production' 
  ? 'https://yourdomainname.com'
  : 'http://localhost:3000';

// Другие настройки приложения, зависящие от окружения
export const IS_PRODUCTION = import.meta.env.MODE === 'production';
export const APP_VERSION = import.meta.env.VITE_APP_VERSION || '1.0.0';

console.log(`🔧 Приложение запущено в режиме: ${IS_PRODUCTION ? 'PRODUCTION' : 'DEVELOPMENT'}`);
console.log(`🔌 API URL: ${API_URL}`);
console.log(`🌐 APP URL: ${APP_URL}`);
