// @ts-nocheck
// NOTE: @ts-nocheck is used here because this is a standalone challenge file.
// The hooks (useWalletBalances, usePrices) and components (WalletRow) referenced
// below are assumed to exist in a real application context.

import Box, { BoxProps } from "@mui/material/Box";
import { makeStyles } from "@mui/material/styles";
import React, { useMemo } from "react";
import { usePrices } from "./usePrices";
import { useWalletBalances } from "./useWalletBalances";
import { WalletRow } from "./WalletRow";

// ─── Styles ────────────────────────────────────────────────────────────────────
const useStyles = makeStyles({
  row: {
    padding: "8px 16px",
    borderBottom: "1px solid #eee",
  },
});

// ─── Types ─────────────────────────────────────────────────────────────────────
interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: string;
}

interface FormattedWalletBalance extends WalletBalance {
  formatted: string;
}

// ─── Priority Map (module-level constant, not recreated on every render) ───────
const PRIORITY_MAP: Record<string, number> = {
  Osmosis: 100,
  Ethereum: 50,
  Arbitrum: 30,
  Zilliqa: 20,
  Neo: 20,
};

const getPriority = (blockchain: string): number =>
  PRIORITY_MAP[blockchain] ?? -99;

// ─── Component ─────────────────────────────────────────────────────────────────
const WalletPage: React.FC<BoxProps> = (props) => {
  const { children: _children, ...rest } = props;
  const balances = useWalletBalances();
  const prices = usePrices();
  const classes = useStyles();

  const sortedBalances = useMemo<FormattedWalletBalance[]>(() => {
    return balances
      .filter(
        (balance: WalletBalance) =>
          getPriority(balance.blockchain) > -99 && balance.amount > 0,
      )
      .sort(
        (lhs: WalletBalance, rhs: WalletBalance) =>
          getPriority(rhs.blockchain) - getPriority(lhs.blockchain),
      )
      .map((balance: WalletBalance) => ({
        ...balance,
        formatted: balance.amount.toFixed(6),
      }));
  }, [balances]); // prices removed — not used in this computation

  const rows = sortedBalances.map((balance: FormattedWalletBalance) => (
    <WalletRow
      key={balance.currency}
      className={classes.row}
      amount={balance.amount}
      usdValue={prices[balance.currency] * balance.amount}
      formattedAmount={balance.formatted}
    />
  ));

  return <Box {...rest}>{rows}</Box>;
};

export default WalletPage;
