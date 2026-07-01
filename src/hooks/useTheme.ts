import { useState, useEffect, useCallback } from 'react';

export type ThemeName = 'light' | 'dark';

export function useTheme(): { theme: ThemeName; toggle: () => void; setTheme: (t: ThemeName) => void } {
  const [theme, setTheme] = useState<ThemeName>(
    () => (localStorage.getItem('gt_theme') as ThemeName) || 'light'
  );

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('gt_theme', theme);
  }, [theme]);

  const toggle = useCallback(() => setTheme(t => (t === 'light' ? 'dark' : 'light')), []);
  const applyTheme = useCallback((t: ThemeName) => setTheme(t), []);

  return { theme, toggle, setTheme: applyTheme };
}
