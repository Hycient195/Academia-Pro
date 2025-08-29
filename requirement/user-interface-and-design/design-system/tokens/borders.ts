// Academia Pro Design System - Border Tokens
// Consistent border styles, widths, and radii

export const borders = {
  // Border Widths
  width: {
    0: '0',           // No border
    1: '1px',         // Hairline border
    2: '2px',         // Thin border
    4: '4px',         // Medium border
    8: '8px',         // Thick border
  },

  // Border Styles
  style: {
    solid: 'solid',
    dashed: 'dashed',
    dotted: 'dotted',
    double: 'double',
    groove: 'groove',
    ridge: 'ridge',
    inset: 'inset',
    outset: 'outset',
    none: 'none',
    hidden: 'hidden',
  },

  // Border Radius
  radius: {
    none: '0',                    // Sharp corners
    sm: '0.125rem',              // 2px - Small radius
    base: '0.25rem',             // 4px - Default radius
    md: '0.375rem',              // 6px - Medium radius
    lg: '0.5rem',                // 8px - Large radius
    xl: '0.75rem',               // 12px - Extra large radius
    '2xl': '1rem',               // 16px - Double extra large
    '3xl': '1.5rem',             // 24px - Triple extra large
    full: '9999px',              // Fully rounded (pill shape)
  },

  // Predefined Border Combinations
  presets: {
    // Input borders
    input: {
      default: '1px solid #d1d5db',
      focus: '2px solid #2196f3',
      error: '1px solid #f44336',
      success: '1px solid #4caf50',
      disabled: '1px solid #9e9e9e',
    },

    // Button borders
    button: {
      primary: 'none',
      secondary: '1px solid #d1d5db',
      outline: '2px solid #2196f3',
      ghost: 'none',
    },

    // Card borders
    card: {
      default: '1px solid #e0e0e0',
      elevated: 'none',
      outlined: '2px solid #e0e0e0',
      filled: 'none',
    },

    // Table borders
    table: {
      default: '1px solid #e0e0e0',
      header: '1px solid #bdbdbd',
      cell: '1px solid #e0e0e0',
    },

    // Modal/Dialog borders
    modal: {
      default: 'none',
      outlined: '1px solid #e0e0e0',
    },
  },
};

// Border Utility Functions
export const borderUtils = {
  // Generate border CSS
  createBorder: (
    width: keyof typeof borders.width = 1,
    style: keyof typeof borders.style = 'solid',
    color: string = '#000000'
  ): string => {
    return `${borders.width[width]} ${borders.style[style]} ${color}`;
  },

  // Get border radius for component
  getBorderRadius: (
    component: 'button' | 'input' | 'card' | 'modal' = 'button',
    size: 'sm' | 'md' | 'lg' = 'md'
  ): string => {
    const radiusMap = {
      button: {
        sm: borders.radius.sm,
        md: borders.radius.base,
        lg: borders.radius.md,
      },
      input: {
        sm: borders.radius.sm,
        md: borders.radius.base,
        lg: borders.radius.md,
      },
      card: {
        sm: borders.radius.base,
        md: borders.radius.md,
        lg: borders.radius.lg,
      },
      modal: {
        sm: borders.radius.md,
        md: borders.radius.lg,
        lg: borders.radius.xl,
      },
    };

    return radiusMap[component][size];
  },

  // Check if border meets accessibility contrast
  meetsContrast: (borderColor: string, backgroundColor: string): boolean => {
    // Simple contrast check - in real implementation, use proper color contrast algorithm
    return borderColor !== backgroundColor;
  },
};

// Border Guidelines
export const borderGuidelines = {
  usage: {
    consistency: 'Use predefined border tokens for consistency',
    accessibility: 'Ensure sufficient contrast for focus indicators',
    performance: 'Avoid complex border animations on low-performance devices',
    semantic: 'Use border styles to convey meaning (error, success, etc.)',
  },

  accessibility: {
    focus: 'Use 2px solid borders for focus indicators',
    contrast: 'Ensure 3:1 contrast ratio for custom borders',
    motion: 'Respect reduced motion preferences for border animations',
  },

  responsive: {
    mobile: 'Use thinner borders on mobile for better performance',
    tablet: 'Standard border widths work well on tablets',
    desktop: 'Can use slightly thicker borders on desktop',
  },
};