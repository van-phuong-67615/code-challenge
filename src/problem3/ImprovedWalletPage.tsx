//This is improved code

import Box, { BoxProps } from "@mui/material/Box"; //Fix 2. Missing import BoxProps and Fix 21. Spreading rest BoxProps into a native <div>
import { useWalletBalances } from "./useWalletBalances"; //Fix 6. Missing import useWalletBalances
import { usePrices } from "./usePrices"; //Fix 7. Missing import usePrices
import React, { useMemo } from "react"; //Fix 3. Missing import React and Fix 10. Missing import useMemo
import { WalletRow } from "./WalletRow"; //Fix 17. Missing import WalletRow

//Fix 18. classes is not defined
import { makeStyles } from "@mui/material/styles";
//for example styles
const useStyles = makeStyles({
  row: {
    padding: "8px 16px",
    borderBottom: "1px solid #eee",
  },
});

//Fix 9. Don't use switch case to get priority and avoid recreating objects on every render.
// Solution: use map instead and define priority map outside the component
const PRIORITY_MAP = {
  Osmosis: 100,
  Ethereum: 50,
  Arbitrum: 30,
  Zilliqa: 20,
  Neo: 20,
};

// Fix 8. Shouldn't use `type any` in TypeScript because it doesn't guarantee type safety. - Solution: Use type string
/* Fix 9. Don't use switch case to get priority
    - It's difficult to scale
    - It's difficult to maintain
    - It's difficult to read
    - It's difficult to test
    Solution: Use map instead and define priority map outside the component because getPriority is just a map and 1 condition
  */
const getPriority = (blockchain: string): number => {
  return PRIORITY_MAP[blockchain as keyof typeof PRIORITY_MAP] ?? -99;
};

interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: string; //Fix 11. Property 'blockchain' does not exist on type 'WalletBalance'
}

//Fix 1. anti-pattern: use extends to redeclare WalletBalance interface
// Solution: Extend WalletBalance to avoid redeclaring currency, amount
interface FormattedWalletBalance extends WalletBalance {
  formatted: string;
}

/*Fix 4a. Nothing to extends at Props should use BoxProps directly
  Solution: Use BoxProps directly instead of creating a new interface
*/

// Fix 4b. React.FC<Props> already define props type, so we can use only props directly
// Solution: Use (props) => instead of (props: BoxProps) =>
const WalletPage: React.FC<BoxProps> = (props) => {
  // Fix 5. Children is declared but never used but still use to spread props to Fix 21. Spreading rest BoxProps into a native <div>
  // Solution: Use children: _children to Spreading rest and avoid error declared but never used
  const { children: _children, ...rest } = props;
  const balances = useWalletBalances();
  const prices = usePrices();
  const classes = useStyles();

  const sortedBalances = useMemo<FormattedWalletBalance[]>(() => {
    const sortedBalances = balances
      .filter((balance: WalletBalance) => {
        const balancePriority = getPriority(balance.blockchain);
        //Fix 12a. Missing import or define lhsPriority or it's balancePriority miss spelling and nested if
        // Solution: Use balancePriority instead of lhsPriority and remove nested if
        //Fix 12b. This condition should check balance.amount > 0 in a list of wallet
        // Solution: Change balance.amount <= 0 to balance.amount > 0
        return balancePriority > -99 && balance.amount > 0;
      })
      /*Fix 13. - anti-pattern missing 0 case in compare function
            - Code verbose difficult to read
            - Calling the getPriority function twice in each loop increases the complexity.
            Solution: Use getPriority() and subtraction to compare sort
        */
      .sort(
        (lhs: WalletBalance, rhs: WalletBalance) =>
          getPriority(rhs.blockchain) - getPriority(lhs.blockchain),
      );

    //Fix 15. formattedBalances declare but never used and Fix 20. Property 'formatted' does not exist on type 'WalletBalance'
    // Solution: Add formatted property to Balances list inside useMemo
    return sortedBalances.map((balance: WalletBalance) => ({
      ...balance,
      //Fix 16. Missing digits param in toFixed, because it should return floating point number for amount
      // Solution: Add digits param to toFixed
      formatted: balance.amount.toFixed(6),
    }));

    //Fix 14. Redundant dependency prices
    // Solution: Remove prices from dependency array
  }, [balances]);
  //Note: getPriority is pure function at module level → not a dependency of useMemo

  const rows = sortedBalances.map((balance: FormattedWalletBalance) => {
    const usdValue = prices[balance.currency] * balance.amount;

    return (
      <WalletRow
        className={classes.row}
        /* Fix 19.
            - Do not use index as key, because React use diffing algorithm to update DOM between two renders
            - Will wrong render if insert, delete, or reorder the list
            - Will wrong render if the list is sorted
            - Lower performance than using a unique identifier key
            Solution: Use balance.currency as key remove index
          */
        key={balance.currency}
        amount={balance.amount}
        usdValue={usdValue}
        formattedAmount={balance.formatted}
      />
    );
  });

  return (
    /*Fix 21. Spreading rest BoxProps into a native <div> can be unsafe if BoxProps is not derived from valid HTML attributes
        - Anti-pattern: Passing non-DOM props down to native elements
        Solution: Use <Box> from MUI instead of native <div>
    */
    <Box {...rest}>{rows}</Box>
  );
};

//Fix 22. Module has no default export
// Solution: Use named export  export const WalletPage: React.FC<BoxProps> = (props) =>
// or use default export right there
export default WalletPage;
