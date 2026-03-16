import React, { useImperativeHandle, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import TokenIcon from './TokenIcon';
import { Button } from '@/components/ui/button';
import TokenPickerDialog from './TokenPickerDialog';
import type { IToken } from '@/types';

export interface TokenSelectorHandle {
  setOpen: (open: boolean) => void;
}

export interface TokenSelectorProps {
  /** The currently selected token symbol (e.g. "ETH") */
  value?: IToken;
  /** Token map: key = symbol, value = IToken */
  options?: Record<string, IToken>;
  onChange?: (token: IToken) => void;
  disabled?: boolean;
  'aria-label'?: string;
  /** React 19: ref passed directly as a prop (no forwardRef needed) */
  ref?: React.Ref<TokenSelectorHandle>;
}

const TokenSelector: React.FC<TokenSelectorProps> = ({
  value,
  options = {},
  onChange,
  disabled = false,
  'aria-label': ariaLabel,
  ref,
}) => {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  const hasOptions = Object.keys(options).length > 0;

  const handleOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled || !hasOptions) return;
    setOpen(true);
  };

   useImperativeHandle(ref, () => ({
    setOpen: (open: boolean) => {
      console.log("open", open)
      setOpen(open)
    },
  }));


  return (
    <>
      {/* Trigger button */}
      {!value ? (
        /* ── No selection: pink "Select token" pill ── */
        <Button
          ref={buttonRef}
          type="button"
          onClick={handleOpen}
          disabled={disabled}
          aria-label={ariaLabel ?? "Select token"}
          aria-haspopup="dialog"
          aria-expanded={open}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full font-semibold text-sm text-white cursor-pointer border-0 outline-none focus-visible:ring-2 focus-visible:ring-pink-400 h-auto tracking-wide"
          style={{
            background: "linear-gradient(90deg, #e0198c 0%, #ff4db8 100%)",
            boxShadow: "0 0 16px 2px rgba(224,25,140,0.35)",
          }}
        >
          Select token
          <ChevronDown
            size={16}
            className="opacity-80 transition-transform duration-200"
            style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
          />
        </Button>
      ) : (
        /* ── Token selected: icon + symbol ── */
        <Button
          ref={buttonRef}
          type="button"
          variant="ghost"
          className="token-selector flex items-center gap-2 px-3 py-2 rounded-full font-semibold text-sm text-white cursor-pointer border-0 outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 h-auto bg-white/8 min-w-[90px] tracking-[0.3px] hover:bg-white/12 hover:text-white/80"
          onClick={handleOpen}
          disabled={disabled}
          aria-label={ariaLabel ?? `Select token, current: ${value}`}
          aria-haspopup="dialog"
          aria-expanded={open}
        >
          <TokenIcon symbol={value.currency} size="sm" />
          <span>{value.currency}</span>
          {hasOptions && (
            <ChevronDown
              size={16}
              className="ml-auto opacity-60 transition-transform duration-200"
              style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
            />
          )}
        </Button>
      )}

      {/* Token picker dialog */}
      {open && <TokenPickerDialog
        open={open}
        onOpenChange={setOpen}
        options={options}
        value={value}
        onSelect={(token) => {
          onChange?.(token);
          setOpen(false);
        }}
      />}
    </>
  );
};

export default TokenSelector;
