import React, { useState, useEffect } from 'react';
import { Palette, Check } from 'lucide-react';

export type Theme = 'indigo' | 'green' | 'pink' | 'orange' | 'purple' | 'blue';

interface ThemeOption {
  id: Theme;
  name: string;
  primary: string;
  bg: string;
  gradient: string;
  preview: string;
}

const themes: ThemeOption[] = [
  { id: 'indigo', name: '靛蓝', primary: '#6366f1', bg: 'bg-indigo-500', gradient: 'from-indigo-500 to-purple-500', preview: '#6366f1' },
  { id: 'green', name: '翠绿', primary: '#10b981', bg: 'bg-green-500', gradient: 'from-green-500 to-emerald-500', preview: '#10b981' },
  { id: 'pink', name: '粉红', primary: '#ec4899', bg: 'bg-pink-500', gradient: 'from-pink-500 to-rose-500', preview: '#ec4899' },
  { id: 'orange', name: '活力橙', primary: '#f97316', bg: 'bg-orange-500', gradient: 'from-orange-500 to-amber-500', preview: '#f97316' },
  { id: 'purple', name: '梦幻紫', primary: '#8b5cf6', bg: 'bg-purple-500', gradient: 'from-purple-500 to-violet-500', preview: '#8b5cf6' },
  { id: 'blue', name: '天空蓝', primary: '#3b82f6', bg: 'bg-blue-500', gradient: 'from-blue-500 to-cyan-500', preview: '#3b82f6' },
];

export const useTheme = () => {
  const [currentTheme, setCurrentTheme] = useState<Theme>('indigo');

  useEffect(() => {
    const saved = localStorage.getItem('appTheme') as Theme;
    if (saved && themes.find(t => t.id === saved)) {
      setCurrentTheme(saved);
    }
  }, []);

  const changeTheme = (theme: Theme) => {
    setCurrentTheme(theme);
    localStorage.setItem('appTheme', theme);
  };

  const themeConfig = themes.find(t => t.id === currentTheme) || themes[0];

  return { currentTheme, changeTheme, themeConfig };
};

export const applyTheme = (theme: Theme) => {
  const themeConfig = themes.find(t => t.id === theme) || themes[0];
  document.documentElement.style.setProperty('--primary', themeConfig.primary);
};

const ThemeSwitcher = ({ onClose }: { onClose?: () => void }) => {
  const { currentTheme, changeTheme } = useTheme();

  const handleThemeChange = (theme: Theme) => {
    changeTheme(theme);
    applyTheme(theme);
    if (onClose) onClose();
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Palette className="w-6 h-6" />
          主题皮肤
        </h2>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {themes.map((theme) => (
          <button
            key={theme.id}
            onClick={() => handleThemeChange(theme.id)}
            className={`relative p-4 rounded-xl border-2 transition-all hover:scale-105 ${
              currentTheme === theme.id
                ? 'border-gray-800 shadow-lg'
                : 'border-gray-200 hover:border-gray-400'
            }`}
          >
            <div className={`w-full h-12 rounded-lg bg-gradient-to-r ${theme.gradient} mb-3`} />
            <div className="text-center">
              <div className="font-medium text-gray-800">{theme.name}</div>
              {currentTheme === theme.id && (
                <div className="absolute top-2 right-2 w-6 h-6 bg-gray-800 rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
          </button>
        ))}
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <div className="text-sm text-gray-500 text-center">
          选择喜欢的主题，让积分册更加个性化！
        </div>
      </div>
    </div>
  );
};

export default ThemeSwitcher;
