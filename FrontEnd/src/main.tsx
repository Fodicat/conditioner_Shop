
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { AuthProvider } from './contexts/AuthContext';
import { API_URL, IS_PRODUCTION } from './config/appConfig';

// Выводим информацию о конфигурации в консоль при загрузке
console.log(`🚀 App starting with API URL: ${API_URL}`);
console.log(`🔧 Environment: ${IS_PRODUCTION ? 'PRODUCTION' : 'DEVELOPMENT'}`);

createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <App />
  </AuthProvider>
);
