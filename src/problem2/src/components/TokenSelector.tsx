import React, { useState } from 'react';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

// Token icon placeholder circle
const TokenIconPlaceholder: React.FC<{ symbol: string }> = ({ symbol }) => (
  <span
    className="flex items-center justify-center rounded-full text-xs font-bold select-none"
    style={{
      width: 26,
      height: 26,
      background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
      color: '#fff',
      flexShrink: 0,
      fontSize: 9,
    }}
    aria-hidden="true"
  >
    {symbol.slice(0, 2)}
  </span>
);

export interface TokenSelectorProps {
  /** The currently selected token symbol (e.g. "ETH") */
  value: string;
  /** Called when the user picks a different token — pass an empty array to disable */
  options?: string[];
  onChange?: (token: string) => void;
  disabled?: boolean;
  'aria-label'?: string;
}

const TokenSelector: React.FC<TokenSelectorProps> = ({
  value,
  options = [],
  onChange,
  disabled = false,
  'aria-label': ariaLabel,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || options.length === 0) return;
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => setAnchorEl(null);

  const handleSelect = (token: string) => {
    onChange?.(token);
    handleClose();
  };

  return (
    <>
      <button
        type="button"
        className="token-selector flex items-center gap-2 px-3 py-2 rounded-full font-semibold text-sm text-white cursor-pointer border-0 outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
        style={{
          background: 'rgba(255,255,255,0.08)',
          minWidth: 90,
          letterSpacing: 0.3,
        }}
        onClick={handleOpen}
        disabled={disabled}
        aria-label={ariaLabel ?? `Select token, current: ${value}`}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <TokenIconPlaceholder symbol={value} />
        <span>{value}</span>
        {options.length > 0 && (
          <KeyboardArrowDownIcon
            fontSize="small"
            style={{
              marginLeft: 'auto',
              opacity: 0.6,
              transition: 'transform 0.2s ease',
              transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            }}
          />
        )}
      </button>

      {options.length > 0 && (
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          slotProps={{
            paper: {
              style: {
                background: '#1c1f26',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 12,
                boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
                minWidth: 140,
                marginTop: 6,
              },
            },
          }}
        >
          {options.map((token) => (
            <MenuItem
              key={token}
              onClick={() => handleSelect(token)}
              selected={token === value}
              style={{
                color: '#e5e7eb',
                fontSize: 14,
                fontWeight: token === value ? 600 : 400,
                gap: 10,
                paddingBlock: 10,
              }}
            >
              <TokenIconPlaceholder symbol={token} />
              {token}
            </MenuItem>
          ))}
        </Menu>
      )}
    </>
  );
};

export default TokenSelector;
