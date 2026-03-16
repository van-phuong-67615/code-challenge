import type { IToken } from "@/types";

export const calcExchangeRate = (sellToken: IToken, buyToken: IToken) => {
  const sellPrice = sellToken.price;
  const buyPrice = buyToken.price;
  return (sellPrice / buyPrice).toFixed(10);
};
