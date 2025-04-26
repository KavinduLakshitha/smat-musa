import { useThemeContext } from './ThemeContext';

export function useColorScheme() {
  const { colorScheme } = useThemeContext();
  return colorScheme;
}