import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import useCopyToClipboard from "../../hooks/useCopyToClipboard";

export default function BalanceCard({ showReward = true }) {
  const { user } = useAuth();
  const { copy } = useCopyToClipboard();

  const balance = user?.balance ?? 0;
  const reward  = user?.reward  ?? 0;
  const frozen  = user?.isFrozen;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="relative rounded-2xl overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #1a1508 0%, #2d1f00 50%, #1a1508 100%)",
        boxShadow: "0 8px 40px rgba(245,158,11,0.25), inset 0 1px 0 rgba(255,255,255,0.08)",
      }}
    >
      {/* Shimmer overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(105deg, transparent 40%, rgba(245,158,11,0.08) 50%, transparent 60%)",
        }}
      />

      {/* Gold border top accent */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gold-gradient opacity-60" />

      <div className="relative p-6">
        {/* Frozen banner */}
        {frozen && (
          <div className="mb-4 bg-blue-500/20 border border-blue-500/30 rounded-xl px-3 py-2 flex items-center gap-2">
            <span className="text-lg">🧊</span>
            <span className="text-blue-300 text-sm font-medium">Account Frozen — Contact Support</span>
          </div>
        )}

        {/* Header row */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gold-gradient flex items-center justify-center">
              <span className="text-dark-900 font-black text-sm">S³</span>
            </div>
            <div>
              <p className="text-white/40 text-xs">SSSPay Wallet</p>
              <p className="text-white/60 text-xs font-mono">
                ···{user?.phone?.slice(-4)}
              </p>
            </div>
          </div>
          <span className="text-2xl opacity-30">◈</span>
        </div>

        {/* Main balance */}
        <div className="mb-1">
          <p className="text-white/40 text-xs uppercase tracking-widest mb-1">Available Balance</p>
          <div className="flex items-end gap-1">
            <span className="text-gold-400 text-lg font-bold leading-none">₹</span>
            <span
              className="font-black leading-none tracking-tight"
              style={{
                fontSize: "clamp(2rem, 10vw, 3rem)",
                background: "linear-gradient(135deg, #fde68a, #f59e0b, #d97706)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {balance.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Reward row */}
        {showReward && (
          <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
            <div>
              <p className="text-white/30 text-xs">Reward Balance</p>
              <p className="text-gold-400 font-bold text-lg">
                ₹{reward.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="text-right">
              <p className="text-white/30 text-xs">Cashback Rate</p>
              <p className="text-emerald-400 font-bold text-lg">2.5%</p>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
