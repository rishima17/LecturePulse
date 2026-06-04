# LecturePulse — Agent Guide

## Project Overview
React + Vite app for real-time anonymous student feedback during lectures. localStorage-based (no real backend). JSX only — no TypeScript.

## Working Directory
Always run commands from `lecture-pulse/` (the app directory), not the repo root.

## Build / Lint / Test Commands

```bash
npm run dev       # Start Vite dev server at http://localhost:5173
npm run build     # Production build to dist/
npm run preview   # Preview production build locally
npm run lint      # ESLint check (all .js/.jsx files)
```

**Note:** There is no test framework in the project. Do not add tests without explicit instruction.

### Commit Hook Behavior
- `pre-commit` runs `cd lecture-pulse && npm run lint` — lint must pass.
- `commit-msg` enforces Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`, `refactor:`, `style:`, etc.).
- Do NOT skip hooks with `--no-verify` unless explicitly asked.

## Code Style Guidelines

### Imports
- Use ES module `import`/`export` syntax exclusively.
- Use `@/` path alias for `src/` (e.g., `import { Button } from "@/components/ui/button"`).
- Relative imports (`./pages/...`) are also acceptable.
- Group imports: 3rd-party first, then absolute `@/`, then relative `./`.
- Prefer named exports for utilities and small components. Use `export default` for page-level components.
- Do NOT use `index.js`/`index.jsx` barrel files — import directly from the file.

### Naming Conventions
| Thing | Convention | Example |
|-------|-----------|---------|
| Component files | PascalCase | `LectureCard.jsx`, `AuthContext.jsx` |
| Utility/data files | camelCase | `storage.js`, `analytics.js` |
| Component functions | PascalCase, `function` declarations | `function Button()` |
| Hooks | `use` prefix + camelCase | `useAuth`, `useTheme` |
| Variables/functions | camelCase | `teacherId`, `getLectures()` |
| Constants (loose) | camelCase | no `UPPER_SNAKE` convention observed |

### Component Patterns
- Prefer `function ComponentName(props)` over `const Component = (props) =>`.
- Use `React.forwardRef` for reusable UI primitives (button, input, card).
- Set `displayName` on `forwardRef` components.
- Destructure props in the function signature.

### Styling
- Tailwind CSS v4 utility classes — do NOT use external CSS files (except `index.css` for theme variables).
- Use the `cn()` helper from `@/lib/utils` for conditional class merging (wraps `clsx` + `tailwind-merge`).
- Use CVA (`class-variance-authority`) for component variants (see `button.jsx`).
- Theme colors use CSS custom properties defined in `index.css` — reference them via Tailwind classes like `bg-background text-foreground`.
- Support `.dark` class for dark mode.

### State & Data
- All data is persisted in `localStorage` — use the helpers in `@/utils/storage.js`.
- Auth state lives in `AuthContext` (`@/context/AuthContext.jsx`).
- Theme state lives in `ThemeContext` (`@/context/ThemeContext.jsx`).

### Routing
- React Router v7 — define all routes in `App.jsx`.
- Use `<Link>` and `useNavigate` for navigation.

### Animations
- Use `framer-motion` for animations (`motion.div`, `AnimatePresence`, `variants`).

### Quoting & Semicolons
- Prefer **double quotes** for JSX attributes and strings (existing convention).
- Use **semicolons** consistently (existing codebase preference).
- Trailing commas in multiline objects/arrays.

### Error Handling
- Simple guard clauses (`if (!data) return`) rather than try/catch for expected absences.
- Use try/catch around async operations (fetch-like calls, localStorage reads).
- Show errors via `sonner` toast: `import { toast } from "sonner"` then `toast.error("Message")`.

### JSDoc & Types
- Document function parameters and return values with JSDoc `@param` / `@returns` for shared utilities.
- Use `@typedef` in `@/types/lecture.js` for shared object shapes.
- Add a dummy `export const Types = {}` when a types file has no runtime export.

### File Organization
```
src/
  pages/       — Route-level page components (one per route)
  components/
    ui/        — Reusable primitives (button, card, input)
    charts/    — Recharts-based chart components
  context/     — React context providers (Auth, Theme)
  hooks/       — Custom React hooks
  lib/         — Shared utilities (cn helper)
  utils/       — Domain logic (storage, analytics, pdf, ai)
  types/       — JSDoc type definitions
```

### What NOT To Do
- Do NOT add TypeScript — the project is JSX-only.
- Do NOT add test dependencies or test files unless explicitly requested.
- Do NOT introduce a backend or database — localStorage is the intentional data layer.
- Do NOT add barrel/index files.
- Do NOT convert existing `function` declarations to arrow functions or vice versa without reason.
