// Academia Pro Design System - Shadow Tokens
// Consistent shadow styles for depth and elevation

export const shadows = {
  // Shadow Scale
  none: 'none',
  xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',     // Extra small - subtle
  sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',     // Small - buttons, inputs
  base: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',     // Base - cards, panels
  md: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',     // Medium - elevated cards
  lg: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',     // Large - modals, dropdowns
  xl: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',     // Extra large - tooltips, popovers
  '2xl': '0 40px 80px -20px rgba(0, 0, 0, 0.3)',     // Double extra large - heavy overlays

  // Colored Shadows
  colored: {
    primary: '0 4px 6px -1px rgba(33, 150, 243, 0.1), 0 2px 4px -1px rgba(33, 150, 243, 0.06)',
    secondary: '0 4px 6px -1px rgba(225, 30, 99, 0.1), 0 2px 4px -1px rgba(225, 30, 99, 0.06)',
    success: '0 4px 6px -1px rgba(76, 175, 80, 0.1), 0 2px 4px -1px rgba(76, 175, 80, 0.06)',
    warning: '0 4px 6px -1px rgba(255, 152, 0, 0.1), 0 2px 4px -1px rgba(255, 152, 0, 0.06)',
    error: '0 4px 6px -1px rgba(244, 67, 54, 0.1), 0 2px 4px -1px rgba(244, 67, 54, 0.06)',
    info: '0 4px 6px -1px rgba(33, 150, 243, 0.1), 0 2px 4px -1px rgba(33, 150, 243, 0.06)',
  },

  // Inner Shadows
  inner: {
    sm: 'inset 0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    base: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
    lg: 'inset 0 4px 6px 0 rgba(0, 0, 0, 0.1)',
  },

  // Component-Specific Shadows
  component: {
    button: {
      default: 'shadow.sm',
      hover: 'shadow.base',
      active: 'shadow.xs',
      focus: 'shadow.colored.primary',
    },
    input: {
      default: 'shadow.xs',
      focus: 'shadow.colored.primary',
      error: 'shadow.colored.error',
    },
    card: {
      default: 'shadow.sm',
      hover: 'shadow.base',
      elevated: 'shadow.md',
      pressed: 'shadow.xs',
    },
    modal: {
      default: 'shadow.lg',
      large: 'shadow.xl',
    },
    dropdown: {
      default: 'shadow.md',
      large: 'shadow.lg',
    },
    tooltip: {
      default: 'shadow.md',
    },
    navigation: {
      sidebar: 'shadow.sm',
      header: 'shadow.sm',
      mobile: 'shadow.lg',
    },
  },

  // Elevation Levels (Material Design inspired)
  elevation: {
    0: 'none',                                    // Flat surface
    1: '0 2px 1px -1px rgba(0, 0, 0, 0.2), 0 1px 1px 0 rgba(0, 0, 0, 0.14), 0 1px 3px 0 rgba(0, 0, 0, 0.12)',     // App bar, cards at rest
    2: '0 3px 1px -2px rgba(0, 0, 0, 0.2), 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 1px 5px 0 rgba(0, 0, 0, 0.12)',     // Raised buttons
    3: '0 3px 3px -2px rgba(0, 0, 0, 0.2), 0 3px 4px 0 rgba(0, 0, 0, 0.14), 0 1px 8px 0 rgba(0, 0, 0, 0.12)',     // Search bar, cards on hover
    4: '0 2px 4px -1px rgba(0, 0, 0, 0.2), 0 4px 5px 0 rgba(0, 0, 0, 0.14), 0 1px 10px 0 rgba(0, 0, 0, 0.12)',    // App bars, floating buttons
    5: '0 3px 5px -1px rgba(0, 0, 0, 0.2), 0 5px 8px 0 rgba(0, 0, 0, 0.14), 0 1px 14px 0 rgba(0, 0, 0, 0.12)',    // Menus, cards
    6: '0 3px 5px -1px rgba(0, 0, 0, 0.2), 0 6px 10px 0 rgba(0, 0, 0, 0.14), 0 1px 18px 0 rgba(0, 0, 0, 0.12)',   // Floating buttons on hover
    7: '0 4px 5px -2px rgba(0, 0, 0, 0.2), 0 7px 10px 1px rgba(0, 0, 0, 0.14), 0 2px 16px 1px rgba(0, 0, 0, 0.12)', // Menus on hover
    8: '0 5px 5px -3px rgba(0, 0, 0, 0.2), 0 8px 10px 1px rgba(0, 0, 0, 0.14), 0 3px 14px 2px rgba(0, 0, 0, 0.12)', // Cards, dialogs
    9: '0 5px 6px -3px rgba(0, 0, 0, 0.2), 0 9px 12px 1px rgba(0, 0, 0, 0.14), 0 3px 16px 2px rgba(0, 0, 0, 0.12)', // Dialogs, pickers
    10: '0 6px 6px -3px rgba(0, 0, 0, 0.2), 0 10px 14px 1px rgba(0, 0, 0, 0.14), 0 4px 18px 3px rgba(0, 0, 0, 0.12)', // Menus, cards
    11: '0 6px 7px -4px rgba(0, 0, 0, 0.2), 0 11px 15px 1px rgba(0, 0, 0, 0.14), 0 4px 20px 3px rgba(0, 0, 0, 0.12)', // Menus, cards
    12: '0 7px 8px -4px rgba(0, 0, 0, 0.2), 0 12px 17px 2px rgba(0, 0, 0, 0.14), 0 5px 22px 4px rgba(0, 0, 0, 0.12)', // Menus, cards
    13: '0 7px 8px -4px rgba(0, 0, 0, 0.2), 0 13px 19px 2px rgba(0, 0, 0, 0.14), 0 5px 24px 4px rgba(0, 0, 0, 0.12)', // Menus, cards
    14: '0 7px 9px -4px rgba(0, 0, 0, 0.2), 0 14px 21px 2px rgba(0, 0, 0, 0.14), 0 5px 26px 4px rgba(0, 0, 0, 0.12)', // Menus, cards
    15: '0 8px 9px -5px rgba(0, 0, 0, 0.2), 0 15px 22px 2px rgba(0, 0, 0, 0.14), 0 6px 28px 5px rgba(0, 0, 0, 0.12)', // Menus, cards
    16: '0 8px 10px -5px rgba(0, 0, 0, 0.2), 0 16px 24px 2px rgba(0, 0, 0, 0.14), 0 6px 30px 5px rgba(0, 0, 0, 0.12)', // Menus, cards
    17: '0 8px 11px -5px rgba(0, 0, 0, 0.2), 0 17px 26px 2px rgba(0, 0, 0, 0.14), 0 6px 32px 5px rgba(0, 0, 0, 0.12)', // Menus, cards
    18: '0 9px 11px -5px rgba(0, 0, 0, 0.2), 0 18px 28px 2px rgba(0, 0, 0, 0.14), 0 7px 34px 6px rgba(0, 0, 0, 0.12)', // Menus, cards
    19: '0 9px 12px -6px rgba(0, 0, 0, 0.2), 0 19px 29px 2px rgba(0, 0, 0, 0.14), 0 7px 36px 6px rgba(0, 0, 0, 0.12)', // Menus, cards
    20: '0 10px 13px -6px rgba(0, 0, 0, 0.2), 0 20px 31px 3px rgba(0, 0, 0, 0.14), 0 8px 38px 7px rgba(0, 0, 0, 0.12)', // Menus, cards
    21: '0 10px 13px -6px rgba(0, 0, 0, 0.2), 0 21px 33px 3px rgba(0, 0, 0, 0.14), 0 8px 40px 7px rgba(0, 0, 0, 0.12)', // Menus, cards
    22: '0 10px 14px -6px rgba(0, 0, 0, 0.2), 0 22px 35px 3px rgba(0, 0, 0, 0.14), 0 8px 42px 7px rgba(0, 0, 0, 0.12)', // Menus, cards
    23: '0 11px 14px -7px rgba(0, 0, 0, 0.2), 0 23px 36px 3px rgba(0, 0, 0, 0.14), 0 9px 44px 8px rgba(0, 0, 0, 0.12)', // Menus, cards
    24: '0 11px 15px -7px rgba(0, 0, 0, 0.2), 0 24px 38px 3px rgba(0, 0, 0, 0.14), 0 9px 46px 8px rgba(0, 0, 0, 0.12)', // Menus, cards
  },
};

// Shadow Utility Functions
export const shadowUtils = {
  // Get shadow for component state
  getComponentShadow: (
    component: keyof typeof shadows.component,
    state: string = 'default'
  ): string => {
    const componentShadows = shadows.component[component];
    if (componentShadows && componentShadows[state]) {
      return componentShadows[state];
    }
    return shadows.sm;
  },

  // Get elevation shadow
  getElevationShadow: (level: number = 1): string => {
    const elevationKey = level.toString() as unknown as keyof typeof shadows.elevation;
    return shadows.elevation[elevationKey] || shadows.elevation[1];
  },

  // Create custom shadow
  createShadow: (
    offsetX: number = 0,
    offsetY: number = 4,
    blurRadius: number = 6,
    spreadRadius: number = -1,
    color: string = 'rgba(0, 0, 0, 0.1)',
    inset: boolean = false
  ): string => {
    const insetStr = inset ? 'inset ' : '';
    return `${insetStr}${offsetX}px ${offsetY}px ${blurRadius}px ${spreadRadius}px ${color}`;
  },

  // Generate shadow scale
  generateScale: (
    baseOpacity: number = 0.1,
    steps: number = 5
  ): Record<string, string> => {
    const scale: Record<string, string> = {};
    for (let i = 1; i <= steps; i++) {
      const opacity = Math.min(baseOpacity * i, 0.3);
      scale[i.toString()] = `0 ${i * 2}px ${i * 4}px -${i}px rgba(0, 0, 0, ${opacity})`;
    }
    return scale;
  },
};

// Shadow Guidelines
export const shadowGuidelines = {
  usage: {
    elevation: 'Use elevation shadows to indicate component hierarchy',
    state: 'Use colored shadows to indicate component states',
    performance: 'Avoid heavy shadows on low-performance devices',
    accessibility: 'Ensure shadows don\'t interfere with text readability',
  },

  accessibility: {
    contrast: 'Ensure shadow colors don\'t reduce text contrast',
    motion: 'Respect reduced motion preferences for shadow animations',
    focus: 'Use shadows to enhance focus indicators',
  },

  performance: {
    gpu: 'Use CSS transforms instead of changing shadow properties',
    layers: 'Promote elements with shadows to their own layer',
    optimization: 'Use shadow opacity instead of changing shadow size',
  },

  responsive: {
    mobile: 'Reduce shadow intensity on mobile devices',
    tablet: 'Use medium shadows on tablets',
    desktop: 'Full shadow effects on desktop',
  },
};