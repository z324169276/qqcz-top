import { useEffect, useState, useCallback, useRef } from 'react';
import { Toaster } from 'react-hot-toast';
import { Header } from './components/Header';
import { TabNav } from './components/TabNav';
import { TaskList } from './components/TaskList';
import { RewardList } from './components/RewardList';
import { HistoryList } from './components/HistoryList';
import StatsPage from './components/StatsPage';
import { FamilySetup, FamilyCodeDisplay } from './components/FamilySetup';
import { Footer } from './components/Footer';
import { AdminDashboard } from './components/AdminDashboard';
import { ensureMembership, initCloud } from './api';
import { bindFamilyOwnerEmail } from './api';
import { useStore } from './store/useStore';
import { applyTheme } from './components/ThemeSwitcher';
import { LogoutProvider, useLogout } from './contexts/LogoutContext';
import toast from 'react-hot-toast';

type TabType = 'tasks' | 'rewards' | 'history' | 'stats';

function AppContent() {
  const [activeTab, setActiveTab] = useState<TabType>('tasks');
  const [isLoading, setIsLoading] = useState(true);
  const [showFamilySetup, setShowFamilySetup] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  
  const initialized = useRef(false);
  const { isLoggedOut, setIsLoggedOut } = useLogout();

  const familyId = useStore((state) => state.familyId);
  const familyName = useStore((state) => state.familyName);
  const _hasHydrated = useStore((state) => state._hasHydrated);
  const initializeSync = useStore((state) => state.initializeSync);
  const setFamilyId = useStore((state) => state.setFamilyId);
  const refreshFromCloud = useStore((state) => (state as any).refreshFromCloud);

  useEffect(() => {
    const savedTheme = localStorage.getItem('appTheme') as any;
    if (savedTheme) {
      applyTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const init = async () => {
      const storedFamilyId = localStorage.getItem('familyId');

      try {
        await initCloud();

        if (storedFamilyId) {
          setFamilyId(storedFamilyId);
          await ensureMembership(storedFamilyId);
          initializeSync(storedFamilyId);
          setShowFamilySetup(false);
        } else {
          setShowFamilySetup(true);
        }
      } catch (error: any) {
        console.error('Supabase init:', error?.message);
        
        if (storedFamilyId) {
          setFamilyId(storedFamilyId);
          await ensureMembership(storedFamilyId);
          initializeSync(storedFamilyId);
        } else {
          setShowFamilySetup(true);
        }
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, []);

  useEffect(() => {
    if (!familyId || !refreshFromCloud) return;

    refreshFromCloud();

    const interval = window.setInterval(() => {
      refreshFromCloud();
    }, 5000);

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        refreshFromCloud();
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [familyId, refreshFromCloud]);

  useEffect(() => {
    if (!familyId) return;
    const params = new URLSearchParams(window.location.search);
    if (!params.has('bindOwner')) return;

    const run = async () => {
      try {
        await bindFamilyOwnerEmail(familyId);
        toast.success('邮箱绑定成功，可用于找回家庭码');
      } catch (e: any) {
        toast.error(e?.message || '邮箱绑定失败');
      } finally {
        params.delete('bindOwner');
        const query = params.toString();
        const nextUrl = query ? `${window.location.pathname}?${query}` : window.location.pathname;
        window.history.replaceState(null, '', nextUrl);
      }
    };

    run();
  }, [familyId]);

  const handleFamilyComplete = useCallback((newFamilyId: string) => {
    localStorage.setItem('familyId', newFamilyId);
    setFamilyId(newFamilyId);
    ensureMembership(newFamilyId);
    initializeSync(newFamilyId);
    setShowFamilySetup(false);
    setIsLoggedOut(false);
  }, [setFamilyId, initializeSync, setIsLoggedOut]);

  if (initError) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-red-500 text-lg mb-4">{initError}</div>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700"
          >
            刷新重试
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">正在连接...</p>
        </div>
      </div>
    );
  }

  if (showAdmin) {
    return <AdminDashboard onBack={() => setShowAdmin(false)} />;
  }

  if (showFamilySetup || !familyId || isLoggedOut) {
    return (
      <>
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              borderRadius: '12px',
              padding: '12px 16px',
            },
          }}
        />
        <FamilySetup onComplete={handleFamilyComplete} onShowAdmin={() => setShowAdmin(true)} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: '12px',
            padding: '12px 16px',
          },
        }}
      />

      <Header onShowAdmin={() => setShowAdmin(true)} />

      {familyId && familyName && (
        <div className="max-w-2xl mx-auto px-4 pt-4">
          <FamilyCodeDisplay familyCode={familyId} familyName={familyName} />
        </div>
      )}

      <TabNav activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="max-w-2xl mx-auto px-4 py-6">
        <div className="animate-fade-in">
          {activeTab === 'tasks' && <TaskList />}
          {activeTab === 'rewards' && <RewardList />}
          {activeTab === 'history' && <HistoryList />}
          {activeTab === 'stats' && <StatsPage />}
        </div>
      </main>

      <Footer />
    </div>
  );
}

function App() {
  return (
    <LogoutProvider>
      <AppContent />
    </LogoutProvider>
  );
}

export default App;
