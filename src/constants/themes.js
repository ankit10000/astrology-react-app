import {
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
} from '@react-navigation/native';
import { MD3DarkTheme, MD3LightTheme } from 'react-native-paper';

// MD3 and Navigation v7 themes use rgb()/rgba() color strings.
// The app concatenates hex opacity suffixes (e.g. colors.text + '3D'),
// which requires hex colors. Override the colors used with concatenation.
const themes = {
  light: {
    ...NavigationDefaultTheme,
    ...MD3LightTheme,
    colors: {
      ...NavigationDefaultTheme.colors,
      ...MD3LightTheme.colors,
      primary: '#6750A4',
      secondary: '#bc4598',
      text: '#1C1B1F',
      background: '#FFFBFE',
      surface: '#FFFBFE',
      backdrop: '#49454F',
    },
  },
  dark: {
    ...NavigationDarkTheme,
    ...MD3DarkTheme,
    colors: {
      ...NavigationDarkTheme.colors,
      ...MD3DarkTheme.colors,
      primary: '#D0BCFF',
      secondary: '#bc4598',
      text: '#E6E1E5',
      background: '#1C1B1F',
      surface: '#2B2930',
      backdrop: '#322F37',
    },
  },
};

export default themes;
