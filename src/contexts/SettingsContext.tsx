import React, { createContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

interface DisplaySettings {
  theme: 'light' | 'dark' | 'auto';
  refreshInterval: number;
  timezone: string;
  dateFormat: string;
  language: string;
}

interface GeneralSettings {
  dashboardName: string;
}

interface SettingsContextType {
  display: DisplaySettings;
  general: GeneralSettings;
  updateDisplay: (settings: Partial<DisplaySettings>) => void;
  updateGeneral: (settings: Partial<GeneralSettings>) => void;
  applyTheme: (theme: 'light' | 'dark' | 'auto') => void;
}

export const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

interface SettingsProviderProps {
  children: ReactNode;
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children }) => {
  const [display, setDisplay] = useState<DisplaySettings>({
    theme: 'auto',
    refreshInterval: 30,
    timezone: 'UTC',
    dateFormat: 'MMM dd, yyyy HH:mm:ss',
    language: 'en'
  });

  const [general, setGeneral] = useState<GeneralSettings>({
    dashboardName: 'DeepEyes Dashboard'
  });

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedDisplay = localStorage.getItem('deepEyes-display-settings');
    const savedGeneral = localStorage.getItem('deepEyes-general-settings');
    
    if (savedDisplay) {
      try {
        setDisplay(JSON.parse(savedDisplay));
      } catch (error) {
        console.error('Error loading display settings:', error);
      }
    }
    
    if (savedGeneral) {
      try {
        setGeneral(JSON.parse(savedGeneral));
      } catch (error) {
        console.error('Error loading general settings:', error);
      }
    }
  }, []);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('deepEyes-display-settings', JSON.stringify(display));
  }, [display]);

  useEffect(() => {
    localStorage.setItem('deepEyes-general-settings', JSON.stringify(general));
  }, [general]);

  // Apply theme changes
  const applyTheme = (theme: 'light' | 'dark' | 'auto') => {    
    const root = document.documentElement;
    
    if (theme === 'auto') {
      // Check system preference
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.toggle('dark', systemTheme === 'dark');
    } else {
      root.classList.toggle('dark', theme === 'dark');
    }
  };

  // Apply theme whenever it changes
  useEffect(() => {
    applyTheme(display.theme);
  }, [display.theme]);

  // Listen for system theme changes when in auto mode
  useEffect(() => {
    if (display.theme === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => applyTheme('auto');
      
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [display.theme]);

  const updateDisplay = (newSettings: Partial<DisplaySettings>) => {
    setDisplay(prev => ({ ...prev, ...newSettings }));
  };

  const updateGeneral = (newSettings: Partial<GeneralSettings>) => {
    setGeneral(prev => ({ ...prev, ...newSettings }));
  };

  const value: SettingsContextType = {
    display,
    general,
    updateDisplay,
    updateGeneral,
    applyTheme
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}; 