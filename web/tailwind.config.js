/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Theme: Light mode only, high contrast, WCAG 2.2 AA compliant
        bg: {
          primary: '#FFFFFF',      // Page background
          secondary: '#F8FAFC',    // Alternate sections, panels
          card: '#FFFFFF',         // Card surfaces
          elevated: '#F1F5F9',     // Dropdowns, input backgrounds, subtle pills
          hover: '#E2E8F0',        // Hover state on elevated elements
          alt: '#F8FAFC',          // Alternate background
        },
        border: {
          DEFAULT: '#E2E8F0',      // Standard border
          subtle: '#F1F5F9',       // Hairline borders
          strong: '#CBD5E1',       // High-contrast emphasis borders
          accent: '#1D4ED830',     // Subtle brand-tinted border
        },
        text: {
          primary: '#0F172A',      // Primary headings & body (15.6:1 on white)
          secondary: '#475569',    // Subheadings, labels, secondary body (5.4:1 on white)
          muted: '#475569',        // Metadata, timestamps (never lighter than #475569 on white)
          disabled: '#64748B',     // Form disabled text
          inverse: '#FFFFFF',      // White text on dark/brand buttons
        },
        // Brand & Primary Action (Blue #1D4ED8)
        brand: {
          DEFAULT: '#1D4ED8',      // Primary action button & links
          hover: '#1E40AF',        // Hover state
          light: '#EFF6FF',        // Subtle brand background
          subtle: '#DBEAFE',       // Brand tint border
          action: '#1D4ED8',
          'action-hover': '#1E40AF',
        },
        'brand-action': {
          DEFAULT: '#1D4ED8',
          hover: '#1E40AF',
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
        DEFAULT: '8px',
        card: '8px',
        button: '8px',
        input: '8px',
        pill: '9999px',
        sm: '6px',
        md: '8px',
        lg: '8px',
      },
      boxShadow: {
        none: 'none',
        card: '0 1px 2px 0 rgba(15, 23, 42, 0.04), 0 0 0 1px #E2E8F0',
        elevated: '0 4px 6px -1px rgba(15, 23, 42, 0.05), 0 2px 4px -2px rgba(15, 23, 42, 0.05)',
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
