import React, { useEffect, useMemo, useRef, useState } from "react";
import SwapInput from "./SwapInput";
import SwapButton from "./SwapButton";
import { Button } from "@/components/ui/button";
import useTokens from "@/hooks/useTokens";
import FetchErrorBanner from "../FetchErrorBanner";
import { calcExchangeRate } from "./mixin";
import useSwap from "@/hooks/useSwap";
import type { IToken } from "@/types";
import { formatCompactPrice } from "@/lib/utils";
import { Spinner } from "../ui/spinner";
import SwapSuccessBanner from "../SwapSuccessBanner";

/** Duration must match `.banner-leave` animation in index.css (200ms) */
const BANNER_LEAVE_MS = 200;

function useDelayedBanner<T>(value: T | null | undefined): {
  rendered: T | null;
  leaving: boolean;
} {
  const [rendered, setRendered] = useState<T | null>(value ?? null);
  const [leaving, setLeaving] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (value) {
      // New value → cancel any pending removal, show immediately
      if (timerRef.current) clearTimeout(timerRef.current);
      setLeaving(false);
      setRendered(value);
    } else if (rendered) {
      // Value gone → play fade-out, then unmount
      setLeaving(true);
      timerRef.current = setTimeout(() => {
        setRendered(null);
        setLeaving(false);
      }, BANNER_LEAVE_MS);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return { rendered, leaving };
}

const SwapCard: React.FC = () => {
  const { tokens, loading, error } = useTokens();
  const [sellToken, setSellToken] = useState<IToken | undefined>(undefined);
  const [buyToken, setBuyToken] = useState<IToken | undefined>(undefined);
  const initialized = useRef(false);
  const {
    sellAmount,
    buyAmount,
    focusInput,
    swapState,
    handleSellAmountChange,
    handleBuyAmountChange,
    switchDirection,
    switchFocus,
    handleSwap,
  } = useSwap(sellToken, buyToken);

  const isSuccess = swapState === "success";

  const { rendered: renderedError, leaving: errorLeaving } =
    useDelayedBanner(error);
  const { rendered: renderedSuccess, leaving: successLeaving } =
    useDelayedBanner(isSuccess ? true : null);

  const exchangeRate = useMemo(() => {
    if (!tokens || !sellToken || !buyToken) return "";
    return `1 ${sellToken.currency} = ${calcExchangeRate(sellToken, buyToken)} ${buyToken.currency}`;
  }, [tokens, sellToken, buyToken]);

  const [isDisabled, btnText] = useMemo<[boolean, React.ReactNode]>(() => {
    let isDisabled = false;
    let btnText: React.ReactNode = "Swap";
    if (loading || swapState === "loading") {
      isDisabled = true;
      btnText = (
        <span className="flex items-center justify-center gap-2">
          <Spinner />
          Loading...
        </span>
      );
    }
    if (sellAmount === "0" || buyAmount === "0") {
      isDisabled = true;
      btnText = "Please enter an amount";
    }
    if (!sellToken || !buyToken) {
      isDisabled = true;
      btnText = "Please select tokens";
    }
    if (swapState === "success") {
      isDisabled = true;
      btnText = "Swap successful";
    }
    return [isDisabled, btnText];
  }, [loading, swapState, sellAmount, buyAmount, sellToken, buyToken]);

  const handleSwitchDirection = () => {
    setSellToken(buyToken);
    setBuyToken(sellToken);
    switchDirection();
  };
  
  useEffect(() => {
    if (!initialized.current && tokens?.USD) {
      initialized.current = true;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSellToken(tokens.USD);
    }
  }, [tokens]);

  /**
   * Factory: returns a token-select handler for one side.
   * `oppToken` = the other side's current token
   * `setMyToken` = state setter for this side
   * `onFocused(token)` = recalc when THIS side is focused (reset my amount)
   * `onNotFocused(token)` = recalc when OTHER side is focused (keep opp amount)
   */
  const makeSelectHandler =
    (
      side: "sell" | "buy",
      oppToken: IToken | undefined,
      setMyToken: (t: IToken) => void,
      onFocused: (token: IToken) => void,
      onNotFocused: (token: IToken) => void,
    ) =>
    (token: IToken) => {
      if (token.currency === oppToken?.currency) {
        handleSwitchDirection();
        return;
      }
      if (focusInput === side) {
        onFocused(token);
      } else {
        onNotFocused(token);
      }
      setMyToken(token);
    };

  const handleSelectSellToken = makeSelectHandler(
    "sell",
    buyToken,
    setSellToken,
    (token) => handleSellAmountChange("0", token, buyToken),
    (token) => {
      if (Number(buyAmount) > 0)
        handleBuyAmountChange(buyAmount, token, buyToken);
    },
  );

  const handleSelectBuyToken = makeSelectHandler(
    "buy",
    sellToken,
    setBuyToken,
    (token) => handleBuyAmountChange("0", sellToken, token),
    (token) => {
      if (Number(sellAmount) > 0)
        handleSellAmountChange(sellAmount, sellToken, token);
    },
  );



  return (
    <div
      className="swap-card-glow w-full p-4 rounded-3xl flex flex-col gap-0.5"
      style={{
        maxWidth: 520,
        background: "#161b26",
      }}
      role="main"
      aria-label="Currency swap form"
      data-testid="swap-card"
    >
      {/* ── Error banner ── */}
      {renderedError && (
        <FetchErrorBanner error={renderedError} leaving={errorLeaving} />
      )}

      {/* ── Success banner ── */}
      {renderedSuccess && <SwapSuccessBanner leaving={successLeaving} />}

      <SwapInput
        label="Sell"
        isFocus={focusInput === "sell"}
        value={sellAmount}
        onChange={handleSellAmountChange}
        switchFocus={switchFocus}
        fiatValue={formatCompactPrice(
          parseFloat(sellAmount || "0") * (sellToken?.price || 0),
        )}
        variant={"neutral"}
        loading={loading}
        disabled={loading || swapState === "loading"}
        tokenSelectorProps={{
          value: sellToken,
          options: tokens,
          onChange: handleSelectSellToken,
          "aria-label": "Select token to sell",
        }}
      />

      {/* Swap direction button */}
      <SwapButton
        disabled={loading || swapState === "loading"}
        onClick={handleSwitchDirection}
        data-testid="switch-direction-btn"
      />

      {/* Buy section */}
      <SwapInput
        label="Buy"
        isFocus={focusInput === "buy"}
        value={buyAmount}
        onChange={handleBuyAmountChange}
        switchFocus={switchFocus}
        fiatValue={formatCompactPrice(
          parseFloat(buyAmount || "0") * (buyToken?.price || 0),
        )}
        exchangeRate={exchangeRate}
        variant={"neutral"}
        loading={loading}
        disabled={loading || swapState === "loading"}
        tokenSelectorProps={{
          value: buyToken,
          options: tokens,
          onChange: handleSelectBuyToken,
          "aria-label": "Select token to buy",
        }}
      />

      {/* Get started button */}
      <Button
        type="button"
        variant="default"
        className="get-started-btn w-full py-3.5 rounded-full text-white font-semibold text-base border-0 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#161b26] mt-4 h-auto"
        disabled={isDisabled}
        aria-label="Get started with swap"
        aria-disabled={isDisabled}
        onClick={handleSwap}
        data-testid="swap-submit-btn"
      >
        {btnText}
      </Button>
    </div>
  );
};

export default SwapCard;
