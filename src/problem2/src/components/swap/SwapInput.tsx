import React, { useEffect, useId, useRef } from "react";
import TokenSelector, { type TokenSelectorHandle, type TokenSelectorProps } from "../TokenSelector";
import { cn } from "@/lib/utils";

export type SwapInputVariant = "neutral" | "error" | "loading";

export interface SwapInputProps {
  /** Section label shown above the amount */
  label: "Sell" | "Buy";
  /** Controlled numeric value string */
  value: string;
  onChange: (v: string) => void;
  switchFocus: () => void;
  /** Fiat equivalent display string (e.g. "$2,940.25") */
  fiatValue?: string;
  /** Exchange rate string shown in Buy section (e.g. "1 ETH = 2,450.21 USDT") */
  exchangeRate?: string;
  tokenSelectorProps: TokenSelectorProps;
  variant?: SwapInputVariant;
  loading?: boolean;
  disabled?: boolean;
  isFocus?: boolean;
}

const variantBorderMap: Record<SwapInputVariant, string> = {
  neutral: "border-[#374151]",
  error: "border-red-500",
  loading: "border-transparent",
};

const SwapInput: React.FC<SwapInputProps> = ({
  label,
  value,
  onChange,
  switchFocus,
  fiatValue = "$0.00",
  exchangeRate,
  tokenSelectorProps,
  variant = "neutral",
  loading = false,
  disabled = false,
  isFocus = false,
}) => {
  
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const selectorRef = useRef<TokenSelectorHandle>(null);
  const isSell = label === "Sell";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Chỉ cho phép chữ số và dấu chấm, loại bỏ mọi ký tự khác
    const raw = e.target.value.replace(/[^0-9.]/g, "");
    const stripped = raw.replace(/^0+(\d)/, '$1'); // "019999" → "19999"
    onChange(stripped);
  };
  const handleWrapperClick = () => {
    if (!disabled && !loading) {
      if(!tokenSelectorProps.value){
        selectorRef.current?.setOpen(true);
        return;
      }
      inputRef.current?.focus();
      if (!isFocus) {
        switchFocus();
      }
    }
  };

  useEffect(() => {
    if (isFocus && !loading && !disabled) {
      inputRef.current?.focus();
    }
  }, [isFocus, loading, disabled]);

  return (
    <div
      className={cn(
        "swap-section rounded-2xl px-5 py-6 border transition-all duration-150 cursor-pointer",
        variantBorderMap[variant],
        disabled ? "opacity-60" : "",
        isFocus ?"bg-[#111318]" : "bg-[#374151]",
      )}
      onClick={handleWrapperClick}
      role="group"
      aria-label={`${label} section`}
    >
      {/* Top row: label + exchange rate */}
      <div className="flex items-center justify-between mb-1">
        <label
          htmlFor={inputId}
          className="text-sm font-medium"
          style={{ color: "#9ca3af" }}
        >
          {label}
        </label>
        {!isSell && exchangeRate && (
          <span
            className="text-xs"
            style={{ color: "#9ca3af" }}
            aria-label="Exchange rate"
          >
            {exchangeRate}
          </span>
        )}
      </div>

      {/* Main row: amount input + token selector */}
      <div className="flex items-center gap-3">
        {loading ? (
          /* Loading skeleton */
          <div
            className="flex-1 h-10 rounded-lg animate-pulse"
            style={{ background: "rgba(255,255,255,0.08)" }}
            aria-busy="true"
            aria-label="Loading amount"
          />
        ) : (
          <input
            ref={inputRef}
            id={inputId}
            type="text"
            inputMode="decimal"
            placeholder="0"
            value={value}
            onChange={handleChange}
            disabled={disabled}
            aria-label={`${label} amount`}
            aria-invalid={variant === "error"}
            className={cn(
              "flex-1 bg-transparent outline-none border-none text-white font-semibold min-w-0",
              "placeholder:text-gray-600 focus:placeholder:text-gray-700",
              "text-[28px] leading-none",
              variant === "error" ? "text-red-400" : ""
            )}
            style={{ fontVariantNumeric: "tabular-nums" }}
          />
        )}

        <TokenSelector {...tokenSelectorProps} ref={selectorRef} disabled={disabled || loading} />
      </div>

      {/* Fiat row */}
      <div className="mt-1.5">
        {loading ? (
          <div
            className="h-4 w-20 rounded animate-pulse"
            style={{ background: "rgba(255,255,255,0.06)" }}
          />
        ) : (
          <span
            className={["text-sm", variant === "error" ? "text-red-400" : ""]
              .filter(Boolean)
              .join(" ")}
            style={{ color: variant === "error" ? undefined : "#6b7280" }}
          >
            {variant === "error" ? "Invalid amount" : fiatValue}
          </span>
        )}
      </div>
    </div>
  );
};

export default SwapInput;
