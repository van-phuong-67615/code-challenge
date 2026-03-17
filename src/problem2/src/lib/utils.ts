import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatPrice = (price: number) => {
  return price.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 4 })
}

const COMPACT_TIERS = [
  { threshold: 1e12, suffix: 'T' },
  { threshold: 1e9,  suffix: 'B' },
  { threshold: 1e6,  suffix: 'M' },
  { threshold: 1e3,  suffix: 'K' },
] as const;

/** Format a USD fiat value with compact suffix (K / M / B / T) for large amounts. */
export const formatCompactPrice = (amount: number): string => {
  if (!isFinite(amount) || isNaN(amount)) return '$0.00';
  const abs = Math.abs(amount);
  for (const { threshold, suffix } of COMPACT_TIERS) {
    if (abs >= threshold) {
      const compact = (amount / threshold).toFixed(2).replace(/\.00$/, '');
      return `$${compact}${suffix}`;
    }
  }
  return amount.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

/**
 * Normalizes a token symbol to match the casing used by Switcheo's token-icons repo.
 *
 * The API returns some protocol-prefixed tokens in ALL_CAPS (e.g. "STOSMO", "RATOM"),
 * but the GitHub repo uses a lowercase prefix ("stOSMO", "rATOM").
 *
 * Rule (no hardcoding):
 *   If the symbol is ALL-UPPERCASE and starts with a known protocol prefix,
 *   lowercase that prefix and keep the rest as-is.
 *
 * Mixed-case tokens from the API (e.g. "bNEO", "rSWTH", "wstETH") are returned
 * unchanged because they are not ALL-UPPERCASE.
 */
const ICON_PREFIXES = ['ST', 'R'] as const;

export function normalizeSymbolForIcon(symbol: string): string {
  // Only transform tokens that are fully uppercase
  if (symbol !== symbol.toUpperCase()) return symbol;

  for (const prefix of ICON_PREFIXES) {
    if (symbol.startsWith(prefix) && symbol.length > prefix.length) {
      return prefix.toLowerCase() + symbol.slice(prefix.length);
    }
  }

  return symbol;
}