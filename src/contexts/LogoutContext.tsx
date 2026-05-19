import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { useStore } from '../store/useStore';

interface LogoutContextType {
  isLoggedOut: boolean;
  setIsLoggedOut: (value: boolean) => void;
  triggerLogout: () => void;
}

const LogoutContext = createContext<LogoutContextType | null>(null);

export function LogoutProvider({ children }: { children: ReactNode }) {
  const [isLoggedOut, setIsLoggedOut] = useState(false);
  const resetStore = useStore((state) => state.resetStore);

  const triggerLogout = useCallback(() => {
    resetStore();
    localStorage.removeItem('familyName');
    localStorage.removeItem('streakRewards');
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('zustand')) {
        localStorage.removeItem(key);
      }
    });
    sessionStorage.clear();
    setIsLoggedOut(true);
  }, [resetStore]);

  return (
    <LogoutContext.Provider value={{ isLoggedOut, setIsLoggedOut, triggerLogout }}>
      {children}
    </LogoutContext.Provider>
  );
}

export function useLogout() {
  const context = useContext(LogoutContext);
  if (!context) {
    throw new Error('useLogout must be used within LogoutProvider');
  }
  return context;
}
