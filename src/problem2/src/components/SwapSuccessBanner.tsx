interface SwapSuccessBannerProps {
  message?: string;
  leaving?: boolean;
}

const SwapSuccessBanner = ({
  message = "Your swap was completed successfully.",
  leaving = false,
}: SwapSuccessBannerProps) => (
  <div
    role="status"
    aria-live="polite"
    className={`flex items-start gap-3 rounded-2xl px-4 py-3 mb-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 ${leaving ? "banner-leave" : "banner-enter"}`}
  >
    {/* Checkmark icon */}
    <svg
      className="shrink-0 mt-0.5"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="9 12 11 14 15 10" />
    </svg>

    <div className="flex-1 min-w-0">
      <p className="text-sm font-semibold leading-tight">Swap successful!</p>
      <p className="text-xs text-emerald-400/70 mt-0.5">{message}</p>
    </div>
  </div>
);

export default SwapSuccessBanner;
