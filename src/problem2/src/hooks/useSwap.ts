import { calcExchangeRate } from "@/components/swap/mixin";
import type { IToken } from "@/types";
import { useState } from "react";

/** Trim trailing zeros: "1647.0000000000" → "1647", "1.5000" → "1.5" */
const formatAmount = (value: number): string =>
  String(parseFloat(value.toFixed(10)));

export default function useSwap(sellToken?: IToken, buyToken?: IToken) {
  const [sellAmount, setSellAmount] = useState("0");
  const [buyAmount, setBuyAmount] = useState("0");
  const [focusInput, setFocusInput] = useState<"sell" | "buy">("sell");
  const [swapState, setSwapState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  

  
  const handleSellAmountChange = (amount: string, overrideSellToken?: IToken, overrideBuyToken?: IToken) => {
    const _sell = overrideSellToken ?? sellToken;
    const _buy  = overrideBuyToken  ?? buyToken;
    setSellAmount(amount);
    if (!amount || !_sell || !_buy) {
      setBuyAmount("0");
      return;
    }
    const exchangeRate = Number(calcExchangeRate(_sell, _buy));
    setBuyAmount(formatAmount(Number(amount) * exchangeRate));
  };

  const handleBuyAmountChange = (amount: string, overrideSellToken?: IToken, overrideBuyToken?: IToken) => {
    const _sell = overrideSellToken ?? sellToken;
    const _buy  = overrideBuyToken  ?? buyToken;
    setBuyAmount(amount);
    if (!amount || !_sell || !_buy) {
      setSellAmount("0");
      return;
    }
    const exchangeRate = Number(calcExchangeRate(_buy, _sell));
    setSellAmount(formatAmount(Number(amount) * exchangeRate));
  };

  const switchFocus = () => {
    setFocusInput(focusInput === "sell" ? "buy" : "sell");
  }

  const switchDirection = () => {
    setSellAmount(buyAmount);
    setBuyAmount(sellAmount);
    switchFocus();
  }

  const handleSwap = async () => {
    const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

    setSwapState('loading');
    await delay(1500);

    setSwapState('success');
    await delay(1500);

    setSellAmount("0");
    setBuyAmount("0");
    setSwapState('idle');
  };

  return {
    sellAmount: sellAmount,
    buyAmount: buyAmount,
    focusInput,
    swapState,
    handleSellAmountChange,
    handleBuyAmountChange,
    switchDirection,
    switchFocus,
    handleSwap,
  };
}