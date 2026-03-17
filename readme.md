# 99Tech Code Challenge #1

> **Note:** If you fork this repository, your responses may be publicly linked to this repo.
> Please submit your application along with the solutions attached or linked.

---

## Project Structure

```
code-challenge/
├── readme.md
└── src/
    ├── problem1/          # Sum to n — three algorithmic approaches
    ├── problem2/          # Currency Swap Form (React + TypeScript + Vite)
    │   ├── e2e/           # Playwright end-to-end tests
    │   ├── src/
    │   │   ├── components/
    │   │   │   ├── swap/          # SwapCard, SwapInput, SwapButton
    │   │   │   ├── TokenSelector.tsx
    │   │   │   ├── TokenPickerDialog.tsx
    │   │   │   └── TokenIcon.tsx
    │   │   ├── hooks/             # useTokens, useSwap
    │   │   └── types.ts
    │   ├── playwright.config.ts
    │   └── package.json
    ├── problem3/          # Code review + refactor of WalletPage
    │   ├── WalletPage.tsx         # Original code (annotated)
    │   ├── ImprovedWalletPage.tsx # Refactored solution
    │   └── SOLUTION.md            # Full issue analysis (22 issues)
    ├── problem4/
    └── problem5/
```

---

## Problem 2 — Currency Swap Form

### Tech Stack

- **React 19** + **TypeScript** + **Vite**
- **Tailwind CSS** + **shadcn/ui** (Radix primitives)
- **Playwright** for E2E testing

### Prerequisites

```bash
# Node.js >= 18, pnpm >= 8
npm install -g pnpm
```

### Run the App

```bash
cd src/problem2

# Install dependencies
pnpm install

# Start the dev server (http://localhost:5173)
pnpm dev
```

### Run E2E Tests (Playwright)

> The dev server must be running before executing tests.

```bash
cd src/problem2

# Run all 42 tests (headless)
pnpm test

# Interactive UI mode — step through tests visually
pnpm test:ui

# View HTML report after a test run
pnpm test:report
```

### Test Coverage

| Suite | # Tests | What's Covered |
|---|---|---|
| Initial Render | 6 | Card visible, default tokens, button state |
| Token Picker Dialog | 9 | Open/close, search, empty state, keyboard nav |
| Amount Input | 8 | Calculation, validation, fiat display |
| Exchange Rate | 2 | Shown in buy section, not in sell |
| Switch Direction | 3 | Token swap, amount swap |
| Auto-switch | 1 | Same token selected triggers flip |
| Swap Execution | 3 | Loading state, success banner, reset |
| Accessibility | 5 | ARIA roles, labels, listbox |
| Responsive Layout | 3 | Desktop / tablet / mobile |
| **Total** | **42** | |

---

## Problem 3 — Code Review: `WalletPage.tsx`

The original file contained **22 issues** across several categories.

### How Issues Were Collected

The original `WalletPage.tsx` was read line-by-line and each issue was annotated inline as a numbered comment (e.g. `//1.`, `//12a.`). Issues were grouped into:

- **Missing imports** — hooks and components referenced but not imported
- **TypeScript violations** — `any` types, missing interface fields, type mismatches
- **Logic bugs** — undefined variable (`lhsPriority`), inverted filter condition
- **Anti-patterns** — interface redundancy, `switch` for data lookup, `index` as React key, spreading unknown props onto native DOM
- **Performance** — repeated `getPriority()` calls in sort, wrong `useMemo` dependencies, dead computed variable

### Deliverables

| File | Purpose |
|---|---|
| [`WalletPage.tsx`](src/problem3/WalletPage.tsx) | Original code with inline issue annotations |
| [`ImprovedWalletPage.tsx`](src/problem3/ImprovedWalletPage.tsx) | Refactored solution (all 22 issues fixed) |
| [`SOLUTION.md`](src/problem3/SOLUTION.md) | Full issue breakdown with Before/After code and severity rating |

### Key Fixes at a Glance

```ts
// ✅ Extend instead of redeclare
interface FormattedWalletBalance extends WalletBalance { formatted: string }

// ✅ Lookup map instead of switch (module-level, no re-creation)
const PRIORITY_MAP = { Osmosis: 100, Ethereum: 50, Arbitrum: 30, ... };
const getPriority = (b: string) => PRIORITY_MAP[b] ?? -99;

// ✅ Fixed filter logic (keep positive balances with valid priority)
.filter(b => getPriority(b.blockchain) > -99 && b.amount > 0)

// ✅ Concise sort (no repeated calls, handles equal case)
.sort((lhs, rhs) => getPriority(rhs.blockchain) - getPriority(lhs.blockchain))

// ✅ Removed redundant `prices` dependency
}, [balances]);

// ✅ Stable key instead of index
<WalletRow key={balance.currency} ... />

// ✅ Box instead of div (safe MUI prop forwarding)
return <Box {...rest}>{rows}</Box>;
```

---

## Submission

Solutions can be submitted as a link to this repository or as an attached archive.
