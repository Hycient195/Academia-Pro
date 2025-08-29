// Academia Pro Design System - Spacing Tokens
// Consistent spacing scale for margins, padding, and layout

export const spacing = {
  // Base spacing scale (4px increments)
  0: '0',           // 0px - No spacing
  0.5: '0.125rem',  // 2px - Micro spacing
  1: '0.25rem',     // 4px - Extra small spacing
  1.5: '0.375rem',  // 6px - Small spacing
  2: '0.5rem',      // 8px - Compact spacing
  2.5: '0.625rem',  // 10px - Tight spacing
  3: '0.75rem',     // 12px - Default spacing
  3.5: '0.875rem',  // 14px - Comfortable spacing
  4: '1rem',        // 16px - Standard spacing
  5: '1.25rem',     // 20px - Generous spacing
  6: '1.5rem',      // 24px - Large spacing
  7: '1.75rem',     // 28px - Extra large spacing
  8: '2rem',        // 32px - Section spacing
  9: '2.25rem',     // 36px - Wide spacing
  10: '2.5rem',     // 40px - Container spacing
  11: '2.75rem',    // 44px - Large container spacing
  12: '3rem',       // 48px - Page section spacing
  14: '3.5rem',     // 56px - Major section spacing
  16: '4rem',       // 64px - Hero spacing
  18: '4.5rem',     // 72px - Extra hero spacing
  20: '5rem',       // 80px - Maximum spacing
  24: '6rem',       // 96px - Full viewport spacing
  28: '7rem',       // 112px - Oversized spacing
  32: '8rem',       // 128px - Massive spacing
  36: '9rem',       // 144px - Extreme spacing
  40: '10rem',      // 160px - Maximum reasonable spacing
  44: '11rem',      // 176px - Ultra spacing
  48: '12rem',      // 192px - Viewport height spacing
  52: '13rem',      // 208px - Custom spacing
  56: '14rem',      // 224px - Custom spacing
  60: '15rem',      // 240px - Custom spacing
  64: '16rem',      // 256px - Custom spacing
  72: '18rem',      // 288px - Custom spacing
  80: '20rem',      // 320px - Custom spacing
  96: '24rem',      // 384px - Custom spacing
};

// Spacing Presets - Common spacing combinations
export const spacingPresets = {
  // Layout spacing
  layout: {
    page: {
      padding: 'spacing.6',      // 24px
      margin: 'spacing.4',       // 16px
      maxWidth: '1200px',
    },
    container: {
      padding: 'spacing.4',      // 16px
      margin: 'spacing.0',       // 0px
      maxWidth: '100%',
    },
    section: {
      padding: 'spacing.12',     // 48px
      margin: 'spacing.8',       // 32px
      gap: 'spacing.6',          // 24px
    },
  },

  // Component spacing
  component: {
    button: {
      padding: 'spacing.2 spacing.4',    // 8px 16px
      margin: 'spacing.1',                // 4px
      gap: 'spacing.2',                   // 8px
    },
    input: {
      padding: 'spacing.3',               // 12px
      margin: 'spacing.1',                // 4px
      gap: 'spacing.2',                   // 8px
    },
    card: {
      padding: 'spacing.6',               // 24px
      margin: 'spacing.4',                // 16px
      gap: 'spacing.4',                   // 16px
    },
    modal: {
      padding: 'spacing.8',               // 32px
      margin: 'spacing.4',                // 16px
      gap: 'spacing.6',                   // 24px
    },
  },

  // Typography spacing
  typography: {
    heading: {
      marginBottom: 'spacing.4',          // 16px
      lineHeight: 1.2,
    },
    paragraph: {
      marginBottom: 'spacing.4',          // 16px
      lineHeight: 1.6,
    },
    list: {
      marginBottom: 'spacing.2',          // 8px
      paddingLeft: 'spacing.6',           // 24px
      lineHeight: 1.6,
    },
  },

  // Form spacing
  form: {
    field: {
      marginBottom: 'spacing.4',          // 16px
      gap: 'spacing.2',                   // 8px
    },
    group: {
      marginBottom: 'spacing.6',          // 24px
      gap: 'spacing.4',                   // 16px
    },
    section: {
      marginBottom: 'spacing.8',          // 32px
      gap: 'spacing.6',                   // 24px
    },
  },

  // Navigation spacing
  navigation: {
    header: {
      height: 'spacing.16',               // 64px
      padding: 'spacing.4',               // 16px
      gap: 'spacing.6',                   // 24px
    },
    sidebar: {
      width: 'spacing.56',                // 224px (collapsed: 64px)
      padding: 'spacing.4',               // 16px
      gap: 'spacing.2',                   // 8px
    },
    menu: {
      item: {
        padding: 'spacing.3 spacing.4',   // 12px 16px
        margin: 'spacing.1',               // 4px
        gap: 'spacing.3',                  // 12px
      },
      group: {
        marginBottom: 'spacing.4',        // 16px
        gap: 'spacing.1',                  // 4px
      },
    },
  },

  // Data display spacing
  data: {
    table: {
      cell: {
        padding: 'spacing.3',             // 12px
        margin: 'spacing.0',               // 0px
      },
      header: {
        padding: 'spacing.4',             // 16px
        margin: 'spacing.0',               // 0px
      },
      row: {
        marginBottom: 'spacing.1',        // 4px
        hover: 'spacing.0',                // 0px
      },
    },
    card: {
      grid: {
        gap: 'spacing.6',                 // 24px
        padding: 'spacing.4',             // 16px
      },
      list: {
        gap: 'spacing.4',                 // 16px
        padding: 'spacing.3',             // 12px
      },
    },
    chart: {
      margin: 'spacing.4',                // 16px
      padding: 'spacing.4',               // 16px
      gap: 'spacing.2',                   // 8px
    },
  },
};

// Spacing Utility Functions
export const spacingUtils = {
  // Calculate responsive spacing
  getResponsiveSpacing: (
    baseSpacing: keyof typeof spacing,
    breakpoint: 'sm' | 'md' | 'lg' | 'xl' = 'md'
  ): string => {
    // Responsive spacing logic would go here
    return spacing[baseSpacing];
  },

  // Calculate spacing scale
  generateScale: (base: number, ratio: number = 1.5, steps: number = 10) => {
    const scale = [base];
    for (let i = 1; i < steps; i++) {
      scale.push(Math.round(scale[i - 1] * ratio));
    }
    return scale;
  },

  // Convert spacing to different units
  toPx: (spacingValue: string): number => {
    const remValue = parseFloat(spacingValue);
    return remValue * 16; // Assuming 16px base font size
  },

  toRem: (pxValue: number): string => {
    return `${pxValue / 16}rem`;
  },

  // Calculate optimal spacing for accessibility
  getAccessibleSpacing: (element: 'button' | 'input' | 'link' | 'text'): string => {
    const accessibleSpacing = {
      button: 'spacing.3',    // 12px minimum
      input: 'spacing.3',     // 12px minimum
      link: 'spacing.2',      // 8px minimum
      text: 'spacing.1',      // 4px minimum
    };
    return accessibleSpacing[element];
  },

  // Calculate spacing for touch targets
  getTouchTargetSpacing: (size: 'small' | 'medium' | 'large' = 'medium'): string => {
    const touchTargets = {
      small: 'spacing.8',     // 32px (44px total with content)
      medium: 'spacing.9',    // 36px (48px total with content)
      large: 'spacing.10',    // 40px (52px total with content)
    };
    return touchTargets[size];
  },
};

// Spacing Guidelines
export const spacingGuidelines = {
  // Usage Guidelines
  usage: {
    consistent: 'Use the spacing scale consistently across all components',
    responsive: 'Adjust spacing responsively for different screen sizes',
    accessible: 'Ensure adequate spacing for touch targets and readability',
    semantic: 'Use spacing to create visual hierarchy and relationships',
  },

  // Best Practices
  bestPractices: {
    rhythm: 'Maintain vertical rhythm with consistent line heights',
    breathing: 'Provide adequate white space for visual breathing room',
    grouping: 'Use spacing to group related elements visually',
    alignment: 'Align elements consistently using the spacing scale',
  },

  // Common Patterns
  patterns: {
    card: 'Use consistent padding and margins for card components',
    form: 'Maintain consistent spacing between form fields and labels',
    navigation: 'Use appropriate spacing for navigation elements',
    content: 'Apply consistent spacing for content sections and paragraphs',
  },

  // Responsive Guidelines
  responsive: {
    mobile: 'Reduce spacing on mobile devices for better space utilization',
    tablet: 'Use medium spacing on tablets for balanced layout',
    desktop: 'Use generous spacing on desktop for better visual hierarchy',
  },

  // Accessibility Guidelines
  accessibility: {
    touch: 'Ensure minimum 44px touch targets with adequate spacing',
    focus: 'Provide clear focus indicators with sufficient spacing',
    contrast: 'Use spacing to improve visual contrast and readability',
    motion: 'Consider spacing for reduced motion preferences',
  },

  // Performance Guidelines
  performance: {
    bundle: 'Optimize spacing utilities to reduce bundle size',
    calculation: 'Pre-calculate spacing values to improve runtime performance',
    caching: 'Cache calculated spacing values for repeated use',
  },
};

// Spacing Scale Validation
export const spacingValidation = {
  // Validate spacing value exists in scale
  isValidSpacing: (value: string): boolean => {
    return Object.values(spacing).includes(value);
  },

  // Get nearest valid spacing value
  getNearestSpacing: (pxValue: number): string => {
    const remValue = pxValue / 16;
    const spacingValues = Object.values(spacing).map(v => parseFloat(v));

    let nearest = spacingValues[0];
    let minDiff = Math.abs(remValue - parseFloat(Object.values(spacing)[0]));

    for (const spacingValue of spacingValues) {
      const diff = Math.abs(remValue - spacingValue);
      if (diff < minDiff) {
        minDiff = diff;
        nearest = spacingValue;
      }
    }

    // Find the key for the nearest value
    for (const [key, value] of Object.entries(spacing)) {
      if (parseFloat(value) === nearest) {
        return value;
      }
    }

    return Object.values(spacing)[0];
  },

  // Validate spacing meets accessibility requirements
  meetsAccessibility: (spacingValue: string, requirement: 'touch' | 'focus' | 'text'): boolean => {
    const pxValue = spacingUtils.toPx(spacingValue);

    const requirements = {
      touch: 44,    // Minimum touch target size
      focus: 2,     // Minimum focus ring width
      text: 4,      // Minimum text spacing
    };

    return pxValue >= requirements[requirement];
  },
};