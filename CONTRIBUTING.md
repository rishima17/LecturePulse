# Contributing to LecturePulse 🎓

Thank you for your interest in contributing to **LecturePulse** — a real-time student feedback application that bridges the communication gap between educators and students during live lectures.

Whether you're contributing through **SSOC 2026** or independently, this guide will walk you through everything you need to make your first PR a smooth experience. Welcome aboard! 🚀

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
  - [Fork & Clone the Repository](#fork--clone-the-repository)
  - [Setting Up the Development Environment](#setting-up-the-development-environment)
- [Project Structure](#project-structure)
- [Branch Naming Conventions](#branch-naming-conventions)
- [Making Changes](#making-changes)
  - [Commit Message Style](#commit-message-style)
- [Submitting a Pull Request](#submitting-a-pull-request)
- [Getting Assigned an Issue](#getting-assigned-an-issue)
- [Reporting Issues](#reporting-issues)
- [Need Help?](#need-help)

---

## Code of Conduct

By participating in this project, you agree to keep this space respectful, inclusive, and beginner-friendly. Be constructive, patient, and kind — especially with first-time contributors. We're an SSOC 2026 project and welcome contributors of all experience levels. ❤️

---

## Getting Started

### Fork & Clone the Repository

1. **Fork** this repository by clicking the **Fork** button at the top-right of the [LecturePulse GitHub page](https://github.com/rishima17/LecturePulse).

2. **Clone** your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/LecturePulse.git
   ```

3. **Add the upstream remote** to stay in sync with the original:
   ```bash
   git remote add upstream https://github.com/rishima17/LecturePulse.git
   ```

4. **Verify your remotes:**
   ```bash
   git remote -v
   # origin    https://github.com/YOUR_USERNAME/LecturePulse.git (fetch)
   # upstream  https://github.com/rishima17/LecturePulse.git (fetch)
   ```

---

### Setting Up the Development Environment

#### Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| [Node.js](https://nodejs.org/) | v18.0.0+ | JavaScript runtime |
| [npm](https://npmjs.com/) | v9.0.0+ | Package manager |

#### Steps

1. **Navigate to the project root:**
   ```bash
   cd LecturePulse
   ```

2. **Change directory into the Vite React app:**
   ```bash
   cd lecture-pulse
   ```

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```
   The app will launch at `http://localhost:5173/` by default.

5. **Verify ESLint configuration:**
   ```bash
   npm run lint
   ```

6. **Keep your fork up to date** before starting any new work:
   ```bash
   git fetch upstream
   git checkout main
   git merge upstream/main
   ```

> **Note:** LecturePulse uses `localStorage` to simulate backend persistence — no database or API keys are required. Setup is fully lightweight for frontend contributors.

---

## Project Structure

All core code lives inside the `lecture-pulse/` folder:

```text
lecture-pulse/
├── public/                      # Static assets (logos, images)
├── src/
│   ├── assets/                  # Brand logos and illustration assets
│   ├── components/              # Reusable presentation components
│   │   ├── charts/              # Custom Recharts wraps (Pie, Line charts)
│   │   ├── ui/                  # Radix-ui/slot customized primitives
│   │   ├── LectureCard.jsx      # Card layout for listing lectures
│   │   └── CreateLectureDialog.jsx  # Pop-up to spawn new sessions
│   ├── context/
│   │   └── AuthContext.jsx      # Authentication provider (LocalStorage mock)
│   ├── pages/                   # Primary route view components
│   │   ├── Landing.jsx          # Glassmorphic home page
│   │   ├── Login.jsx            # Teacher registration & login portal
│   │   ├── Dashboard.jsx        # Live session monitor & control center
│   │   ├── StudentFeedback.jsx  # Student sentiment interface
│   │   └── Analytics.jsx        # Detailed chart analysis of sessions
│   ├── utils/                   # Helper utilities & localStorage managers
│   ├── App.jsx                  # Route definitions and global providers
│   ├── index.css                # Global stylesheets & Tailwind directives
│   └── main.jsx                 # Application entry point
├── eslint.config.js             # Linter rules configuration
├── package.json                 # Scripts and dependencies
└── vite.config.js               # Vite custom configuration
```

- **UI/component changes** → `src/components/`
- **New pages or routes** → `src/pages/` + update `App.jsx`
- **Chart or analytics changes** → `src/components/charts/`
- **Utility/helper changes** → `src/utils/`
- **Auth or session logic** → `src/context/AuthContext.jsx`

---

## Branch Naming Conventions

Always create a new branch for your changes. **Never commit directly to `main`.**

Use this format:

```text
<type>/<short-description>
```

| Type | When to use | Example |
|------|-------------|---------|
| `feature` | Adding a new feature | `feature/export-session-report` |
| `bugfix` | Fixing a bug | `bugfix/session-code-validation` |
| `docs` | Documentation only | `docs/add-contributing-guide` |
| `chore` | Maintenance (deps, config) | `chore/update-dependencies` |
| `refactor` | Code restructuring, no behavior change | `refactor/dashboard-state-logic` |
| `test` | Adding or updating tests | `test/student-feedback-flow` |
| `style` | UI or formatting tweaks | `style/mobile-dashboard-layout` |

**Create your branch:**
```bash
git checkout -b feature/your-feature-name
```

---

## Making Changes

- Keep each PR **focused** — one feature or fix per PR. No force pushes.
- For **UI changes**, test across desktop, tablet, and mobile. The project uses a mobile-first approach with Tailwind CSS v4.
- For **animation changes**, use Framer Motion — stay consistent with existing motion patterns.
- For **chart/analytics changes**, use the existing Recharts setup in `src/components/charts/`.
- For **new components**, follow the existing JSX conventions and keep them reusable.
- Always **run the linter** before committing — PRs with lint errors will not be merged:
  ```bash
  npm run lint
  ```
- If merge conflicts arise, **rebase or merge `main` locally** — no force pushes.

### Commit Message Style

Follow the [Conventional Commits](https://www.conventionalcommits.org/) standard:

```text
<type>(<optional scope>): <short description>
```

**Examples for LecturePulse:**
```text
feat(dashboard): add export button for session feedback
fix(student): resolve session code validation edge case
docs: add environment setup steps to CONTRIBUTING.md
chore(deps): upgrade framer-motion to v12
refactor(analytics): simplify confusion timeline data transform
style(landing): fix hero section overflow on mobile
```

**Rules:**
- Use **imperative mood** — "add", not "added" or "adds"
- Keep the subject line under **72 characters**
- Reference related issues at the bottom: `Fixes #42` or `Closes #7`

---

## Submitting a Pull Request

1. **Ensure lint passes:**
   ```bash
   npm run lint
   ```

2. **Push your branch** to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

3. Go to [rishima17/LecturePulse](https://github.com/rishima17/LecturePulse) on GitHub and click **"Compare & pull request"**.

4. Open your PR **against the `main` branch** of `rishima17/LecturePulse`.

5. Fill in the PR description with:
   - A clear **title** (e.g. `feat: add real-time feedback export button`)
   - **What changed** and **why**
   - Screenshots or screen recordings for any UI changes
   - The issue it resolves: `Fixes #<issue-number>`

6. **PR checklist before submitting:**
   - [ ] Branch is synced with latest `upstream/main`
   - [ ] Dev server compiles without errors (`npm run dev`)
   - [ ] Lint passes with no errors (`npm run lint`)
   - [ ] UI changes tested across desktop and mobile
   - [ ] Commits follow Conventional Commits style
   - [ ] Issue is linked in the PR description

7. A maintainer will review your PR. Requested changes are normal — address the feedback, push your updates, and you'll get merged once approved. 🎉

---

## Getting Assigned an Issue

This project participates in **SSOC 2026** — issues must be assigned before you start working.

1. Browse [open issues](https://github.com/rishima17/LecturePulse/issues)
2. Comment on the issue you want to work on with your planned approach
3. Wait for the maintainer to officially assign it to you
4. Only begin coding **after assignment**

**Example comment:**
```markdown
Hi @rishima17 👋

I'd like to work on this issue for SSOC 2026.

Planned approach:
- Add an export button to the Analytics page
- Generate a downloadable CSV from the localStorage session data
- Update relevant documentation

Could you please assign this to me?
```

> Starting work before assignment may result in your PR not being merged.

---

## Reporting Issues

Found a bug or have a feature idea? [Open an issue](https://github.com/rishima17/LecturePulse/issues)!

**Before opening an issue:**
- Search [existing issues](https://github.com/rishima17/LecturePulse/issues) to avoid duplicates.
- Check if it's already fixed in the latest commit on `main`.

**For bug reports, include:**
- Clear, descriptive title
- Steps to reproduce the problem
- Expected vs. actual behavior
- Your OS, Node.js version (`node -v`), and browser
- Console errors from browser DevTools (if any)

**For feature requests, include:**
- The problem you're solving
- Your proposed solution
- Any alternatives you considered

---

## Need Help?

- Browse [open issues](https://github.com/rishima17/LecturePulse/issues) for context on ongoing work.
- Open a [GitHub Discussion](https://github.com/rishima17/LecturePulse/discussions) for questions that aren't bugs or features.
- Leave a comment directly on the relevant issue or PR.
- Reach the maintainer: [Rishima on GitHub](https://github.com/rishima17)

New to open source? Look for issues tagged **`good first issue`** — they're scoped to be approachable for beginners. We'd love to have you! 💙

---

*This guide is open to improvement too. If something is unclear or missing — feel free to open a PR or issue for it.*

---

<div align="center">

Made with ❤️ for the open-source community. Happy Coding!

[![Star on GitHub](https://img.shields.io/github/stars/rishima17/LecturePulse?style=social)](https://github.com/rishima17/LecturePulse)
[![Fork on GitHub](https://img.shields.io/github/forks/rishima17/LecturePulse?style=social)](https://github.com/rishima17/LecturePulse/fork)

</div>
