import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ColorSchemeName = 'light' | 'dark';
type ThemePreference = 'light' | 'dark';

const THEME_PREFERENCE_KEY = '@app_theme_preference';

type ThemeContextType = {
  themePreference: ThemePreference;
  colorScheme: ColorSchemeName;
  setThemePreference: (theme: ThemePreference) => void;
};

const ThemeContext = createContext<ThemeContextType>({
  themePreference: 'light',
  colorScheme: 'light',
  setThemePreference: () => {},
});

export const ThemeProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [themePreference, setThemePreference] = useState<ThemePreference>('light');
  // colorScheme will mirror themePreference since we're not using system theme
  const [colorScheme, setColorScheme] = useState<ColorSchemeName>('light'); 

  // Load saved theme preference on mount
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const savedPreference = await AsyncStorage.getItem(THEME_PREFERENCE_KEY);
        if (savedPreference === 'light' || savedPreference === 'dark') {
          setThemePreference(savedPreference as ThemePreference);
          setColorScheme(savedPreference as ColorSchemeName);
        }
      } catch (error) {
        console.log('Error loading theme preference:', error);
      }
    };
    
    loadThemePreference();
  }, []);

  // Save theme preference when it changes
  useEffect(() => {
    const saveThemePreference = async () => {
      try {
        await AsyncStorage.setItem(THEME_PREFERENCE_KEY, themePreference);
        // Update colorScheme to match themePreference
        setColorScheme(themePreference);
      } catch (error) {
        console.log('Error saving theme preference:', error);
      }
    };
    
    saveThemePreference();
  }, [themePreference]);

  const handleSetThemePreference = (newPreference: ThemePreference) => {
    setThemePreference(newPreference);
  };

  return (
    <ThemeContext.Provider value={{ 
      themePreference, 
      colorScheme, 
      setThemePreference: handleSetThemePreference 
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useThemeContext = () => useContext(ThemeContext);

export function useAppColorScheme(): ColorSchemeName {
  const { colorScheme } = useThemeContext();
  return colorScheme;
}