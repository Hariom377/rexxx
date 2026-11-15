/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Theme: Warm natural light mode with deep forest green brand (matching REXAM showcase)
        bg: {
          primary: '#FBFBFA',      // Warm natural off-white page background
          secondary: '#F4F3EE',    // Warm alternate sections, panels
          card: '#FFFFFF',         // Crisp white card surfaces
          elevated: '#EFEFEA',     // Dropdowns, input backgrounds, subtle pills
          hover: '#E5E4DE',        // Hover state on elevated elements
          alt: '#F4F3EE',          // Alternate background
          forest: '#143826',       // Deep forest green container
        },
        border: {
          DEFAULT: '#E6E4DE',      // Soft warm border
          subtle: '#EFEFEA',       // Hairline borders
          strong: '#D1CFCA',       // High-contrast emphasis borders
          accent: '#183D2B25',     // Subtle brand-tinted border
        },
        text: {
          primary: '#111827',      // Deep charcoal/black headings & body (16:1 contrast)
          secondary: '#575653',    // Warm muted gray subheadings & metadata (5.5:1 contrast)
          muted: '#6E6D68',        // Metadata, timestamps
          disabled: '#9E9D97',     // Form disabled text
          inverse: '#FFFFFF',      // White text on dark/brand buttons
        },
        // Brand & Primary Action (Deep Forest Green #183D2B)
        brand: {
          DEFAULT: '#183D2B',      // Primary action button & links
          hover: '#102B1E',        // Deep forest hover state
          active: '#0B1E15',
          light: '#EBF3EC',        // Soft mint/sage tint
          subtle: '#D5E4D8',       // Brand tint border
          action: '#183D2B',
          'action-hover': '#102B1E',
          forest: '#143826',
        },
        'brand-action': {
          DEFAULT: '#183D2B',
          hover: '#102B1E',
        },
        // Urgent Deadline (Amber)
        urgent: {
          DEFAULT: '#92400E',      // Amber text
          text: '#92400E',         // Amber text
          bg: '#FFFBEB',           // Amber background
          border: '#F59E0B',       // Amber border
        },
        // Eligibility Status Colors (Strictly for Eligibility results)
        status: {
          eligible: {
            text: '#15803D',       // Forest Green
            bg: '#F0FDF4',         // Mint White
            border: '#BBF7D0',     // Soft Green
          },
          ineligible: {
            text: '#B91C1C',       // Crimson Red
            bg: '#FEF2F2',         // Soft Red
            border: '#FECACA',     // Soft Red Border
          },
          info: {
            text: '#92400E',       // Amber
            bg: '#FFFBEB',         // Amber Tint
            border: '#FDE68A',     // Amber Border
          },
        },
        // Accents (neutral, accessible variants)
        accent: {
          blue: '#1D4ED8',
          'blue-dim': '#EFF6FF',
          green: '#15803D',
          'green-dim': '#F0FDF4',
          orange: '#C2410C',
          'orange-dim': '#FFF7ED',
          red: '#B91C1C',
          'red-dim': '#FEF2F2',
          purple: '#6D28D9',
          'purple-dim': '#F5F3FF',
        },
      },
      fontFamily: {
        sans: [
          '"Noto Sans"',
          '"Noto Sans Devanagari"',
          'system-ui',
          '-apple-system',
          'sans-serif',
        ],
        display: [
          '"Noto Sans"',
          '"Noto Sans Devanagari"',
          'system-ui',
          '-apple-system',
          'sans-serif',
        ],
      },
      fontSize: {
        headline: ['clamp(28px, 5vw, 44px)', { lineHeight: '1.25', fontWeight: '700' }],
        '2xs': ['11px', { lineHeight: '16px' }],
        '3xs': ['10px', { lineHeight: '14px' }],
      },
      letterSpacing: {
        normal: '0',
        wide: '0.02em',
        wider: '0.04em',
      },
      lineHeight: {
        normal: '1.6',
        relaxed: '1.6',
        indic: '1.8',
        tight: '1.25',
      },
      borderRadius: {
        DEFAULT: '10px',
        card: '12px',
        button: '10px',
        input: '10px',
        pill: '9999px',
        sm: '6px',
        md: '10px',
        lg: '12px',
        xl: '16px',
        '2xl': '20px',
      },
      boxShadow: {
        none: 'none',
        card: '0 1px 3px 0 rgba(20, 20, 20, 0.04), 0 0 0 1px #E6E4DE',
        elevated: '0 4px 12px -2px rgba(24, 61, 43, 0.06)',
      },
      maxWidth: {
        content: '1200px',
        detail: '960px',
        report: '900px',
        form: '640px',
        'form-sm': '460px',
        'form-xs': '400px',
      },
      screens: {
        mobile: '360px',
        tablet: '768px',
        desktop: '1024px',
        'large-desktop': '1280px',
      },
    },
  },
  plugins: [],
}
