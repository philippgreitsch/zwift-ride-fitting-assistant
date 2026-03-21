# Stack Research

**Domain:** Frontend-only webapp — form inputs, calculation logic, local storage persistence
**Researched:** 2026-03-21
**Confidence:** HIGH (all versions verified against npm/official sources)

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| React | 19.2.4 | UI framework | Stable, dominant ecosystem, hooks-first model fits a form-heavy single-page app perfectly. React 19 adds built-in Actions and improved async transitions but no migration pain from 18. |
| TypeScript | 5.9.x | Type safety | Calculation logic translates measurements to Zwift Ride positions — type safety prevents silent conversion bugs. Also catches shape mismatches in localStorage serialization. |
| Vite | 8.x | Build tool / dev server | Sub-300ms dev server startup, near-instant HMR. Vite 8 ships Rolldown (Rust bundler) for 10–30x faster builds. Zero-config for Vite+React. Vercel auto-detects. |
| Tailwind CSS | 4.x | Styling | v4 (stable since Jan 2025) uses a CSS-native config with no JS config file to maintain. 5x faster full builds via Oxide (Rust engine). Works out of the box with Vite 8. |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| React Hook Form | 7.71.x | Form state management | Use for all multi-field input forms. Uncontrolled components = zero re-renders on keystroke. No dependencies. RHF 7 integrates directly with Zod via `@hookform/resolvers`. |
| Zod | 4.3.x | Input validation schema | Validate all user-entered measurements (ranges, types, required fields). v4 is 14x faster than v3 with 57% smaller bundle. Use `@zod/mini` if bundle is a concern. |
| @hookform/resolvers | 3.x | Bridge RHF ↔ Zod | Adapter that feeds Zod schema directly into React Hook Form's validation pipeline — eliminates hand-wiring errors to fields. |
| Zustand | 5.0.12 | State + localStorage persistence | Stores the fit profile (all entered measurements) across sessions. `persist` middleware serializes to `localStorage` automatically — no manual `useEffect` boilerplate. |
| shadcn/ui | latest (CLI-based) | Accessible UI components | Copies component source into your repo (no locked dependency). Built on Radix primitives with Tailwind styling. Use for Input, Label, Button, Select, Tabs, Card — the exact components a form-heavy fitting tool needs. |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| Vite (built-in) | Dev server + HMR | `npm run dev` — no extra config needed |
| ESLint + eslint-plugin-react-hooks | Lint rules for React hooks | Catches stale closure bugs in calculation logic |
| Prettier | Code formatting | Pair with ESLint; no Tailwind-specific config needed for v4 |
| Vitest | Unit testing | Same config as Vite; use for testing the measurement conversion/calculation functions |

## Installation

```bash
# Scaffold project
npm create vite@latest zwift-fit -- --template react-ts
cd zwift-fit

# Core styling
npm install tailwindcss @tailwindcss/vite

# Forms + validation
npm install react-hook-form @hookform/resolvers zod

# State + persistence
npm install zustand

# Dev dependencies
npm install -D vitest @testing-library/react @testing-library/jest-dom eslint prettier

# shadcn/ui (CLI — copies components into src/components/ui/)
npx shadcn@latest init
```

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Vite | Next.js | If you need SSR, SSG, or API routes — not needed here, adds complexity with no benefit for a pure frontend calculator |
| Vite | Create React App | CRA is officially deprecated; do not use |
| React Hook Form | Formik | Formik is fine for simpler forms, but 9 dependencies vs RHF's 0, and measurably more re-renders. No reason to prefer Formik in 2026. |
| Zustand persist | Direct `localStorage` + `useState` | Acceptable for a single value, but a fitting profile has 10–15 fields; Zustand's persist middleware handles the full object without per-field boilerplate |
| Zustand persist | TanStack Query | TanStack Query is for server/async state. Overkill here — there is no API to query. |
| shadcn/ui | Mantine / MUI | Both are installed as dependencies you don't own. shadcn/ui gives you the source — easier to adapt for Zwift Ride's specific layout needs |
| Zod v4 | Yup | Zod v4 is faster, smaller, and TypeScript-first. Yup has no meaningful advantages for this use case. |
| Tailwind v4 | CSS Modules | Tailwind v4 is faster and pairs with shadcn/ui. CSS Modules require more authoring for the same result. |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| Create React App | Officially deprecated by the React team; unmaintained, slower build tooling | Vite |
| Next.js (for this project) | App router, file-based routing, SSR — all dead weight for a purely client-side calculator with no pages to route | Vite + React |
| Redux Toolkit | Severe overkill: no async data, no complex derived state, no inter-slice coordination. Adds 40KB+ and boilerplate | Zustand |
| Formik | 9 npm dependencies, controlled-component architecture causes full-form re-renders on every keystroke, slowing down forms with 10+ inputs | React Hook Form |
| Zod v3 | v4 is available, stable, and 14x faster with a smaller bundle. No reason to pin to v3 | Zod v4 |
| Class Variance Authority (CVA) without shadcn/ui | Adds complexity only justified if building a custom design system. shadcn/ui includes variant handling | shadcn/ui's built-in variant patterns |

## Stack Patterns by Variant

**If the calculation logic grows complex (multi-step wizard, branching formulas):**
- Keep all calculation functions as pure TypeScript in `src/lib/calculations.ts`
- Do NOT put formulas inside React components — they become untestable
- Test with Vitest: `import { calculateSaddleHeight } from './calculations'`

**If shadcn/ui feels heavy for a small app:**
- Use Radix UI primitives directly with Tailwind classes
- shadcn/ui is just Radix + Tailwind pre-wired — you can replicate selectively
- Recommend: use shadcn/ui anyway; the copy-in-source model means you only ship what you use

**If Tailwind v4 causes any Vite integration issues:**
- v4 uses `@tailwindcss/vite` plugin (not the postcss plugin used in v3)
- Add to `vite.config.ts`: `import tailwindcss from '@tailwindcss/vite'` and include in plugins array
- Add `@import "tailwindcss"` to `src/index.css` — no `tailwind.config.js` needed

## Version Compatibility

| Package | Compatible With | Notes |
|---------|-----------------|-------|
| React 19.2.x | React Hook Form 7.71.x | RHF 7 fully supports React 19 concurrent features |
| React 19.2.x | Zustand 5.0.x | Zustand v5 drops React 17 support; works cleanly with 18/19 |
| Tailwind v4 | Vite 8.x | Requires `@tailwindcss/vite` plugin (not postcss); documented in Tailwind v4 migration guide |
| Tailwind v4 | shadcn/ui | shadcn/ui migrated to Tailwind v4 support — use `npx shadcn@latest init` which auto-detects v4 |
| Zod 4.x | @hookform/resolvers 3.x | resolvers 3.x includes the Zod v4 adapter; verify `@hookform/resolvers` is on 3.x |

## Sources

- [Vite 8.0 release announcement](https://vite.dev/blog/announcing-vite8) — verified Vite 8 (Rolldown), released March 2026 — HIGH confidence
- [React v19.2 blog post](https://react.dev/blog/2025/10/01/react-19-2) — verified React 19.2 stable — HIGH confidence
- [Tailwind CSS v4.0 announcement](https://tailwindcss.com/blog/tailwindcss-v4) — verified stable Jan 2025, v4 config model — HIGH confidence
- [React Hook Form npm](https://www.npmjs.com/package/react-hook-form) — verified 7.71.2 current — HIGH confidence
- [Zustand npm](https://www.npmjs.com/package/zustand) — verified 5.0.12 current — HIGH confidence
- [Zustand persist middleware docs](https://zustand.docs.pmnd.rs/reference/middlewares/persist) — verified localStorage default behavior — HIGH confidence
- [Zod v4 release notes](https://zod.dev/v4) — verified 4.3.6 current, 14x perf improvement — HIGH confidence
- [TypeScript 5.9 docs](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-9.html) — verified 5.9.x current — HIGH confidence
- [shadcn/ui comparison 2026](https://www.pkgpulse.com/blog/shadcn-ui-vs-base-ui-vs-radix-components-2026) — shadcn/ui now default choice for new React projects — MEDIUM confidence (community source, corroborated by multiple independent sources)
- [Vercel Vite deployment docs](https://vercel.com/docs/frameworks/frontend/vite) — confirmed zero-config deploy, free tier — HIGH confidence
- [React form libraries 2026 comparison](https://blog.croct.com/post/best-react-form-libraries) — RHF community consensus — MEDIUM confidence

---
*Stack research for: Zwift Ride Fitting Assistant — frontend-only webapp*
*Researched: 2026-03-21*
