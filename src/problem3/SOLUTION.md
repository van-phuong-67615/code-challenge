# Problem 3 — Code Review: `WalletPage.tsx`

## Overview

This document identifies **22 issues** in the original `WalletPage.tsx` — covering bugs, anti-patterns, TypeScript violations, and performance problems — along with the fix applied in `ImprovedWalletPage.tsx`.

---

## Issues & Fixes

### 1. Interface Redundancy (`FormattedWalletBalance`)

| | |
|---|---|
| **Problem** | `FormattedWalletBalance` manually redeclares all fields from `WalletBalance` (`currency`, `amount`), violating DRY |
| **Fix** | Use `extends` so only the new field (`formatted`) needs to be declared |

```ts
// ❌ Before
interface FormattedWalletBalance {
  currency: string;
  amount: number;
  formatted: string;
}

// ✅ After
interface FormattedWalletBalance extends WalletBalance {
  formatted: string;
}
```

---

### 2. Missing Import — `BoxProps`

| | |
|---|---|
| **Problem** | `BoxProps` is used in the `Props` interface but never imported |
| **Fix** | `import Box, { BoxProps } from "@mui/material/Box"` |

---

### 3. Missing Import — `React`

| | |
|---|---|
| **Problem** | `React.FC` is used but `React` is not imported |
| **Fix** | `import React, { useMemo } from "react"` |

---

### 4. Unnecessary `Props` Interface

**4a.** `interface Props extends BoxProps {}` extends `BoxProps` but adds nothing. Use `BoxProps` directly.

**4b.** `React.FC<Props>` already infers the props type, so `(props: Props)` is redundant.

```ts
// ❌ Before
interface Props extends BoxProps {}
const WalletPage: React.FC<Props> = (props: Props) => {

// ✅ After
const WalletPage: React.FC<BoxProps> = (props) => {
```

---

### 5. `children` Declared but Never Used

| | |
|---|---|
| **Problem** | `const { children, ...rest } = props` — `children` is destructured but unused, causing a lint warning |
| **Fix** | Rename to `_children` (convention for intentionally unused variables) |

```ts
// ✅ After
const { children: _children, ...rest } = props;
```

---

### 6. Missing Import — `useWalletBalances`

`useWalletBalances` is called but never imported. Should be imported from its module.

---

### 7. Missing Import — `usePrices`

Same as above — `usePrices` is used without an import.

---

### 8. `any` Type in `getPriority`

| | |
|---|---|
| **Problem** | `(blockchain: any)` disables TypeScript type-checking — defeats the purpose of TypeScript |
| **Fix** | Use `string` (or a union type of known blockchains) |

```ts
// ❌ Before
const getPriority = (blockchain: any): number => { ... }

// ✅ After
const getPriority = (blockchain: string): number => { ... }
```

---

### 9. `switch` Statement for Priority Lookup

| | |
|---|---|
| **Problem** | A `switch` with fixed string cases is verbose, hard to scale, hard to test, and recreated inside the component on every render |
| **Fix** | Replace with a module-level `Record` map + single lookup |

```ts
// ❌ Before — inside component, switch on every call
const getPriority = (blockchain: any): number => {
  switch (blockchain) {
    case "Osmosis": return 100;
    case "Ethereum": return 50;
    // ...
  }
};

// ✅ After — module-level constant
const PRIORITY_MAP: Record<string, number> = {
  Osmosis: 100, Ethereum: 50, Arbitrum: 30, Zilliqa: 20, Neo: 20,
};
const getPriority = (blockchain: string): number =>
  PRIORITY_MAP[blockchain] ?? -99;
```

---

### 10. Missing Import — `useMemo`

`useMemo` is used without being imported from React.

---

### 11. `blockchain` Missing from `WalletBalance`

| | |
|---|---|
| **Problem** | `balance.blockchain` is accessed inside `getPriority()` but `blockchain` is not declared in the `WalletBalance` interface, causing a TypeScript error |
| **Fix** | Add `blockchain: string` to the interface |

```ts
interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: string; // ✅ added
}
```

---

### 12. Two Bugs Inside `.filter()`

**12a. `lhsPriority` is undefined** — `balancePriority` is computed but `lhsPriority` (a typo/undefined variable) is used in the condition instead.

**12b. Wrong filter logic** — the condition `balance.amount <= 0` returns `true`, meaning it keeps zero/negative balances. A wallet list should keep only **positive** balances.

```ts
// ❌ Before
const balancePriority = getPriority(balance.blockchain);
if (lhsPriority > -99) {        // lhsPriority is undefined!
  if (balance.amount <= 0) {    // keeps zero balances — wrong
    return true;
  }
}
return false;

// ✅ After
return getPriority(balance.blockchain) > -99 && balance.amount > 0;
```

---

### 13. Three Issues in the `.sort()` Comparator

| Issue | Detail |
|---|---|
| Missing `0` case | Comparator returns `undefined` when priorities are equal (should return `0`) |
| Verbose | 4-line if/else for a simple subtraction |
| Repeated computation | `getPriority()` is called twice per item per comparison — O(n log n) calls |

```ts
// ❌ Before
if (leftPriority > rightPriority) return -1;
else if (rightPriority > leftPriority) return 1;
// missing: equal case returns undefined

// ✅ After — one line, calls getPriority once each
.sort((lhs, rhs) => getPriority(rhs.blockchain) - getPriority(lhs.blockchain))
```

---

### 14. Redundant `prices` in `useMemo` Dependency Array

| | |
|---|---|
| **Problem** | `prices` is listed as a dependency of `sortedBalances` but is **not used** inside the memo computation — causing unnecessary recalculations when prices change |
| **Fix** | Remove `prices` from the dependency array |

```ts
// ❌ Before
}, [balances, prices]);

// ✅ After
}, [balances]);
```

---

### 15. `formattedBalances` Declared but Never Used

The original code computes `formattedBalances` via `.map()` but then uses `sortedBalances` (the unformatted list) to render `rows`. The formatted list is discarded.

**Fix:** Merge the `.map()` formatting step directly into the `useMemo` pipeline so the result is `FormattedWalletBalance[]` from the start.

---

### 16. Missing Digits Argument in `toFixed()`

| | |
|---|---|
| **Problem** | `balance.amount.toFixed()` with no argument defaults to 0 decimal places — crypto amounts need decimal precision |
| **Fix** | `balance.amount.toFixed(6)` |

---

### 17. Missing Import — `WalletRow`

`<WalletRow>` is used in JSX but never imported.

---

### 18. `classes` is Not Defined

`classes.row` is referenced without `classes` being declared anywhere. In MUI v4 pattern this requires `const classes = useStyles()`.

**Fix:**
```ts
import { makeStyles } from "@mui/material/styles";
const useStyles = makeStyles({ row: { ... } });
// inside component:
const classes = useStyles();
```

---

### 19. `index` Used as React Key

| | |
|---|---|
| **Problem** | `key={index}` is an anti-pattern — React's diffing algorithm uses keys to identify elements; using array index causes wrong re-renders when the list is filtered, sorted, or reordered |
| **Fix** | Use a stable unique identifier: `key={balance.currency}` |

```tsx
// ❌ Before
rows.map((balance, index) => <WalletRow key={index} ... />)

// ✅ After
rows.map((balance) => <WalletRow key={balance.currency} ... />)
```

---

### 20. `balance.formatted` Access on `WalletBalance` Type

| | |
|---|---|
| **Problem** | `rows` maps over `sortedBalances` typed as `WalletBalance[]`, but accesses `balance.formatted` which doesn't exist on that type |
| **Fix** | Type `sortedBalances` as `FormattedWalletBalance[]` and merge formatting into the memo pipeline (see Fix 15) |

---

### 21. Spreading Unknown Props onto Native `<div>`

| | |
|---|---|
| **Problem** | `<div {...rest}>` spreads all `BoxProps` onto a native DOM element — MUI's `BoxProps` includes non-HTML attributes (e.g. `sx`, `component`) that cause React warnings or runtime errors |
| **Fix** | Replace `<div>` with MUI's `<Box>` which handles prop forwarding correctly |

```tsx
// ❌ Before
return <div {...rest}>{rows}</div>;

// ✅ After
return <Box {...rest}>{rows}</Box>;
```

---

### 22. No Default Export

| | |
|---|---|
| **Problem** | The component is defined but not exported — any module importing it would silently receive `undefined` |
| **Fix** | Add `export default WalletPage` |

---

## Summary Table

| # | Category | Severity |
|---|---|---|
| 1 | Interface design (DRY) | Low |
| 2, 3, 6, 7, 10, 17 | Missing imports | High |
| 4a, 4b | Unnecessary Props interface | Low |
| 5 | Unused variable | Low |
| 8 | `any` type | Medium |
| 9 | Switch anti-pattern | Medium |
| 11 | Missing interface field | High |
| 12a | Undefined variable (runtime error) | **Critical** |
| 12b | Wrong filter logic (wrong data shown) | **Critical** |
| 13 | Comparator missing `0` case + perf | Medium |
| 14 | Wrong `useMemo` dependencies | Medium |
| 15 | Dead code | Low |
| 16 | Wrong `toFixed()` precision | Medium |
| 18 | `classes` undefined (runtime error) | **Critical** |
| 19 | Index as React key | Medium |
| 20 | Type mismatch | High |
| 21 | Non-DOM props on `<div>` | Medium |
| 22 | No default export | High |
