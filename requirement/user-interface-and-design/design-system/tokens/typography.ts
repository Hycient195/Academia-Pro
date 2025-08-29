// Academia Pro Design System - Typography Tokens
// WCAG 2.1 AA Compliant Typography Scale

export const typography = {
  // Font Families
  fontFamily: {
    primary: [
      'Inter',
      'system-ui',
      '-apple-system',
      'BlinkMacSystemFont',
      'Segoe UI',
      'Roboto',
      'sans-serif',
    ],
    secondary: [
      'Poppins',
      'system-ui',
      '-apple-system',
      'BlinkMacSystemFont',
      'Segoe UI',
      'Roboto',
      'sans-serif',
    ],
    monospace: [
      'JetBrains Mono',
      'SF Mono',
      'Monaco',
      'Inconsolata',
      'Fira Code',
      'Droid Sans Mono',
      'Source Code Pro',
      'monospace',
    ],
    serif: [
      'Georgia',
      'Cambria',
      'Times New Roman',
      'Times',
      'serif',
    ],
  },

  // Font Sizes - Based on 16px base size
  fontSize: {
    xs: '0.75rem',    // 12px - Small labels, captions
    sm: '0.875rem',   // 14px - Body text, form labels
    base: '1rem',     // 16px - Default body text
    lg: '1.125rem',   // 18px - Large body text
    xl: '1.25rem',    // 20px - Small headings
    '2xl': '1.5rem',  // 24px - Medium headings
    '3xl': '1.875rem', // 30px - Large headings
    '4xl': '2.25rem', // 36px - Extra large headings
    '5xl': '3rem',    // 48px - Hero headings
    '6xl': '3.75rem', // 60px - Display headings
  },

  // Font Weights
  fontWeight: {
    thin: 100,
    extralight: 200,
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
    black: 900,
  },

  // Line Heights
  lineHeight: {
    none: 1,
    tight: 1.25,    // For headings
    snug: 1.375,    // For compact text
    normal: 1.5,    // Default body text
    relaxed: 1.625, // For better readability
    loose: 2,       // For spacious layouts
  },

  // Letter Spacing
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0em',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },

  // Text Styles - Predefined combinations
  textStyles: {
    // Headings
    h1: {
      fontSize: 'fontSize.4xl',
      fontWeight: 'fontWeight.bold',
      lineHeight: 'lineHeight.tight',
      letterSpacing: 'letterSpacing.tight',
    },
    h2: {
      fontSize: 'fontSize.3xl',
      fontWeight: 'fontWeight.bold',
      lineHeight: 'lineHeight.tight',
      letterSpacing: 'letterSpacing.tight',
    },
    h3: {
      fontSize: 'fontSize.2xl',
      fontWeight: 'fontWeight.semibold',
      lineHeight: 'lineHeight.tight',
      letterSpacing: 'letterSpacing.normal',
    },
    h4: {
      fontSize: 'fontSize.xl',
      fontWeight: 'fontWeight.semibold',
      lineHeight: 'lineHeight.tight',
      letterSpacing: 'letterSpacing.normal',
    },
    h5: {
      fontSize: 'fontSize.lg',
      fontWeight: 'fontWeight.semibold',
      lineHeight: 'lineHeight.snug',
      letterSpacing: 'letterSpacing.normal',
    },
    h6: {
      fontSize: 'fontSize.base',
      fontWeight: 'fontWeight.semibold',
      lineHeight: 'lineHeight.snug',
      letterSpacing: 'letterSpacing.normal',
    },

    // Body Text
    body: {
      fontSize: 'fontSize.base',
      fontWeight: 'fontWeight.normal',
      lineHeight: 'lineHeight.normal',
      letterSpacing: 'letterSpacing.normal',
    },
    bodyLarge: {
      fontSize: 'fontSize.lg',
      fontWeight: 'fontWeight.normal',
      lineHeight: 'lineHeight.relaxed',
      letterSpacing: 'letterSpacing.normal',
    },
    bodySmall: {
      fontSize: 'fontSize.sm',
      fontWeight: 'fontWeight.normal',
      lineHeight: 'lineHeight.normal',
      letterSpacing: 'letterSpacing.normal',
    },

    // Labels and UI Text
    label: {
      fontSize: 'fontSize.sm',
      fontWeight: 'fontWeight.medium',
      lineHeight: 'lineHeight.snug',
      letterSpacing: 'letterSpacing.wide',
    },
    caption: {
      fontSize: 'fontSize.xs',
      fontWeight: 'fontWeight.normal',
      lineHeight: 'lineHeight.snug',
      letterSpacing: 'letterSpacing.wide',
    },
    overline: {
      fontSize: 'fontSize.xs',
      fontWeight: 'fontWeight.semibold',
      lineHeight: 'lineHeight.snug',
      letterSpacing: 'letterSpacing.widest',
      textTransform: 'uppercase',
    },

    // Special Text Styles
    button: {
      fontSize: 'fontSize.sm',
      fontWeight: 'fontWeight.medium',
      lineHeight: 'lineHeight.none',
      letterSpacing: 'letterSpacing.wide',
    },
    input: {
      fontSize: 'fontSize.base',
      fontWeight: 'fontWeight.normal',
      lineHeight: 'lineHeight.normal',
      letterSpacing: 'letterSpacing.normal',
    },
    code: {
      fontFamily: 'fontFamily.monospace',
      fontSize: 'fontSize.sm',
      fontWeight: 'fontWeight.normal',
      lineHeight: 'lineHeight.normal',
      letterSpacing: 'letterSpacing.normal',
    },
  },

  // Responsive Typography
  responsive: {
    // Mobile-first responsive font sizes
    h1: {
      base: 'fontSize.3xl',   // 30px on mobile
      md: 'fontSize.4xl',     // 36px on tablet+
      lg: 'fontSize.5xl',     // 48px on desktop+
    },
    h2: {
      base: 'fontSize.2xl',   // 24px on mobile
      md: 'fontSize.3xl',     // 30px on tablet+
      lg: 'fontSize.4xl',     // 36px on desktop+
    },
    h3: {
      base: 'fontSize.xl',    // 20px on mobile
      md: 'fontSize.2xl',     // 24px on tablet+
      lg: 'fontSize.3xl',     // 30px on desktop+
    },
    body: {
      base: 'fontSize.sm',    // 14px on mobile
      md: 'fontSize.base',    // 16px on tablet+
    },
    caption: {
      base: 'fontSize.xs',    // 12px on mobile
      md: 'fontSize.sm',      // 14px on tablet+
    },
  },

  // Accessibility Guidelines
  accessibility: {
    // Minimum font sizes for readability
    minimumSizes: {
      body: '14px',      // Minimum body text size
      large: '18px',     // Large text threshold
      headings: '16px',  // Minimum heading size
    },

    // Contrast requirements
    contrast: {
      normal: '4.5:1',   // Normal text contrast ratio
      large: '3:1',      // Large text contrast ratio
      ui: '3:1',         // UI elements contrast ratio
    },

    // Dyslexia-friendly typography
    dyslexia: {
      fontFamily: ['Open Dyslexic', 'fontFamily.primary'],
      fontWeight: 'fontWeight.normal', // Avoid very light fonts
      letterSpacing: 'letterSpacing.wide',
      lineHeight: 'lineHeight.relaxed',
      avoid: ['italic', 'underline'], // Avoid problematic styles
    },

    // Screen reader optimizations
    screenReader: {
      hidden: {
        position: 'absolute',
        left: '-10000px',
        width: '1px',
        height: '1px',
        overflow: 'hidden',
      },
      focusable: {
        position: 'static',
        left: 'auto',
        width: 'auto',
        height: 'auto',
        overflow: 'visible',
      },
    },
  },

  // Internationalization Support
  i18n: {
    // Language-specific typography adjustments
    languages: {
      'ar-SA': { // Arabic
        fontFamily: ['Noto Sans Arabic', 'fontFamily.primary'],
        direction: 'rtl',
        lineHeight: 'lineHeight.relaxed',
      },
      'zh-CN': { // Chinese
        fontFamily: ['Noto Sans CJK SC', 'fontFamily.primary'],
        lineHeight: 'lineHeight.relaxed',
      },
      'hi-IN': { // Hindi
        fontFamily: ['Noto Sans Devanagari', 'fontFamily.primary'],
        lineHeight: 'lineHeight.relaxed',
      },
      'ja-JP': { // Japanese
        fontFamily: ['Noto Sans CJK JP', 'fontFamily.primary'],
        lineHeight: 'lineHeight.relaxed',
      },
      'ko-KR': { // Korean
        fontFamily: ['Noto Sans CJK KR', 'fontFamily.primary'],
        lineHeight: 'lineHeight.relaxed',
      },
    },

    // RTL (Right-to-Left) Support
    rtl: {
      direction: 'rtl',
      textAlign: 'right',
      marginLeft: 'auto',
      marginRight: '0',
    },

    // LTR (Left-to-Right) Support
    ltr: {
      direction: 'ltr',
      textAlign: 'left',
      marginLeft: '0',
      marginRight: 'auto',
    },
  },

  // Print Styles
  print: {
    fontFamily: 'fontFamily.serif',
    fontSize: 'fontSize.sm',
    lineHeight: 'lineHeight.relaxed',
    color: '#000000',
    backgroundColor: '#ffffff',
  },

  // High Contrast Mode
  highContrast: {
    fontWeight: 'fontWeight.bold',
    letterSpacing: 'letterSpacing.wide',
    textDecoration: 'underline',
    color: '#000000',
    backgroundColor: '#ffffff',
  },
};

// Typography Utility Functions
export const typographyUtils = {
  // Calculate responsive font size
  getResponsiveFontSize: (
    baseSize: keyof typeof typography.fontSize,
    breakpoint: 'sm' | 'md' | 'lg' | 'xl' = 'md'
  ): string => {
    const responsive = typography.responsive[baseSize as keyof typeof typography.responsive];
    if (responsive && responsive[breakpoint]) {
      return responsive[breakpoint];
    }
    return typography.fontSize[baseSize];
  },

  // Get text style object
  getTextStyle: (styleName: keyof typeof typography.textStyles) => {
    return typography.textStyles[styleName];
  },

  // Calculate line height for accessibility
  getAccessibleLineHeight: (fontSize: number): number => {
    // WCAG recommends line height of at least 1.5 for body text
    return Math.max(fontSize * 1.5, 16);
  },

  // Check if font size meets accessibility requirements
  meetsAccessibility: (fontSize: number, isLarge: boolean = false): boolean => {
    const minSize = isLarge ? 18 : 14;
    return fontSize >= minSize;
  },

  // Generate font size scale
  generateScale: (baseSize: number, ratio: number = 1.25, steps: number = 8) => {
    const scale = [baseSize];
    for (let i = 1; i <= steps; i++) {
      scale.push(Math.round(scale[i - 1] * ratio));
    }
    return scale;
  },

  // Convert rem to px
  remToPx: (rem: number, baseFontSize: number = 16): number => {
    return rem * baseFontSize;
  },

  // Convert px to rem
  pxToRem: (px: number, baseFontSize: number = 16): number => {
    return px / baseFontSize;
  },
};

// Typography Guidelines
export const typographyGuidelines = {
  // Usage Guidelines
  usage: {
    headings: 'Use semantic heading elements (h1-h6) for proper document structure',
    paragraphs: 'Use <p> elements for body text, avoid divs for text content',
    emphasis: 'Use <strong> for important text, <em> for stress emphasis',
    lists: 'Use proper <ul>, <ol>, <dl> elements for list content',
    links: 'Use <a> elements with descriptive text, avoid "click here"',
  },

  // Performance Guidelines
  performance: {
    fontLoading: 'Use font-display: swap to prevent invisible text',
    webFonts: 'Limit to 2-3 web fonts, use system fonts as fallbacks',
    subsetting: 'Subset fonts to include only necessary characters',
    compression: 'Use WOFF2 format with gzip compression',
  },

  // SEO Guidelines
  seo: {
    headings: 'Use single H1 per page, use heading hierarchy properly',
    keywords: 'Include target keywords in headings where natural',
    readability: 'Aim for 60-70 characters per line for optimal readability',
    contrast: 'Ensure sufficient color contrast for search engine accessibility',
  },

  // Testing Guidelines
  testing: {
    visual: 'Test typography across different devices and screen sizes',
    accessibility: 'Use automated tools to check contrast ratios',
    performance: 'Monitor font loading performance and Core Web Vitals',
    crossBrowser: 'Test font rendering across different browsers',
  },
};