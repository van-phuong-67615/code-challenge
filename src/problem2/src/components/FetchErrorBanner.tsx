interface FetchErrorBannerProps {
  error: Error;
  onRetry?: () => void;
  leaving?: boolean;
}

const FetchErrorBanner = ({ error, onRetry, leaving = false }: FetchErrorBannerProps) => (
  <div
    role="alert"
    aria-live="assertive"
    className={`flex items-start gap-3 rounded-2xl px-4 py-3 mb-1 bg-red-500/10 border border-red-500/30 text-red-400 ${leaving ? "banner-leave" : "banner-enter"}`}
  >
    {/* Icon */}
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
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>

    <div className="flex-1 min-w-0">
      <p className="text-sm font-semibold leading-tight">
        Failed to load token prices
      </p>
      <p className="text-xs text-red-400/70 mt-0.5 break-words">
        {error.message || "An unexpected error occurred. Please try again."}
      </p>
    </div>

    {/* Retry */}
    <button
      type="button"
      onClick={onRetry ?? (() => window.location.reload())}
      className="shrink-0 text-xs font-medium px-3 py-1 rounded-full border border-red-500/40 hover:bg-red-500/20 transition-colors cursor-pointer"
      aria-label="Retry loading tokens"
    >
      Retry
    </button>
  </div>
);

export default FetchErrorBanner;
