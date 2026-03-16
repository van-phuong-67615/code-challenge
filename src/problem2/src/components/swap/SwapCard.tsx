import React, { useMemo, useState } from "react";
import SwapInput from "./SwapInput";
import SwapButton from "./SwapButton";
import { Button } from "@/components/ui/button";
import useTokens from "@/hooks/useTokens";
import FetchErrorBanner from "../FetchErrorBanner";
import { calcExchangeRate } from "./mixin";

const SwapCard: React.FC = () => {
  const [sellAmount, setSellAmount] = useState("");
  const [buyAmount, setBuyAmount] = useState("");
  const { tokens, loading, error } = useTokens();
  const [sellToken, setSellToken] = useState<string | undefined>("ETH");
  const [buyToken, setBuyToken] = useState<string | undefined>(undefined);

  const exchangeRate = useMemo(() => {
    if (
      !tokens ||
      !sellToken ||
      !buyToken ||
      !tokens[sellToken] ||
      !tokens[buyToken]
    )
      return "";
    return `1 ${sellToken} = ${calcExchangeRate(tokens[sellToken], tokens[buyToken])} ${buyToken}`;
  }, [tokens, sellToken, buyToken]);

  return (
    <div
      className="swap-card-glow w-full p-4 rounded-3xl flex flex-col gap-0.5"
      style={{
        maxWidth: 520,
        background: "#161b26",
      }}
      role="main"
      aria-label="Currency swap form"
    >
      {/* ── Error banner ── */}
      {error && <FetchErrorBanner error={error} />}

      <SwapInput
        label="Sell"
        value={sellAmount}
        onChange={setSellAmount}
        fiatValue="$0.00"
        variant={"neutral"}
        loading={loading}
        disabled={loading}
        tokenSelectorProps={{
          value: sellToken ?? "",
          options: tokens,
          onChange: setSellToken,
          "aria-label": "Select token to sell",
        }}
      />

      {/* Swap direction button */}
      <SwapButton disabled={loading} />

      {/* Buy section */}
      <SwapInput
        label="Buy"
        value={buyAmount}
        onChange={setBuyAmount}
        fiatValue="$0.00"
        exchangeRate={exchangeRate}
        variant={"neutral"}
        loading={loading}
        disabled={loading}
        tokenSelectorProps={{
          value: buyToken ?? "",
          options: tokens,
          onChange: setBuyToken,
          "aria-label": "Select token to buy",
        }}
      />

      {/* Get started button */}
      <Button
        type="button"
        variant="default"
        className="get-started-btn w-full py-3.5 rounded-full text-white font-semibold text-base border-0 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#161b26] mt-1 h-auto"
        disabled={loading}
        aria-label="Get started with swap"
        aria-disabled={loading}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg
              className="animate-spin"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              aria-hidden="true"
            >
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
            </svg>
            Loading…
          </span>
        ) : (
          "Get started"
        )}
      </Button>
    </div>
  );
};

export default SwapCard;
