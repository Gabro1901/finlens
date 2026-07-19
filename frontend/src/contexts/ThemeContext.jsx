import React, { createContext, useContext, useEffect, useState } from 'react';
import { generatePalette } from '../utils/colorUtils';

// Default values swapped as requested
export const DEFAULT_THEME = {
  bg: '#f8e7c9', // Cream / Light
  accent: '#064E3B', // Emerald / Dark
};

// Some preset themes
export const THEME_PRESETS = [
  { name: 'Parchment & Emerald', bg: '#f8e7c9', accent: '#064E3B' },
  { name: 'Emerald & Parchment', bg: '#064E3B', accent: '#f8e7c9' },
  { name: 'Midnight & Neon', bg: '#0f172a', accent: '#38bdf8' },
  { name: 'Slate & Gold', bg: '#1e293b', accent: '#fbbf24' },
  { name: 'Clean White & Blue', bg: '#ffffff', accent: '#2563eb' }
];

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem('finlens-theme');
      return saved ? JSON.parse(saved) : DEFAULT_THEME;
    } catch (e) {
      return DEFAULT_THEME;
    }
  });

  useEffect(() => {
    // Save to localStorage
    localStorage.setItem('finlens-theme', JSON.stringify(theme));

    // Update CSS Variables on document.documentElement
    const root = document.documentElement;
    
    // Generate full dynamic palette based on HSL lightness
    const palette = generatePalette(theme.bg, theme.accent);
    
    for (const [key, value] of Object.entries(palette)) {
      root.style.setProperty(key, value);
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
