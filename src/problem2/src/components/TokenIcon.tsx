import React, { useState } from "react";
import { cn, normalizeSymbolForIcon } from "../lib/utils";

interface TokenIconProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  symbol: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
}

const sizes = {
  xs: "w-4 h-4 text-xs",
  sm: "w-5 h-5 text-sm",
  md: "w-6 h-6 text-md",
  lg: "w-8 h-8 text-lg",
  xl: "w-10 h-10 text-xl",
};

// Token icon placeholder circle
const TokenIconPlaceholder = ({ symbol, size = "sm" }: TokenIconProps) => (
  <span
    className={cn(
      sizes[size],
      "rounded-full bg-gradient-to-br from-indigo-600 to-violet-700 text-white font-bold select-none shrink-0 inline-flex items-center justify-center",
    )}
    aria-hidden="true"
  >
    {symbol.slice(0, 2) || "??"}
  </span>
);

const BASE_URL =
  "https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens";

const TokenIcon = ({ symbol, size = "sm", ...props }: TokenIconProps) => {
  const normalized = normalizeSymbolForIcon(symbol);

  const [prevSymbol, setPrevSymbol] = useState(symbol);
  const [error, setError] = useState(false);

  if (prevSymbol !== symbol) {
    setPrevSymbol(symbol);
    setError(false);
  }

  if (error) {
    return <TokenIconPlaceholder symbol={symbol} size={size} />;
  }

  return (
    <img
      {...props}
      onError={() => setError(true)}
      src={`${BASE_URL}/${normalized}.svg`}
      alt={symbol}
      className={cn(sizes[size], "rounded-full", props.className)}
    />
  );
};

export default TokenIcon;
