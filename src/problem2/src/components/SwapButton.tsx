import React from 'react';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

export interface SwapButtonProps {
  onClick?: () => void;
  disabled?: boolean;
  'aria-label'?: string;
}

const SwapButton: React.FC<SwapButtonProps> = ({
  onClick,
  disabled = false,
  'aria-label': ariaLabel = 'Switch sell and buy tokens',
}) => {
  return (
    <div className="flex justify-center items-center py-0.5 -my-3 relative z-10">
      <button
        type="button"
        className="swap-arrow-btn flex items-center justify-center rounded-full border-0 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
        onClick={onClick}
        disabled={disabled}
        aria-label={ariaLabel}
        style={{
          width: 40,
          height: 40,
          background: '#1c2030',
          boxShadow: '0 2px 12px rgba(0,0,0,0.5)',
          border: '2px solid #0d1117',
        }}
      >
        <ArrowDownwardIcon
          className="swap-icon"
          style={{ color: '#9ca3af', fontSize: 18 }}
        />
      </button>
    </div>
  );
};

export default SwapButton;
