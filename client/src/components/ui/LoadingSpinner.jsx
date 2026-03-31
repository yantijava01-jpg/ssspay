export default function LoadingSpinner({ size = "md", className = "" }) {
  const sizes = {
    sm: "w-5 h-5 border-2",
    md: "w-8 h-8 border-3",
    lg: "w-12 h-12 border-4",
  };

  return (
    <div
      className={`rounded-full border-gold-500/30 border-t-gold-500 animate-spin ${sizes[size]} ${className}`}
      style={{ borderWidth: size === "md" ? "3px" : undefined }}
    />
  );
}

export function FullPageSpinner() {
  return (
    <div className="min-h-dvh bg-dark-900 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <LoadingSpinner size="lg" />
        <p className="text-white/30 text-sm animate-pulse">Loading...</p>
      </div>
    </div>
  );
}

export function InlineLoader({ text = "Loading..." }) {
  return (
    <div className="flex items-center justify-center gap-3 py-12">
      <LoadingSpinner size="sm" />
      <span className="text-white/40 text-sm">{text}</span>
    </div>
  );
}
