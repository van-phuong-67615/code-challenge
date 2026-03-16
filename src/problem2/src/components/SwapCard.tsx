import React, { useState } from "react";
import SwapInput from "./SwapInput";
import SwapButton from "./SwapButton";

// Example placeholder options — consumer will replace with real token list
const PLACEHOLDER_TOKENS = ["ETH", "USDT", "BTC", "USDC", "BNB", "SOL"];

type UIState = "idle" | "loading" | "error" | "disabled";

const SwapCard: React.FC = () => {
  const [sellAmount, setSellAmount] = useState("");
  const [buyAmount, setBuyAmount] = useState("");
  const [sellToken, setSellToken] = useState("ETH");
  const [buyToken, setBuyToken] = useState("USDT");
  const [uiState, setUiState] = useState<UIState>("idle");

  // UI state helpers — for demonstration / dev purposes
  const isLoading = uiState === "loading";
  const isError = uiState === "error";
  const isDisabled = uiState === "disabled";
  const inputVariant = isError ? "error" : "neutral";

  // Dev preview controls (remove in production)
  const cycleState = () => {
    const states: UIState[] = ["idle", "loading", "error", "disabled"];
    const idx = states.indexOf(uiState);
    setUiState(states[(idx + 1) % states.length]);
  };

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
        loading={isLoading}
        disabled={isDisabled}
        tokenSelectorProps={{
          value: sellToken,
          options: PLACEHOLDER_TOKENS,
          onChange: setSellToken,
          "aria-label": "Select token to sell",
        }}
      />

      {/* Swap direction button */}
      <SwapButton disabled={isDisabled || isLoading} />

      {/* Buy section */}
      <SwapInput
        label="Buy"
        value={buyAmount}
        onChange={setBuyAmount}
        fiatValue="$0.00"
        exchangeRate={`1 ${sellToken} = 0.00 ${buyToken}`}
        variant={inputVariant}
        loading={isLoading}
        disabled={isDisabled}
        tokenSelectorProps={{
          value: buyToken,
          options: PLACEHOLDER_TOKENS,
          onChange: setBuyToken,
          "aria-label": "Select token to buy",
        }}
      />

      {/* Estimated fee row */}
      <div
        className="flex items-center px-1 pt-2 pb-1"
        style={{ color: "#6b7280", fontSize: 13 }}
      >
        <span>Estimated Fee: </span>
        {isLoading ? (
          <span
            className="inline-block ml-2 h-3.5 w-12 rounded animate-pulse"
            style={{ background: "rgba(255,255,255,0.08)" }}
          />
        ) : (
          <span className="ml-1">&lt;$5.00</span>
        )}
      </div>

      {/* Get started button */}
      <button
        type="button"
        className="get-started-btn w-full py-3.5 rounded-full text-white font-semibold text-base border-0 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#161b26] mt-1"
        disabled={isDisabled || isLoading}
        aria-label="Get started with swap"
        aria-disabled={isDisabled || isLoading}
      >
        {isLoading ? (
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
      </button>

      {/* Dev state toggle — remove / replace in production */}
      <button
        type="button"
        onClick={cycleState}
        className="mt-2 text-xs rounded-full px-3 py-1 border-0 cursor-pointer"
        style={{
          background: "rgba(255,255,255,0.05)",
          color: "#6b7280",
        }}
        aria-label="Cycle UI state for development preview"
      >
        Dev: state = {uiState}
      </button>
    </div>
  );
};

export default SwapCard;
