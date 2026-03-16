import React, { useState } from "react";
import SwapInput from "./SwapInput";
import SwapButton from "./SwapButton";
import { Button } from "@/components/ui/button";
import useTokens from "@/hooks/useTokens";

// Example placeholder options — consumer will replace with real token list
const PLACEHOLDER_TOKENS = ["ETH", "USDT", "BTC", "USDC", "BNB", "SOL"];

type UIState = "idle" | "loading" | "error" | "disabled";

const SwapCard: React.FC = () => {
  const [sellAmount, setSellAmount] = useState("");
  const [buyAmount, setBuyAmount] = useState("");
  const [sellToken, setSellToken] = useState("ETH");
  const [buyToken, setBuyToken] = useState("USDT");
  const [uiState, setUiState] = useState<UIState>("idle");
  const { tokens, loading, error } = useTokens();
  console.log("🚀 ~ SwapCard ~ tokens:", tokens)

  // UI state helpers — for demonstration / dev purposes
  const isError = uiState === "error";
  const isDisabled = uiState === "disabled";
  const inputVariant = isError ? "error" : "neutral";

  return (
    <div
      className="swap-card-glow w-full p-4 rounded-3xl flex flex-col gap-0.5"
      style={{
        maxWidth: 420,
        background: "#161b26",
      }}
      role="main"
      aria-label="Currency swap form"
    >
      {/* Sell section */}
      <SwapInput
        label="Sell"
        value={sellAmount}
        onChange={setSellAmount}
        fiatValue="$0.00"
        variant={inputVariant}
        loading={loading}
        disabled={isDisabled}
        tokenSelectorProps={{
          value: sellToken,
          options: tokens,
          onChange: setSellToken,
          "aria-label": "Select token to sell",
        }}
      />

      {/* Swap direction button */}
      <SwapButton disabled={isDisabled || loading} />

      {/* Buy section */}
      <SwapInput
        label="Buy"
        value={buyAmount}
        onChange={setBuyAmount}
        fiatValue="$0.00"
        exchangeRate={`1 ${sellToken} = 0.00 ${buyToken}`}
        variant={inputVariant}
        loading={loading}
        disabled={isDisabled}
        tokenSelectorProps={{
          value: buyToken,
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
        disabled={isDisabled || loading}
        aria-label="Get started with swap"
        aria-disabled={isDisabled || loading}
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
