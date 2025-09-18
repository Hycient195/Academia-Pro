
// Theme mode types
export type ThemeMode = 'light' | 'dark';

// Utility function to adjust color brightness
const adjustColor = (color: string, amount: number): string => {
  const usePound = color[0] === '#';
  const col = usePound ? color.slice(1) : color;

  const num = parseInt(col, 16);
  let r = (num >> 16) + amount;
  let g = (num >> 8 & 0x00FF) + amount;
  let b = (num & 0x0000FF) + amount;

  r = r > 255 ? 255 : r < 0 ? 0 : r;
  g = g > 255 ? 255 : g < 0 ? 0 : g;
  b = b > 255 ? 255 : b < 0 ? 0 : b;

  return (usePound ? '#' : '') + (r << 16 | g << 8 | b).toString(16);
};

// School theme configuration interface
export interface SchoolThemeConfig {
  logo?: string;
  primaryColor?: string;
  secondaryColor?: string;
  mode?: ThemeMode;
}

// Academia Pro Design System - Base Theme Configuration
export const createAcademiaTheme = (mode: ThemeMode = 'light', customColors?: Partial<SchoolThemeConfig>) => {
  const isDark = mode === 'dark';

  return {
    token: {
      // Primary Colors (customizable per school)
      colorPrimary: customColors?.primaryColor || '#2196f3',
      colorPrimaryHover: customColors?.primaryColor ? adjustColor(customColors.primaryColor, -20) : '#1976d2',
      colorPrimaryActive: customColors?.primaryColor ? adjustColor(customColors.primaryColor, -30) : '#1565c0',

      // Secondary Colors (customizable per school)
      colorSecondary: customColors?.secondaryColor || '#e91e63',
      colorSecondaryHover: customColors?.secondaryColor ? adjustColor(customColors.secondaryColor, -20) : '#d81b60',
      colorSecondaryActive: customColors?.secondaryColor ? adjustColor(customColors.secondaryColor, -30) : '#c2185b',

      // Success, Warning, Error
      colorSuccess: '#4caf50',
      colorWarning: '#ffc107',
      colorError: '#f44336',
      colorInfo: '#2196f3',

      // Neutral Colors (adapt to theme mode)
      colorText: isDark ? '#ffffff' : '#212121',
      colorTextSecondary: isDark ? '#b0b0b0' : '#757575',
      colorTextTertiary: isDark ? '#808080' : '#9e9e9e',
      colorTextDisabled: isDark ? '#666666' : '#bdbdbd',

      colorBgContainer: isDark ? '#1f1f1f' : '#ffffff',
      colorBgLayout: isDark ? '#141414' : '#f5f5f5',
      colorBorder: isDark ? '#434343' : '#e0e0e0',
      colorBorderSecondary: isDark ? '#595959' : '#bdbdbd',

      // Typography
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontSize: 14,
      fontSizeHeading1: 38,
      fontSizeHeading2: 30,
      fontSizeHeading3: 24,
      fontSizeHeading4: 20,
      fontSizeHeading5: 16,

      // Spacing
      padding: 16,
      paddingLG: 24,
      paddingSM: 12,
      paddingXS: 8,

      margin: 16,
      marginLG: 24,
      marginSM: 12,
      marginXS: 8,

      // Border Radius
      borderRadius: 6,
      borderRadiusLG: 8,
      borderRadiusSM: 4,

      // Box Shadow (adapt to theme mode)
      boxShadow: isDark
        ? '0 1px 3px rgba(0, 0, 0, 0.3), 0 1px 2px rgba(0, 0, 0, 0.4)'
        : '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
      boxShadowSecondary: isDark
        ? '0 3px 6px rgba(0, 0, 0, 0.4), 0 3px 6px rgba(0, 0, 0, 0.5)'
        : '0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23)',
    },
    components: {
      Layout: {
        colorBgHeader: isDark ? '#1f1f1f' : '#ffffff',
        colorBgBody: isDark ? '#141414' : '#f5f5f5',
        colorBgTrigger: customColors?.primaryColor || '#2196f3',
      },
      Menu: {
        colorItemBgSelected: isDark ? '#1890ff' : '#e3f2fd',
        colorItemTextSelected: isDark ? '#ffffff' : '#1976d2',
        colorItemBgHover: isDark ? '#262626' : '#f5f5f5',
        colorItemText: isDark ? '#ffffff' : '#212121',
        colorItemTextHover: isDark ? '#ffffff' : '#212121',
      },
      Card: {
        colorBorderSecondary: isDark ? '#434343' : '#e0e0e0',
      },
      Button: {
        borderRadius: 6,
        controlHeight: 40,
        fontWeight: 500,
      },
      Table: {
        colorBgContainer: isDark ? '#1f1f1f' : '#ffffff',
        colorBorderSecondary: isDark ? '#434343' : '#e0e0e0',
        borderRadius: 6,
      },
      Input: {
        borderRadius: 6,
        controlHeight: 40,
      },
      Select: {
        borderRadius: 6,
        controlHeight: 40,
      },
      Modal: {
        borderRadiusLG: 8,
      },
      Drawer: {
        borderRadiusLG: 8,
      },
    },
  };
};

// Default theme instance
export const academiaTheme = createAcademiaTheme('light');

// Role-based theme configurations
export const roleThemeConfigs = {
  'super-admin': {
    primaryColor: '#7c4dff', // Deep purple for super admin
  },
  'delegated-admin': {
    primaryColor: '#ff6d00', // Orange for delegated admin
  },
  'school-admin': {
    primaryColor: '#ff6d00', // Orange for school admin
  },
  'delgated-school-admin': {
    primaryColor: '#ff6d00', // Orange for delegated school admin
  },
  'staff': {
    primaryColor: '#2e7d32', // Green for staff
  },
  'student': {
    primaryColor: '#1976d2', // Blue for student
  },
  'parent': {
    primaryColor: '#c2185b', // Pink for parent
  },
};

// School-specific theme storage (for future backend integration)
export const getSchoolTheme = (schoolId?: string): SchoolThemeConfig => {
  if (!schoolId) return {};

  // In a real implementation, this would fetch from backend/localStorage
  // For now, return default theme config
  const stored = localStorage.getItem(`school-theme-${schoolId}`);
  return stored ? JSON.parse(stored) : {};
};

export const saveSchoolTheme = (schoolId: string, config: SchoolThemeConfig) => {
  localStorage.setItem(`school-theme-${schoolId}`, JSON.stringify(config));
};

// Utility function to get theme by role and school
export const getThemeByRole = (role: string, schoolId?: string, mode: ThemeMode = 'light') => {
  const roleConfig = roleThemeConfigs[role as keyof typeof roleThemeConfigs] || {};
  const schoolConfig = schoolId ? getSchoolTheme(schoolId) : {};

  // Merge configurations: school config takes precedence, then role config, then defaults
  const finalConfig = {
    ...roleConfig,
    ...schoolConfig,
    mode: schoolConfig.mode || mode,
  };

  return createAcademiaTheme(finalConfig.mode, finalConfig);
};

// Theme mode management
export const getCurrentThemeMode = (): ThemeMode => {
  if (typeof window === 'undefined') return 'light';
  return (localStorage.getItem('theme-mode') as ThemeMode) || 'light';
};

export const setThemeMode = (mode: ThemeMode) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('theme-mode', mode);
    // Trigger theme update (this would be handled by a theme context)
    window.dispatchEvent(new CustomEvent('theme-change', { detail: { mode } }));
  }
};

// Utility functions for theme management
export const toggleThemeMode = () => {
  const currentMode = getCurrentThemeMode();
  const newMode = currentMode === 'light' ? 'dark' : 'light';
  setThemeMode(newMode);
  return newMode;
};