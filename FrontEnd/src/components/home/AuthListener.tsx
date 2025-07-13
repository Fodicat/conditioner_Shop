
import { useEffect } from 'react';

interface AuthListenerProps {
  onOpenLogin: () => void;
}

const AuthListener = ({ onOpenLogin }: AuthListenerProps) => {
  useEffect(() => {
    const handleOpenLoginEvent = () => {
      onOpenLogin();
    };

    // Добавляем слушатель события
    document.addEventListener('open-login-dialog', handleOpenLoginEvent);

    // Проверяем флаг в sessionStorage при монтировании
    const shouldOpenLogin = sessionStorage.getItem('openLoginDialog');
    if (shouldOpenLogin === 'true') {
      onOpenLogin();
      sessionStorage.removeItem('openLoginDialog');
    }

    // Очищаем слушатель при размонтировании
    return () => {
      document.removeEventListener('open-login-dialog', handleOpenLoginEvent);
    };
  }, [onOpenLogin]);

  // Этот компонент не рендерит никакого UI
  return null;
};

export default AuthListener;
