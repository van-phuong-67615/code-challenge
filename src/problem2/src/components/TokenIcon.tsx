import React from 'react'

interface TokenIconProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  symbol: string;
  size?: number;
}

// Token icon placeholder circle
const TokenIconPlaceholder: React.FC<{ symbol: string }> = ({ symbol }) => (
  <span
    className="flex items-center justify-center rounded-full font-bold select-none shrink-0 w-[26px] h-[26px] text-[9px] bg-gradient-to-br from-indigo-600 to-violet-700 text-white"
    aria-hidden="true"
  >
    {symbol.slice(0, 2)}
  </span>
);





const TokenIcon = ({ symbol, size = 24, ...props }: TokenIconProps) => {
  const img = new URL(`https://github.com/Switcheo/token-icons/blob/main/tokens/${symbol}.svg`, import.meta.url).href

  return (
    <img src={img} alt={symbol} {...props} />
  )
}

export default TokenIcon