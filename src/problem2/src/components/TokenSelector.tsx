import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import TokenIcon from './TokenIcon';
import { Button } from '@/components/ui/button';
import TokenPickerDialog from './TokenPickerDialog';
import type { IToken } from '@/types';

export interface TokenSelectorProps {
  /** The currently selected token symbol (e.g. "ETH") */
  value: string;
  /** Token map: key = symbol, value = IToken */
  options?: Record<string, IToken>;
  onChange?: (token: string) => void;
  disabled?: boolean;
  'aria-label'?: string;
}

const TokenSelector: React.FC<TokenSelectorProps> = ({
  value,
  options = {},
  onChange,
  disabled = false,
  'aria-label': ariaLabel,
}) => {
  const [open, setOpen] = useState(false);

  const hasOptions = Object.keys(options).length > 0;

  const handleOpen = () => {
    if (disabled || !hasOptions) return;
    setOpen(true);
  };

  return (
    <>
      {/* Trigger button */}
      <Button
        type="button"
        variant="ghost"
        className="token-selector flex items-center gap-2 px-3 py-2 rounded-full font-semibold text-sm text-white cursor-pointer border-0 outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 h-auto bg-white/8 min-w-[90px] tracking-[0.3px] hover:bg-white/12 hover:text-white/80"
        onClick={handleOpen}
        disabled={disabled}
        aria-label={ariaLabel ?? `Select token, current: ${value}`}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <TokenIcon symbol={value} size="sm" />
        <span>{value}</span>
        {hasOptions && (
          <ChevronDown
            size={16}
            className="ml-auto opacity-60 transition-transform duration-200"
            style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
          />
        )}
      </Button>

      {/* Token picker dialog */}
      <TokenPickerDialog
        open={open}
        onOpenChange={setOpen}
        options={options}
        value={value}
        onSelect={(token) => {
          onChange?.(token);
          setOpen(false);
        }}
      />
    </>
  );
};

export default TokenSelector;

