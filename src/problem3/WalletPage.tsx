// @ts-nocheck
//This file will list out the computational inefficiencies and anti-patterns found
interface WalletBalance {
  currency: string;
  amount: number;
}
//1. anti-pattern: use extends to redeclare WalletBalance interface
interface FormattedWalletBalance {
  currency: string;
  amount: number;
  formatted: string;
}

//2. Missing import BoxProps

interface Props extends BoxProps {}
//3. Missing import React
//4. a. Nothing to extends at Props should use props: BoxProps directly
//4. b. React.FC<Props> already define props type, so we can use only props directly (props) => {
const WalletPage: React.FC<Props> = (props: Props) => {
  //5. Children is declared but never used
  const { children, ...rest } = props;
  //6. Missing import useWalletBalances
  const balances = useWalletBalances();
  //7. Missing import usePrices
  const prices = usePrices();

  //8. Shouldn't use `type any` in TypeScript because it doesn't guarantee type safety.
  /*9. Don't use switch case to get priority
      - It's difficult to scale
      - It's difficult to maintain
      - It's difficult to read
      - It's difficult to test
    */
  const getPriority = (blockchain: any): number => {
    switch (blockchain) {
      case "Osmosis":
        return 100;
      case "Ethereum":
        return 50;
      case "Arbitrum":
        return 30;
      case "Zilliqa":
        return 20;
      case "Neo":
        return 20;
      default:
        return -99;
    }
  };

  //10. Missing import useMemo
  const sortedBalances = useMemo(() => {
    return balances
      .filter((balance: WalletBalance) => {
        //11. Property 'blockchain' does not exist on type 'WalletBalance' and balancePriority declare but never used
        const balancePriority = getPriority(balance.blockchain);
        //12. a. Missing import or define lhsPriority or it's balancePriority miss spelling and nested if
        if (lhsPriority > -99) {
          //12. b. This condition should check balance.amount > 0 in a list of wallet
          if (balance.amount <= 0) {
            return true;
          }
        }
        return false;
      })
      .sort((lhs: WalletBalance, rhs: WalletBalance) => {
        /*13. - anti-pattern missing 0 case in compare function
                - Code verbose difficult to read
                - Calling the getPriority function twice in each loop increases the complexity.
            */
        const leftPriority = getPriority(lhs.blockchain);
        const rightPriority = getPriority(rhs.blockchain);
        if (leftPriority > rightPriority) {
          return -1;
        } else if (rightPriority > leftPriority) {
          return 1;
        }
      });
    //14. Redundant dependency prices
  }, [balances, prices]);

  //15. formattedBalances declare but never used
  const formattedBalances = sortedBalances.map((balance: WalletBalance) => {
    return {
      ...balance,
      //16. Missing digits param in toFixed, because it should return floating point number for amount
      formatted: balance.amount.toFixed(),
    };
  });

  const rows = sortedBalances.map(
    (balance: FormattedWalletBalance, index: number) => {
      const usdValue = prices[balance.currency] * balance.amount;
      //17. Missing import WalletRow
      return (
        <WalletRow
          //18. classes is not defined
          className={classes.row}
          /*
            19. Do not use index as key, because React use diffing algorithm to update DOM between two renders
            - Will wrong render if insert, delete, or reorder the list
            - Will wrong render if the list is sorted
            - Lower performance than using a unique identifier key
        */
          key={index}
          amount={balance.amount}
          usdValue={usdValue}
          //20. Property 'formatted' does not exist on type 'WalletBalance'
          formattedAmount={balance.formatted}
        />
      );
    },
  );

  return (
    /*21. Spreading rest BoxProps into a native <div> can be unsafe if Props is not derived from valid HTML attributes
        - Anti-pattern: Passing non-DOM props down to native elements
    */
    <div {...rest}>{rows}</div>
  );
};

//22. Module has no default export. Will not error when compiling but will error when calling this component
