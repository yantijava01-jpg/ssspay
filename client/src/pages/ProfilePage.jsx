import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import PageHeader from "../components/ui/PageHeader";
import GlassCard from "../components/ui/GlassCard";
import StatusBadge from "../components/ui/StatusBadge";

const MENU_ITEMS = [
  { icon: "💼", label: "Wallet",       sub: "Balance & rewards",      to: "/"             },
  { icon: "📋", label: "Transactions", sub: "Deposits & rewards",     to: "/transactions" },
  { icon: "🔧", label: "Service",      sub: "Support & contact",      to: "/service"      },
  { icon: "💳", label: "UPI Tool",     sub: "Manage your UPI ID",     to: "/tool"         },
];

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully.");
    navigate("/login", { replace: true });
  };

  return (
    <div className="space-y-4">
      <PageHeader title="My Profile" />

      {/* User card */}
      <GlassCard gold className="p-5" delay={0}>
        <div className="flex items-center gap-4 mb-5">
          {/* Avatar */}
          <div className="relative">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center font-black text-2xl text-dark-900"
              style={{ background: "linear-gradient(135deg, #f59e0b, #fbbf24)" }}
            >
              {user?.phone?.charAt(0)}
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-dark-900 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-white" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="text-white font-bold text-xl">
              User_{user?.phone?.slice(-4)}
            </h2>
            <p className="text-white/40 text-sm font-mono">+91 ···{user?.phone?.slice(-6)}</p>
            <div className="mt-1.5 flex items-center gap-2">
              <StatusBadge status={user?.status || "active"} />
              {user?.isFrozen && <StatusBadge status="frozen" label="🧊 Frozen" />}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-dark-700/60 rounded-xl p-3">
            <p className="text-white/30 text-xs mb-1">Total Collection</p>
            <p className="text-gold-400 font-black text-xl">
              ₹{(user?.totalDeposits || 0).toLocaleString("en-IN")}
            </p>
          </div>
          <div className="bg-dark-700/60 rounded-xl p-3">
            <p className="text-white/30 text-xs mb-1">Total Payout</p>
            <p className="text-red-400 font-black text-xl">
              ₹{(user?.totalWithdrawals || 0).toLocaleString("en-IN")}
            </p>
          </div>
        </div>
      </GlassCard>

      {/* Referral badge */}
      <GlassCard className="p-4" delay={0.05}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/40 text-xs uppercase tracking-widest">Referral Code</p>
            <p className="text-gold-gradient font-black text-xl tracking-widest mt-0.5">
              {user?.referralCode}
            </p>
          </div>
          <Link
            to="/team"
            className="btn-ghost text-xs py-2 px-4"
          >
            View Team →
          </Link>
        </div>
      </GlassCard>

      {/* Menu items */}
      <div className="space-y-2">
        {MENU_ITEMS.map((item, i) => (
          <motion.div
            key={item.to}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 + i * 0.06 }}
          >
            <Link
              to={item.to}
              className="flex items-center gap-4 glass-card p-4 active:scale-[0.98] transition-transform"
            >
              <div className="w-11 h-11 rounded-xl bg-dark-600 border border-white/5 flex items-center justify-center text-xl flex-shrink-0">
                {item.icon}
              </div>
              <div className="flex-1">
                <p className="text-white font-semibold text-sm">{item.label}</p>
                <p className="text-white/30 text-xs">{item.sub}</p>
              </div>
              <span className="text-white/20 text-sm">›</span>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Logout */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35 }}
      >
        <button
          onClick={handleLogout}
          className="w-full glass-card p-4 flex items-center gap-4 border-red-500/10 hover:border-red-500/30 transition-colors"
        >
          <div className="w-11 h-11 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-xl flex-shrink-0">
            🚪
          </div>
          <div className="flex-1">
            <p className="text-red-400 font-semibold text-sm text-left">Logout</p>
            <p className="text-white/20 text-xs text-left">Sign out of your account</p>
          </div>
        </button>
      </motion.div>

      {/* App version */}
      <p className="text-white/15 text-xs text-center pb-2">
        SSSPay v1.0.0 · Secure Payments
      </p>
    </div>
  );
}
