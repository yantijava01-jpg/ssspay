import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { adminService } from "../../services/adminService";
import StatCard from "../../components/ui/StatCard";
import GlassCard from "../../components/ui/GlassCard";
import { InlineLoader } from "../../components/ui/LoadingSpinner";
import useApi from "../../hooks/useApi";

const fmt  = (n) => Number(n || 0).toLocaleString("en-IN");
const fmtR = (n) =>
  `₹${Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

export default function AdminDashboard() {
  const { data, loading } = useApi(() => adminService.getAnalytics(), []);

  const u     = data?.users      || {};
  const o     = data?.orders     || {};
  const f     = data?.financials || {};
  const trend = data?.orderTrend || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-white font-black text-2xl lg:text-3xl">Dashboard</h1>
        <p className="text-white/40 text-sm mt-1">Real-time SSSPay overview</p>
      </div>

      {loading ? (
        <InlineLoader />
      ) : (
        <>
          {/* User stats */}
          <section>
            <p className="text-white/30 text-xs uppercase tracking-widest mb-3 font-semibold">
              👥 Users
            </p>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              <StatCard label="Total Users"      value={fmt(u.total)}   icon="👤" color="gold"   delay={0}    />
              <StatCard label="Active"           value={fmt(u.active)}  icon="✅" color="green"  delay={0.05} />
              <StatCard label="Pending Approval" value={fmt(u.pending)} icon="⏳" color="purple" delay={0.1}  />
            </div>
          </section>

          {/* Order stats */}
          <section>
            <p className="text-white/30 text-xs uppercase tracking-widest mb-3 font-semibold">
              📦 Orders
            </p>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard label="Total"      value={fmt(o.total)}      icon="📦" color="blue"   delay={0.12} />
              <StatCard label="Successful" value={fmt(o.success)}    icon="✅" color="green"  delay={0.16} />
              <StatCard label="Processing" value={fmt(o.processing)} icon="⟳"  color="gold"   delay={0.20} />
              <StatCard label="Pending"    value={fmt(o.pending)}    icon="◷"  color="purple" delay={0.24} />
            </div>
          </section>

          {/* Financial stats */}
          <section>
            <p className="text-white/30 text-xs uppercase tracking-widest mb-3 font-semibold">
              💰 Financials
            </p>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <StatCard label="Total Deposits"    value={fmtR(f.totalDeposits)}    icon="⬇️" color="gold"  delay={0.28} />
              <StatCard label="Total Rewards"     value={fmtR(f.totalRewards)}     icon="⭐" color="green" delay={0.32} />
              <StatCard label="Total Withdrawals" value={fmtR(f.totalWithdrawals)} icon="⬆️" color="red"   delay={0.36} />
            </div>
          </section>

          {/* 7-day bar chart */}
          {trend.length > 0 && (
            <section>
              <p className="text-white/30 text-xs uppercase tracking-widest mb-3 font-semibold">
                📈 7-Day Deposit Trend
              </p>
              <GlassCard className="p-6" animate={false}>
                <div className="space-y-3">
                  {trend.map((day, i) => {
                    const maxTotal = Math.max(...trend.map((d) => d.total), 1);
                    const pct = (day.total / maxTotal) * 100;
                    return (
                      <div key={day._id} className="flex items-center gap-3">
                        <span className="text-white/30 text-xs w-24 flex-shrink-0 font-mono">
                          {day._id}
                        </span>
                        <div className="flex-1 bg-dark-600 rounded-full h-2 overflow-hidden">
                          <motion.div
                            className="h-full bg-gold-gradient rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.7, delay: 0.4 + i * 0.07, ease: "easeOut" }}
                          />
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0 text-right">
                          <span className="text-gold-400 text-xs font-bold w-28">
                            {fmtR(day.total)}
                          </span>
                          <span className="text-white/30 text-xs w-12">
                            {day.count} orders
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </GlassCard>
            </section>
          )}

          {/* Quick action cards */}
          <section>
            <p className="text-white/30 text-xs uppercase tracking-widest mb-3 font-semibold">
              ⚡ Quick Actions
            </p>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { label: "Processing Orders", href: "/admin/orders", icon: "📦", badge: o.processing, color: "text-gold-400" },
                { label: "Pending Users",     href: "/admin/users",  icon: "👤", badge: u.pending,    color: "text-purple-400" },
                { label: "Manage UPIs",       href: "/admin/upis",   icon: "💳", badge: null,         color: "text-blue-400" },
                { label: "Post Notice",       href: "/admin/notices",icon: "📢", badge: null,         color: "text-emerald-400" },
              ].map((a) => (
                <Link
                  key={a.label}
                  to={a.href}
                  className="glass-card p-4 flex flex-col gap-2 hover:border-gold-500/25 transition-colors group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-2xl group-hover:scale-110 transition-transform inline-block">
                      {a.icon}
                    </span>
                    {a.badge > 0 && (
                      <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
                        {a.badge}
                      </span>
                    )}
                  </div>
                  <p className={`text-xs font-semibold ${a.color}`}>{a.label}</p>
                </Link>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
