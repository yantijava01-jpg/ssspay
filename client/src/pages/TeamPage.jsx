import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { orderService } from "../services/orderService";
import PageHeader from "../components/ui/PageHeader";
import GlassCard from "../components/ui/GlassCard";
import { InlineLoader } from "../components/ui/LoadingSpinner";
import EmptyState from "../components/ui/EmptyState";
import StatusBadge from "../components/ui/StatusBadge";
import useCopyToClipboard from "../hooks/useCopyToClipboard";
import useApi from "../hooks/useApi";

export default function TeamPage() {
  const { user } = useAuth();
  const { copy, copied } = useCopyToClipboard();
  const { data, loading } = useApi(() => orderService.getTeam(), []);

  const referralLink = `${window.location.origin}/register?ref=${user?.referralCode}`;

  return (
    <div className="space-y-4">
      <PageHeader title="My Team" subtitle="Referral & commission" />

      {/* Referral code card */}
      <GlassCard gold className="p-5" delay={0}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-white/40 text-xs uppercase tracking-widest mb-1">Your Referral Code</p>
            <p className="text-gold-gradient font-black text-3xl tracking-widest">
              {user?.referralCode}
            </p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center">
            <span className="text-3xl">🎁</span>
          </div>
        </div>

        <div className="bg-dark-700/60 rounded-xl p-3 mb-3 flex items-center justify-between gap-2">
          <p className="text-white/40 text-xs font-mono truncate flex-1">{referralLink}</p>
        </div>

        <button
          onClick={() => copy(referralLink, "Referral link copied!")}
          className="btn-gold w-full text-sm"
        >
          {copied ? "✅ Copied!" : "📋 Copy Referral Link"}
        </button>
      </GlassCard>

      {/* Commission info */}
      <div className="grid grid-cols-2 gap-3">
        <GlassCard className="p-4 text-center" delay={0.05}>
          <p className="text-3xl mb-1">💰</p>
          <p className="text-gold-400 font-black text-2xl">
            {loading ? "—" : data?.totalMembers ?? 0}
          </p>
          <p className="text-white/40 text-xs">Total Members</p>
        </GlassCard>
        <GlassCard className="p-4 text-center" delay={0.1}>
          <p className="text-3xl mb-1">⭐</p>
          <p className="text-emerald-400 font-black text-2xl">
            ₹{loading ? "—" : (data?.totalEarnings ?? 0).toFixed(2)}
          </p>
          <p className="text-white/40 text-xs">Total Earned</p>
        </GlassCard>
      </div>

      {/* Commission rate */}
      <GlassCard className="p-4" delay={0.12}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <span className="text-xl">📊</span>
          </div>
          <div>
            <p className="text-white font-semibold text-sm">Commission Rate</p>
            <p className="text-white/40 text-xs">Earned on every referral's deposit</p>
          </div>
          <span className="ml-auto text-emerald-400 font-black text-xl">0.3%</span>
        </div>
      </GlassCard>

      {/* Member list */}
      <GlassCard className="p-4" delay={0.15} animate={false}>
        <p className="text-white/40 text-xs uppercase tracking-widest font-semibold mb-3">
          👥 Team Members
        </p>

        {loading ? (
          <InlineLoader />
        ) : !data?.members?.length ? (
          <EmptyState
            icon="👥"
            title="No members yet"
            subtitle="Share your referral link to start earning 0.3% commission"
          />
        ) : (
          <div className="space-y-2">
            {data.members.map((m, i) => (
              <motion.div
                key={m._id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-3 py-2.5 border-b border-white/5 last:border-0"
              >
                <div className="w-9 h-9 rounded-full bg-dark-600 border border-white/10 flex items-center justify-center">
                  <span className="text-white/60 font-bold text-sm">{m.phone.slice(-2)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white/80 text-sm font-medium">
                    ···{m.phone.slice(-4)}
                  </p>
                  <p className="text-white/30 text-xs">
                    Joined {new Date(m.createdAt).toLocaleDateString("en-IN")}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-gold-400 text-sm font-semibold">
                    ₹{(m.totalDeposits * 0.003).toFixed(2)}
                  </p>
                  <p className="text-white/30 text-xs">earned</p>
                </div>
                <StatusBadge status={m.status} />
              </motion.div>
            ))}
          </div>
        )}
      </GlassCard>

      <div className="h-2" />
    </div>
  );
}
