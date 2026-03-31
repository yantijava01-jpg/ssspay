export default function Pagination({ page, pages, onPage }) {
  if (!pages || pages <= 1) return null;

  const items = [];
  const start = Math.max(1, page - 2);
  const end   = Math.min(pages, page + 2);

  for (let i = start; i <= end; i++) items.push(i);

  const btn = (label, targetPage, disabled = false) => (
    <button
      key={label}
      onClick={() => !disabled && onPage(targetPage)}
      disabled={disabled}
      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
        targetPage === page
          ? "bg-gold-500/20 text-gold-400 border border-gold-500/30"
          : disabled
          ? "text-white/20 cursor-not-allowed"
          : "text-white/50 hover:text-white hover:bg-white/5"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="flex items-center justify-center gap-1 mt-6">
      {btn("←", page - 1, page === 1)}
      {items.map((p) => btn(p, p))}
      {btn("→", page + 1, page === pages)}
    </div>
  );
}
