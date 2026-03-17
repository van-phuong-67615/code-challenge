import React from 'react';
import { ArrowDownUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface SwapButtonProps {
  onClick?: () => void;
  disabled?: boolean;
  'aria-label'?: string;
  'data-testid'?: string;
}

const SwapButton: React.FC<SwapButtonProps> = ({
  onClick,
  disabled = false,
  'aria-label': ariaLabel = 'Switch sell and buy tokens',
  'data-testid': testId = 'switch-direction-btn',
}) => {
  return (
    <div className="flex justify-center items-center py-0.5 -my-6.5 relative z-10">
      <Button
        type="button"
        variant="ghost"
        className="swap-arrow-btn flex items-center justify-center rounded-full cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 p-0 size-[50px] bg-[#374151] border-[6px] border-[rgb(22,27,38)]"
        onClick={onClick}
        disabled={disabled}
        aria-label={ariaLabel}
        data-testid={testId}
      >
        <ArrowDownUp
          className="swap-icon"
          size={18}
          color="#FFF"
        />
      </Button>
    </div>
  );
};

export default SwapButton;
