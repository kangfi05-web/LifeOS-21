// LifeOS Design Tokens
// All values are tokens - no hardcoding allowed

export const tokens = {
  // ============================================
  // COLOR SYSTEM
  // ============================================
  colors: {
    // Primary - Blue
    primary: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
      950: '#172554',
    },

    // Secondary - Slate
    secondary: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
      950: '#020617',
    },

    // Success - Green
    success: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
      900: '#14532d',
      950: '#052e16',
    },

    // Warning - Amber
    warning: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f',
      950: '#451a03',
    },

    // Danger - Red
    danger: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d',
      950: '#450a0a',
    },

    // Info - Cyan
    info: {
      50: '#ecfeff',
      100: '#cffafe',
      200: '#a5f3fc',
      300: '#67e8f9',
      400: '#22d3ee',
      500: '#06b6d4',
      600: '#0891b2',
      700: '#0e7490',
      800: '#155e75',
      900: '#164e63',
      950: '#083344',
    },

    // Accent - Violet
    accent: {
      50: '#f5f3ff',
      100: '#ede9fe',
      200: '#ddd6fe',
      300: '#c4b5fd',
      400: '#a78bfa',
      500: '#8b5cf6',
      600: '#7c3aed',
      700: '#6d28d9',
      800: '#5b21b6',
      900: '#4c1d95',
      950: '#2e1065',
    },
  },

  // Semantic Colors for Dark Theme (default)
  semantic: {
    // Backgrounds
    background: {
      DEFAULT: '#0a0a0a',
      elevated: '#111111',
      surface: '#18181b',
      surfaceHover: '#1f1f23',
      surfaceActive: '#27272a',
      overlay: 'rgba(0, 0, 0, 0.8)',
    },

    // Borders
    border: {
      DEFAULT: 'rgba(255, 255, 255, 0.08)',
      hover: 'rgba(255, 255, 255, 0.12)',
      active: 'rgba(255, 255, 255, 0.16)',
      focus: 'rgba(59, 130, 246, 0.5)',
    },

    // Text
    text: {
      primary: '#fafafa',
      secondary: '#a1a1aa',
      muted: '#71717a',
      disabled: '#52525b',
      inverse: '#0a0a0a',
    },
  },

  // ============================================
  // TYPOGRAPHY
  // ============================================
  typography: {
    fontFamily: {
      sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
    },

    fontSize: {
      // Display
      'display-xl': ['4.5rem', { lineHeight: '1', letterSpacing: '-0.02em', fontWeight: '800' }],
      'display-lg': ['3.75rem', { lineHeight: '1', letterSpacing: '-0.02em', fontWeight: '800' }],
      'display-md': ['3rem', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '700' }],

      // Heading
      'h1': ['2.25rem', { lineHeight: '1.2', letterSpacing: '-0.02em', fontWeight: '700' }],
      'h2': ['1.875rem', { lineHeight: '1.25', letterSpacing: '-0.02em', fontWeight: '600' }],
      'h3': ['1.5rem', { lineHeight: '1.3', letterSpacing: '-0.01em', fontWeight: '600' }],
      'h4': ['1.25rem', { lineHeight: '1.35', letterSpacing: '-0.01em', fontWeight: '600' }],
      'h5': ['1.125rem', { lineHeight: '1.4', letterSpacing: '-0.01em', fontWeight: '600' }],
      'h6': ['1rem', { lineHeight: '1.45', fontWeight: '600' }],

      // Body
      'body-xl': ['1.25rem', { lineHeight: '1.6', fontWeight: '400' }],
      'body-lg': ['1.125rem', { lineHeight: '1.6', fontWeight: '400' }],
      'body-md': ['1rem', { lineHeight: '1.6', fontWeight: '400' }],
      'body-sm': ['0.875rem', { lineHeight: '1.5', fontWeight: '400' }],
      'body-xs': ['0.75rem', { lineHeight: '1.5', fontWeight: '400' }],

      // Label
      'label-lg': ['0.875rem', { lineHeight: '1.4', fontWeight: '500' }],
      'label-md': ['0.8125rem', { lineHeight: '1.4', fontWeight: '500' }],
      'label-sm': ['0.75rem', { lineHeight: '1.3', fontWeight: '500' }],
      'label-xs': ['0.6875rem', { lineHeight: '1.3', fontWeight: '500' }],

      // Caption
      'caption': ['0.75rem', { lineHeight: '1.4', fontWeight: '400' }],
      'overline': ['0.6875rem', { lineHeight: '1.4', letterSpacing: '0.08em', fontWeight: '600', textTransform: 'uppercase' }],
    },
  },

  // ============================================
  // SPACING SYSTEM (8-point grid)
  // ============================================
  spacing: {
    '0': '0',
    'px': '1px',
    '0.5': '0.125rem', // 2px
    '1': '0.25rem', // 4px
    '1.5': '0.375rem', // 6px
    '2': '0.5rem', // 8px
    '2.5': '0.625rem', // 10px
    '3': '0.75rem', // 12px
    '3.5': '0.875rem', // 14px
    '4': '1rem', // 16px
    '5': '1.25rem', // 20px
    '6': '1.5rem', // 24px
    '7': '1.75rem', // 28px
    '8': '2rem', // 32px
    '9': '2.25rem', // 36px
    '10': '2.5rem', // 40px
    '11': '2.75rem', // 44px
    '12': '3rem', // 48px
    '14': '3.5rem', // 56px
    '16': '4rem', // 64px
    '20': '5rem', // 80px
    '24': '6rem', // 96px
    '28': '7rem', // 112px
    '32': '8rem', // 128px
    '36': '9rem', // 144px
    '40': '10rem', // 160px
    '44': '11rem', // 176px
    '48': '12rem', // 192px
    '52': '13rem', // 208px
    '56': '14rem', // 224px
    '60': '15rem', // 240px
    '64': '16rem', // 256px
    '72': '18rem', // 288px
    '80': '20rem', // 320px
    '96': '24rem', // 384px
  },

  // ============================================
  // BORDER RADIUS
  // ============================================
  radius: {
    none: '0',
    xs: '0.125rem', // 2px
    sm: '0.25rem', // 4px
    md: '0.375rem', // 6px
    DEFAULT: '0.5rem', // 8px
    lg: '0.75rem', // 12px
    xl: '1rem', // 16px
    '2xl': '1.25rem', // 20px
    '3xl': '1.5rem', // 24px
    '4xl': '2rem', // 32px
    full: '9999px',
  },

  // ============================================
  // SHADOWS
  // ============================================
  shadows: {
    none: 'none',
    xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
    DEFAULT: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
    md: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
    lg: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
    xl: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',

    // Special shadows for dark theme
    glow: {
      sm: '0 0 10px rgba(59, 130, 246, 0.3)',
      DEFAULT: '0 0 20px rgba(59, 130, 246, 0.3)',
      lg: '0 0 40px rgba(59, 130, 246, 0.3)',
      success: '0 0 20px rgba(34, 197, 94, 0.3)',
      warning: '0 0 20px rgba(245, 158, 11, 0.3)',
      danger: '0 0 20px rgba(239, 68, 68, 0.3)',
    },

    // Glass effect shadow
    glass: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',

    // Floating shadow
    floating: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
  },

  // ============================================
  // ANIMATION & TRANSITIONS
  // ============================================
  animation: {
    duration: {
      instant: '0ms',
      fast: '100ms',
      normal: '200ms',
      slow: '300ms',
      slower: '500ms',
      slowest: '700ms',
    },

    easing: {
      DEFAULT: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    },
  },

  // ============================================
  // Z-INDEX
  // ============================================
  zIndex: {
    backdrop: -10,
    base: 0,
    dropdown: 10,
    sticky: 20,
    fixed: 30,
    modalBackdrop: 40,
    modal: 50,
    popover: 60,
    tooltip: 70,
    toast: 80,
    top: 90,
    max: 9999,
  },

  // ============================================
  // BREAKPOINTS
  // ============================================
  breakpoints: {
    xs: '480px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1440px',
    '3xl': '1680px',
  },

  // ============================================
  // COMPONENT SIZES
  // ============================================
  sizes: {
    button: {
      xs: { h: '1.5rem', px: '0.5rem', fontSize: '0.6875rem' },
      sm: { h: '2rem', px: '0.75rem', fontSize: '0.8125rem' },
      md: { h: '2.5rem', px: '1rem', fontSize: '0.875rem' },
      lg: { h: '3rem', px: '1.25rem', fontSize: '1rem' },
      xl: { h: '3.5rem', px: '1.5rem', fontSize: '1.125rem' },
    },

    input: {
      sm: { h: '2rem', px: '0.75rem', fontSize: '0.8125rem' },
      md: { h: '2.5rem', px: '1rem', fontSize: '0.875rem' },
      lg: { h: '3rem', px: '1.25rem', fontSize: '1rem' },
    },

    avatar: {
      xs: '1.5rem',
      sm: '2rem',
      md: '2.5rem',
      lg: '3rem',
      xl: '4rem',
      '2xl': '6rem',
    },

    icon: {
      xs: '0.75rem',
      sm: '1rem',
      md: '1.25rem',
      lg: '1.5rem',
      xl: '2rem',
    },
  },
} as const;

// Export shadcn-style css variables
export const cssVariables = `
:root {
  /* Colors */
  --background: 0 0% 4%;
  --foreground: 0 0% 98%;
  --card: 0 0% 9%;
  --card-foreground: 0 0% 98%;
  --popover: 0 0% 9%;
  --popover-foreground: 0 0% 98%;
  --primary: 217 91% 60%;
  --primary-foreground: 0 0% 100%;
  --secondary: 240 6% 10%;
  --secondary-foreground: 0 0% 98%;
  --muted: 240 4% 16%;
  --muted-foreground: 240 5% 65%;
  --accent: 217 91% 60%;
  --accent-foreground: 0 0% 100%;
  --destructive: 0 72% 51%;
  --destructive-foreground: 0 0% 100%;
  --success: 142 71% 45%;
  --success-foreground: 0 0% 100%;
  --warning: 38 92% 50%;
  --warning-foreground: 0 0% 100%;
  --border: 0 0% 15%;
  --input: 0 0% 15%;
  --ring: 217 91% 60%;

  /* Radius */
  --radius: 0.5rem;
}

.light {
  --background: 0 0% 100%;
  --foreground: 240 10% 4%;
  --card: 0 0% 100%;
  --card-foreground: 240 10% 4%;
  --popover: 0 0% 100%;
  --popover-foreground: 240 10% 4%;
  --primary: 217 91% 60%;
  --primary-foreground: 0 0% 100%;
  --secondary: 240 5% 96%;
  --secondary-foreground: 240 6% 10%;
  --muted: 240 5% 96%;
  --muted-foreground: 240 4% 46%;
  --accent: 240 5% 96%;
  --accent-foreground: 240 6% 10%;
  --destructive: 0 72% 51%;
  --destructive-foreground: 0 0% 100%;
  --success: 142 71% 45%;
  --success-foreground: 0 0% 100%;
  --warning: 38 92% 50%;
  --warning-foreground: 0 0% 100%;
  --border: 240 6% 90%;
  --input: 240 6% 90%;
  --ring: 217 91% 60%;
}
`;

// Export type-safe token access
export type Tokens = typeof tokens;
export type ColorToken = keyof typeof tokens.colors;
export type SpacingToken = keyof typeof tokens.spacing;
export type RadiusToken = keyof typeof tokens.radius;
export type FontSizeToken = keyof typeof tokens.typography.fontSize;
export type ShadowToken = keyof typeof tokens.shadows;
