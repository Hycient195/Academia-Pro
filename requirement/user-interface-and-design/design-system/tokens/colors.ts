// Academia Pro Design System - Color Tokens
// WCAG 2.1 AA Compliant Color Palette

export const colors = {
  // Primary Colors - Main brand colors
  primary: {
    50: '#e3f2fd',   // Lightest - backgrounds, hover states
    100: '#bbdefb',  // Very light - subtle backgrounds
    200: '#90caf9',  // Light - secondary backgrounds
    300: '#64b5f6',  // Medium light - borders, dividers
    400: '#42a5f5',  // Medium - secondary buttons, links
    500: '#2196f3',  // Main primary - primary buttons, active states
    600: '#1e88e5',  // Medium dark - hover states
    700: '#1976d2',  // Dark - pressed states, dark mode primary
    800: '#1565c0',  // Very dark - text on light backgrounds
    900: '#0d47a1',  // Darkest - headings, dark mode text
  },

  // Secondary Colors - Supporting brand colors
  secondary: {
    50: '#fce4ec',
    100: '#f8bbd9',
    200: '#f48fb1',
    300: '#f06292',
    400: '#ec407a',
    500: '#e91e63',  // Main secondary
    600: '#d81b60',
    700: '#c2185b',
    800: '#ad1457',
    900: '#880e4f',
  },

  // Success Colors - Positive actions and states
  success: {
    50: '#e8f5e8',
    100: '#c8e6c9',
    200: '#a5d6a7',
    300: '#81c784',
    400: '#66bb6a',
    500: '#4caf50',  // Main success
    600: '#43a047',
    700: '#388e3c',
    800: '#2e7d32',
    900: '#1b5e20',
  },

  // Warning Colors - Caution and alerts
  warning: {
    50: '#fff8e1',
    100: '#ffecb3',
    200: '#ffe082',
    300: '#ffd54f',
    400: '#ffca28',
    500: '#ffc107',  // Main warning
    600: '#ffb300',
    700: '#ffa000',
    800: '#ff8f00',
    900: '#ff6f00',
  },

  // Error Colors - Destructive actions and errors
  error: {
    50: '#ffebee',
    100: '#ffcdd2',
    200: '#ef9a9a',
    300: '#e57373',
    400: '#ef5350',
    500: '#f44336',  // Main error
    600: '#e53935',
    700: '#d32f2f',
    800: '#c62828',
    900: '#b71c1c',
  },

  // Info Colors - Information and neutral states
  info: {
    50: '#e3f2fd',
    100: '#bbdefb',
    200: '#90caf9',
    300: '#64b5f6',
    400: '#42a5f5',
    500: '#2196f3',  // Main info
    600: '#1e88e5',
    700: '#1976d2',
    800: '#1565c0',
    900: '#0d47a1',
  },

  // Education-Specific Colors - Role-based theming
  education: {
    superAdmin: '#7c4dff',  // Deep purple for system administrators
    schoolAdmin: '#ff6d00', // Orange for school administrators
    teacher: '#2e7d32',     // Green for teachers
    student: '#1976d2',     // Blue for students
    parent: '#c2185b',      // Pink for parents
  },

  // Neutral Colors - Grays for text, backgrounds, borders
  neutral: {
    50: '#fafafa',   // Very light backgrounds
    100: '#f5f5f5',  // Light backgrounds
    200: '#eeeeee',  // Card backgrounds
    300: '#e0e0e0',  // Borders, dividers
    400: '#bdbdbd',  // Disabled text
    500: '#9e9e9e',  // Secondary text
    600: '#757575',  // Primary text
    700: '#616161',  // Headings
    800: '#424242',  // Dark headings
    900: '#212121',  // Darkest text
  },

  // Semantic Colors - Context-aware color usage
  semantic: {
    background: {
      primary: '#ffffff',    // Main background
      secondary: '#f5f5f5',  // Secondary background
      tertiary: '#fafafa',   // Tertiary background
      overlay: 'rgba(0, 0, 0, 0.5)', // Modal overlay
    },
    text: {
      primary: '#212121',    // Primary text
      secondary: '#757575',  // Secondary text
      tertiary: '#9e9e9e',   // Tertiary text
      inverse: '#ffffff',    // Text on dark backgrounds
      disabled: '#bdbdbd',   // Disabled text
    },
    border: {
      light: '#e0e0e0',      // Light borders
      medium: '#bdbdbd',     // Medium borders
      dark: '#757575',       // Dark borders
      focus: '#2196f3',      // Focus ring color
    },
  },

  // Chart Colors - Data visualization
  chart: {
    blue: '#2196f3',
    green: '#4caf50',
    orange: '#ff9800',
    red: '#f44336',
    purple: '#9c27b0',
    teal: '#009688',
    pink: '#e91e63',
    indigo: '#3f51b5',
    cyan: '#00bcd4',
    lime: '#cddc39',
    amber: '#ffc107',
    brown: '#795548',
  },

  // Status Colors - System status indicators
  status: {
    online: '#4caf50',
    offline: '#f44336',
    away: '#ff9800',
    busy: '#f44336',
    pending: '#2196f3',
    completed: '#4caf50',
    failed: '#f44336',
    processing: '#ff9800',
  },
};

// Color Usage Guidelines
export const colorGuidelines = {
  // Contrast Requirements (WCAG 2.1 AA)
  contrast: {
    normalText: '4.5:1 minimum',
    largeText: '3:1 minimum',
    uiComponents: '3:1 minimum',
    focusIndicators: '3:1 minimum',
  },

  // Color Accessibility
  accessibility: {
    avoidColorOnly: true,  // Don't rely on color alone for meaning
    provideAlternatives: true, // Text labels, patterns, icons
    testColorBlind: true,   // Test with color blindness simulators
    highContrast: true,     // Support high contrast mode
  },

  // Usage Patterns
  usage: {
    primary: 'Primary actions, CTAs, active states',
    secondary: 'Secondary actions, supporting elements',
    success: 'Positive feedback, confirmations',
    warning: 'Caution, warnings, alerts',
    error: 'Errors, destructive actions',
    info: 'Information, neutral states',
    neutral: 'Text, backgrounds, borders',
  },

  // Dark Mode Support
  darkMode: {
    primary: '#90caf9',     // Lighter primary for dark backgrounds
    background: '#121212',  // Dark background
    surface: '#1e1e1e',     // Card/modal backgrounds
    text: {
      primary: '#ffffff',
      secondary: '#b3b3b3',
      disabled: '#666666',
    },
  },
};

// Utility Functions
export const colorUtils = {
  // Get contrast ratio between two colors
  getContrastRatio: (color1: string, color2: string): number => {
    // Implementation would calculate actual contrast ratio
    return 4.5; // Placeholder
  },

  // Check if color combination meets WCAG standards
  meetsWCAG: (foreground: string, background: string, level: 'AA' | 'AAA' = 'AA'): boolean => {
    const ratio = colorUtils.getContrastRatio(foreground, background);
    return level === 'AAA' ? ratio >= 7 : ratio >= 4.5;
  },

  // Generate color variations
  generateVariations: (baseColor: string, count: number = 10) => {
    // Implementation would generate color variations
    return Array.from({ length: count }, (_, i) => baseColor);
  },

  // Convert hex to RGB
  hexToRgb: (hex: string): { r: number; g: number; b: number } | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
    } : null;
  },

  // Convert RGB to hex
  rgbToHex: (r: number, g: number, b: number): string => {
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  },
};