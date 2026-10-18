import type { Config } from "tailwindcss";

// Colors are CSS variables (RGB channels, defined in globals.css) so they switch with
// light/dark mode automatically and still support opacity modifiers like bg-accent/10.
const token = (name: string) => `rgb(var(--${name}) / <alpha-value>)`;

const config: Config = {
  darkMode: "class",
  // Hover styles only apply on devices that can truly hover, so they don't stick after a tap on phones
  future: {
    hoverOnlyWhenSupported: true,
  },
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/context/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        paper: token("paper"),
        "paper-2": token("paper-2"),
        surface: token("surface"),
        ink: token("ink"),
        muted: token("muted"),
        line: token("line"),
        accent: {
          DEFAULT: token("accent"),
          // Stronger shade: use for accent-colored text and filled buttons so text meets WCAG AA
          dark: token("accent-dark"),
          soft: token("accent-soft"),
        },
        // Milestones and streaks only
        marigold: token("marigold"),
        // Status messages (errors / saved confirmations)
        danger: token("danger"),
        success: token("success"),
      },
      borderRadius: {
        card: "10px",
      },
      boxShadow: {
        // Subtle hard-offset shadow, used on card hover
        offset: "3px 3px 0 0 rgb(var(--line))",
      },
      animation: {
        'pop': 'pop 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        'pulse-subtle': 'pulseSubtle 2.5s cubic-bezier(0.16, 1, 0.3, 1) infinite',
        'fade-in': 'fadeIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        pop: {
          '0%': { transform: 'scale(0.85)' },
          '50%': { transform: 'scale(1.12)' },
          '100%': { transform: 'scale(1)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.75' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
export default config;
