---
name: vibe-design-tailwind
description: |
  Layer 2 Tailwind CSS + shadcn/ui implementation patterns for EAM. Covers Tailwind 3.x config for Vietnamese FinTech (VND display, WCAG 2.1 AA colors), cn() utility, responsive utilities, dark mode, and shadcn/ui customization.
  
  LAYER 2 — Technology-Specific. Requires Layer 1 (vibe-designer-uxui + vibe-frontend-general) activation.
  STACK VALIDATION GUARD: Verify wiki/techstack/frontend.json → styling = "Tailwind CSS 3.x"
applyTo: "**"
---

# vibe-design-tailwind

## Tailwind Config for EAM

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // shadcn/ui CSS variable bridge
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        // Business status colors (WCAG AA compliant)
        status: {
          pending: '#D97706',   // amber-600 — contrast OK on white
          active: '#059669',    // emerald-600 — contrast OK on white
          cancelled: '#DC2626', // red-600 — contrast OK on white
          completed: '#2563EB', // blue-600 — contrast OK on white
        },
      },
      fontFamily: {
        sans: ['Be Vietnam Pro', 'Inter', 'ui-sans-serif', 'system-ui'],
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
export default config;
```

## References

- [Responsive Utilities](references/responsive-utilities.md)
- [Component Class Patterns](references/component-classes.md)
- [Dark Mode](references/dark-mode.md)
- [Status Badge System](references/status-badges.md)
