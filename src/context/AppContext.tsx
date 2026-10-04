import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ToastNotification } from '../types';
import { API_BASE_URL, checkBackendHealth } from '../services/api';

export interface AppSettings {
  awsRegion: string;
  backendApiUrl: string;
  activityThresholdDays: number;
  optimizationThresholdGB: number;
  minimumStorageSizeMB: number;
  recommendationSensitivity: 'Conservative' | 'Balanced' | 'Aggressive';
  enableOptimizationAlerts: boolean;
  enableStorageGrowthAlerts: boolean;
  enableLifecycleAlerts: boolean;
  compactMode: boolean;
  theme: 'light' | 'dark' | 'system';
}

interface AppContextType {
  dateRange: string;
  setDateRange: (range: string) => void;
  lastRefreshed: Date;
  isRefreshing: boolean;
  triggerRefresh: () => void;
  toasts: ToastNotification[];
  addToast: (title: string, message: string, type?: ToastNotification['type']) => void;
  removeToast: (id: string) => void;
  globalSearch: string;
  setGlobalSearch: (q: string) => void;
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  isAwsConnected: boolean;
  theme: 'light' | 'dark' | 'system';
  resolvedTheme: 'light' | 'dark';
  isDark: boolean;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  toggleTheme: () => void;
}

const getStoredTheme = (): 'light' | 'dark' | 'system' => {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('s3_optimizer_theme');
      if (stored === 'light' || stored === 'dark' || stored === 'system') {
        return stored;
      }
    } catch (_) {}
  }
  return 'system';
};

const defaultSettings: AppSettings = {
  awsRegion: 'us-east-1',
  backendApiUrl: API_BASE_URL,
  activityThresholdDays: 30,
  optimizationThresholdGB: 100,
  minimumStorageSizeMB: 128,
  recommendationSensitivity: 'Balanced',
  enableOptimizationAlerts: true,
  enableStorageGrowthAlerts: true,
  enableLifecycleAlerts: false,
  compactMode: false,
  theme: getStoredTheme(),
};

function applyThemeToDocument(theme: 'light' | 'dark' | 'system'): boolean {
  let isDark = false;
  if (theme === 'dark') {
    isDark = true;
  } else if (theme === 'light') {
    isDark = false;
  } else if (theme === 'system' && typeof window !== 'undefined') {
    isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  if (typeof document !== 'undefined') {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
  return isDark;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [dateRange, setDateRange] = useState<string>('30d');
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const [globalSearch, setGlobalSearch] = useState<string>('');
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [isAwsConnected, setIsAwsConnected] = useState<boolean>(false);
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>(() =>
    applyThemeToDocument(defaultSettings.theme) ? 'dark' : 'light'
  );

  useEffect(() => {
    const isDark = applyThemeToDocument(settings.theme);
    setResolvedTheme(isDark ? 'dark' : 'light');
    try {
      localStorage.setItem('s3_optimizer_theme', settings.theme);
    } catch (_) {}

    if (settings.theme === 'system' && typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = (e: MediaQueryListEvent) => {
        const isDarkSys = e.matches;
        if (isDarkSys) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
        setResolvedTheme(isDarkSys ? 'dark' : 'light');
      };
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }
  }, [settings.theme]);

  useEffect(() => {
    checkBackendHealth()
      .then((health) => {
        setIsAwsConnected(health.awsConnected);
        const reg = health.region;
        if (reg) {
          setSettings((prev) => ({
            ...prev,
            awsRegion: reg,
          }));
        }
      })
      .catch(() => {
        setIsAwsConnected(false);
      });
  }, [lastRefreshed]);

  const addToast = (
    title: string,
    message: string,
    type: ToastNotification['type'] = 'info'
  ) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const newToast: ToastNotification = { id, title, message, type, timestamp: new Date() };
    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const triggerRefresh = () => {
    setIsRefreshing(true);
    addToast('Refreshing views', 'Refreshing AWS-backed data views. Storage Lens metrics update on AWS publication schedule.', 'info');

    setTimeout(() => {
      setLastRefreshed(new Date());
      setIsRefreshing(false);
      addToast('Refresh requested', 'Connected data views have been asked to refresh. Storage Lens availability is unchanged.', 'success');
    }, 800);
  };

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    if (newSettings.theme) {
      applyThemeToDocument(newSettings.theme);
      try {
        localStorage.setItem('s3_optimizer_theme', newSettings.theme);
      } catch (_) {}
    }
    setSettings((prev) => ({ ...prev, ...newSettings }));
    addToast('Settings Saved', 'Configuration updated successfully in frontend state.', 'success');
  };

  const setTheme = (newTheme: 'light' | 'dark' | 'system') => {
    applyThemeToDocument(newTheme);
    try {
      localStorage.setItem('s3_optimizer_theme', newTheme);
    } catch (_) {}
    setSettings((prev) => ({ ...prev, theme: newTheme }));
  };

  const toggleTheme = () => {
    const nextTheme: 'light' | 'dark' = resolvedTheme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
  };

  const isDark = resolvedTheme === 'dark';

  return (
    <AppContext.Provider
      value={{
        dateRange,
        setDateRange,
        lastRefreshed,
        isRefreshing,
        triggerRefresh,
        toasts,
        addToast,
        removeToast,
        globalSearch,
        setGlobalSearch,
        settings,
        updateSettings,
        isAwsConnected,
        theme: settings.theme,
        resolvedTheme,
        isDark,
        setTheme,
        toggleTheme,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
