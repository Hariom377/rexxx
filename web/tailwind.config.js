/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // REXAM Brand Palette — "Official Intelligence"
        bg: {
          primary: '#09090B',      // True near-black, zinc undertone
          secondary: '#0F0F12',    // Slightly lighter panel bg
          card: '#141418',         // Card surfaces
          elevated: '#1C1C22',     // Elevated surfaces, dropdowns
          hover: '#22222A',        // Hover state
          overlay: '#050507',      // Modal overlay base
        },
        border: {
          DEFAULT: '#27272F',      // Standard border
          subtle: '#1E1E26',       // Hairline borders
          strong: '#38383F',       // Emphasis borders
          accent: '#10B98130',     // Green-tinted borders
        },
        text: {
          primary: '#FAFAFA',      // High-contrast headings
          secondary: '#A1A1AA',    // Body text, descriptions
          muted: '#71717A',        // Timestamps, metadata
          disabled: '#3F3F46',     // Disabled state
          inverse: '#09090B',      // Text on green backgrounds
        },
        accent: {
          green: '#10B981',                // Emerald — authoritative, not neon
          'green-dim': '#10B98112',        // Green tinted backgrounds
          'green-hover': '#059669',        // Darker hover
          'green-muted': '#10B98140',      // Medium opacity
          blue: '#3B82F6',
          'blue-dim': '#3B82F612',
          orange: '#F59E0B',
          'orange-dim': '#F59E0B12',
          red: '#EF4444',
          'red-dim': '#EF444412',
          yellow: '#EAB308',
          'yellow-dim': '#EAB30812',
          purple: '#8B5CF6',
          'purple-dim': '#8B5CF612',
        },
        // Trust / Official palette
        trust: {
          bg: '#10B98108',
          border: '#10B98125',
          text: '#6EE7B7',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
      },
      fontSize: {
        '2xs': ['10px', { lineHeight: '14px', letterSpacing: '0.03em' }],
        '3xs': ['9px', { lineHeight: '12px', letterSpacing: '0.05em' }],
      },
      letterSpacing: {
        tightest: '-0.04em',
        tighter: '-0.02em',
        display: '-0.03em',
      },
      borderRadius: {
        card: '10px',
        badge: '5px',
        pill: '999px',
        button: '8px',
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.5), 0 1px 2px rgba(0,0,0,0.6)',
        elevated: '0 4px 20px rgba(0,0,0,0.6)',
        glow: '0 0 24px rgba(16,185,129,0.12)',
        'glow-sm': '0 0 12px rgba(16,185,129,0.08)',
        'inner-border': 'inset 0 1px 0 rgba(255,255,255,0.04)',
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
        mobile: '375px',
        tablet: '600px',
        desktop: '1024px',
        'large-desktop': '1440px',
      },
      animation: {
        'fade-up': 'fadeUp 0.4s ease-out both',
        'fade-in': 'fadeIn 0.3s ease-out both',
        'slide-in': 'slideIn 0.3s ease-out both',
        'pulse-dot': 'pulseDot 2s ease-in-out infinite',
        'ticker': 'ticker 30s linear infinite',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(-8px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        pulseDot: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.4' },
        },
        ticker: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
    },
  },
  plugins: [],
}
