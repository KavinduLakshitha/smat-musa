const tintColorLight = '#2f95dc';
const tintColorDark = '#fff';

export default {
  light: {
    text: '#000',
    background: '#fff',
    tint: tintColorLight,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#fff',
    background: '#000',
    tint: tintColorDark,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorDark,
  },
};

export const COLORS = {
  primary: '#4CAF50',
  secondary: '#FFC107',
  background: '#F5F5F5',
  text: '#212121',
  lightText: '#757575',
  white: '#FFFFFF',
  error: '#D32F2F'
};

export const LANGUAGES = [
  { code: 'english', label: 'English' },
  { code: 'sinhala', label: 'සිංහල' }
];

export const BANANA_TYPES = [
  { id: 'ambul', label: 'Ambul' },
  { id: 'kolikuttu', label: 'Kolikuttu' },
  { id: 'seeni', label: 'Seeni' },
  { id: 'anamalu', label: 'Anamalu' },
  { id: 'rathkesel', label: 'Rathkesel' }
];