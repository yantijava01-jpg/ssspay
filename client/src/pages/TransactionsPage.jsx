import { useState } from "react";
import { motion } from "framer-motion";
import { orderService } from "../services/orderService";
import PageHeader from "../components/ui/PageHeader";
import GlassCard from "../components/ui/GlassCard";
import { InlineLoader } from "../components/ui/LoadingSpinner";
import EmptyState from "../components/ui/EmptyState";
import Pagination from "../components/ui/Pagination";
import useApi from "../hooks/useApi";

const TX_TYPES = [
  { value: "",         label: "All"     },
  { value: "deposit",  label: "Deposit" },
  { value: "reward",   label: "Reward"  },
  { value: "referral", label: "Referral"},
  { value: "withdraw", label: "Payout"  },
];

const TX_CONFIG = {
  deposit:  { icon: "⬇️", color: "text-gold-400",    sign: "+"  },
  reward:   { icon: "⭐",  color: "text-emerald-400", sign: "+"  },
  referral: { icon: "🎁",  color: "text-blue-400",    sign: "+"  },
  withdraw: { icon: "⬆️",  color: "text-red-400",     sign: "-"  },
};

export default function TransactionsPage() {
  const [type, setType]   = useState("");
  const [page, setPage]   = useState(1);

  const { data, loading } = useApi(
    () => orderService.getTransactions({ type, page, limit: 20 }),
    [type, page]
  );

  const transactions = data?.transactions || [];
  const summary      = data?.summary || {};
  const pagination   = data?.pagination;

  return (
    <div className="space-y-4">
      <PageHeader title="Transactions" subtitle="Your financial history" />

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3">
        <GlassCard className="p-4" delay={0}>
          <p className="text-white/30 text-xs mb-1">Total Deposited</p>
          <p className="text-gold-400 font-black text-xl">
            ₹{(summary.deposit || 0).toLocaleString("en-IN")}
          </p>
        </GlassCard>
        <GlassCard className="p-4" delay={0.05}>
          <p className="text-white/30 text-xs mb-1">Total Rewards</p>
          <p className="text-emerald-400 font-black text-xl">
            ₹{((summary.reward || 0) + (summary.referral || 0)).toFixed(2)}
          </p>
        </GlassCard>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {TX_TYPES.map((t) => (
          <button
            key={t.value}
            onClick={() => { setType(t.value); setPage(1); }}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all border ${
              type === t.value
                ? "bg-gold-500/20 border-gold-500/40 text-gold-400"
                : "bg-white/5 border-white/10 text-white/50"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Transaction list */}
      <GlassCard className="p-4" animate={false}>
        {loading ? (
          <InlineLoader />
        ) : transactions.length === 0 ? (
          <EmptyState icon="📋" title="No transactions" subtitle="Your transaction history will appear here" />
        ) : (
          <div className="space-y-0">
            {transactions.map((tx, i) => {
              const cfg = TX_CONFIG[tx.type] || TX_CONFIG.deposit;
              return (
                <motion.div
                  key={tx._id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex items-center gap-3 py-3.5 border-b border-white/5 last:border-0"
                >
                  {/* Icon */}
                  <div className="w-10 h-10 rounded-xl bg-dark-600 border border-white/5 flex items-center justify-center text-lg flex-shrink-0">
                    {cfg.icon}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-white/80 font-semibold text-sm capitalize">{tx.type}</p>
                    <p className="text-white/30 text-xs truncate">
                      {tx.description || `${tx.type} transaction`}
                    </p>
                    <p className="text-white/20 text-xs mt-0.5">
                      {new Date(tx.createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit", month: "short", year: "numeric",
                        hour: "2-digit", minute: "2-digit",
                      })}
                    </p>
                  </div>

                  {/* Amount */}
                  <div className="text-right flex-shrink-0">
                    <p className={`font-black text-base ${cfg.color}`}>
                      {cfg.sign}₹{tx.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </p>
                    {tx.balanceAfter !== null && tx.balanceAfter !== undefined && (
                      <p className="text-white/20 text-xs">
                        Bal: ₹{tx.balanceAfter.toFixed(2)}
                      </p>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </GlassCard>

      {/* Pagination */}
      {pagination && (
        <Pagination
          page={pagination.page}
          pages={pagination.pages}
          onPage={(p) => setPage(p)}
        />
      )}

      <div className="h-2" />
    </div>
  );
}
