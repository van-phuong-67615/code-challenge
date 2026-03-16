import React, { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import TokenIcon from './TokenIcon';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { IToken } from '@/types';
import { cn, formatPrice } from '@/lib/utils';

export interface TokenPickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Token map: key = symbol, value = IToken */
  options: Record<string, IToken>;
  /** Currently selected symbol, used to highlight the active row */
  value: string;
  onSelect: (symbol: string) => void;
}

const TokenPickerDialog: React.FC<TokenPickerDialogProps> = ({
  open,
  onOpenChange,
  options,
  value,
  onSelect,
}) => {
  const [search, setSearch] = useState('');

  const tokenKeys = Object.keys(options);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return tokenKeys;
    return tokenKeys.filter((sym) => sym.toLowerCase().includes(q));
  }, [search, tokenKeys]);

  const handleOpenChange = (next: boolean) => {
    if (!next) setSearch('');
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="p-0 overflow-hidden flex flex-col bg-[#131313]">
        {/* Header */}
        <DialogHeader className="px-5 pt-5 pb-0">
          <DialogTitle className='text-white'>Select a token</DialogTitle>
        </DialogHeader>

        {/* Search input */}
        <div className="px-4 pt-3 pb-2">
          <div
            className="flex items-center gap-2 rounded-xl px-3 py-2.5"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <Search size={15} className="text-gray-500 shrink-0" />
            <input
              type="text"
              placeholder="Search token..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
              className="flex-1 bg-transparent outline-none border-none text-sm text-white placeholder:text-gray-500"
            />
          </div>
        </div>

        {/* Token list */}
        <div
          role="listbox"
          aria-label="Choose token"
          className="overflow-y-auto flex-1 px-2 pb-3 max-h-[60vh]"
        >
          {filtered.length === 0 ? (
            <p className="text-center text-sm text-gray-500 py-8">
              No tokens found
            </p>
          ) : (
            filtered.map((sym) => {
              const token = options[sym];
              const isSelected = sym === value;
              return (
                <button
                  key={sym}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onSelect(sym);
                    handleOpenChange(false);
                  }}
                  className={cn("cursor-pointer w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors duration-100 outline-none focus-visible:ring-2 focus-visible:ring-indigo-400", isSelected ? 'bg-[rgba(124,58,237,0.18)]' : 'hover:bg-white/5')}
                >
                  <TokenIcon symbol={sym} size="md" />
                  <div className="flex flex-col min-w-0">
                    <span
                      className={cn("text-sm text-white truncate", isSelected ? 'font-bold' : 'font-semibold')}
                    >
                      {sym}
                    </span>
                    {token?.price != null && (
                      <span className="text-xs text-gray-400">
                        {formatPrice(token.price)}
                      </span>
                    )}
                  </div>
                  {isSelected && (
                    <span className="ml-auto text-indigo-400 text-xs font-semibold">Selected</span>
                  )}
                </button>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TokenPickerDialog;
