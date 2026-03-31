import { useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import BalanceCard from "../components/ui/BalanceCard";
import BannerSlider from "../components/ui/BannerSlider";
import FakeActivityFeed from "../components/ui/FakeActivityFeed";
import NoticePopup from "../components/ui/NoticePopup";
import GlassCard from "../components/ui/GlassCard";
import { InlineLoader } from "../components/ui/LoadingSpinner";
import useApi from "../hooks/useApi";
import { noticeService } from "../services/miscService";

const stagger = {
  container: { animate: { transition: { staggerChildren: 0.08 } } },
  item: {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
  },
};

export default function HomePage() {
  const { user, refreshProfile } = useAuth();
  const { data: noticesData, loading: noticesLoading } = useApi(
    () => noticeService.getNotices(),
    []
  );

  // Refresh balance on mount
  useEffect(() => { refreshProfile(); }, []);

  const notices = noticesData?.list || [];

  return (
    <motion.div
      variants={stagger.container}
      initial="initial"
      animate="animate"
      className="space-y-4"
    >
      {/* Notice popup */}
      <NoticePopup />

      {/* Greeting */}
      <motion.div variants={stagger.item} className="flex items-center justify-between pt-2">
        <div>
          <p className="text-white/40 text-sm">Good day 👋</p>
          <h1 className="text-white font-bold text-xl">
            User_{user?.phone?.slice(-4)}
          </h1>
        </div>
        <div className="relative">
          <div className="w-11 h-11 rounded-2xl bg-gold-gradient flex items-center justify-center shadow-gold">
            <span className="text-dark-900 font-black text-lg">S³</span>
          </div>
          <div className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-dark-900" />
        </div>
      </motion.div>

      {/* Balance card */}
      <motion.div variants={stagger.item}>
        <BalanceCard />
      </motion.div>

      {/* Quick stats row */}
      <motion.div variants={stagger.item} className="grid grid-cols-3 gap-3">
        {[
          { label: "Cashback",  value: "2.5%",  icon: "⚡", color: "text-gold-400" },
          { label: "Referral",  value: "0.3%",  icon: "🎁", color: "text-emerald-400" },
          { label: "Min Order", value: "₹100",  icon: "📦", color: "text-blue-400" },
        ].map((stat) => (
          <div key={stat.label} className="glass-card p-3 text-center">
            <div className="text-xl mb-1">{stat.icon}</div>
            <p className={`font-bold text-base ${stat.color}`}>{stat.value}</p>
            <p className="text-white/30 text-xs">{stat.label}</p>
          </div>
        ))}
      </motion.div>

      {/* Banner */}
      <motion.div variants={stagger.item}>
        <BannerSlider />
      </motion.div>

      {/* Notices list */}
      {notices.length > 0 && (
        <motion.div variants={stagger.item}>
          <GlassCard className="p-4" animate={false}>
            <p className="text-white/40 text-xs uppercase tracking-widest font-semibold mb-3">
              📢 Announcements
            </p>
            <div className="space-y-3">
              {notices.map((n) => (
                <div
                  key={n._id}
                  className="border-l-2 border-gold-500/40 pl-3"
                >
                  <p className="text-white/80 font-semibold text-sm">{n.title}</p>
                  <p className="text-white/40 text-xs mt-0.5 leading-relaxed line-clamp-2">
                    {n.message}
                  </p>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      )}

      {/* Live activity */}
      <motion.div variants={stagger.item}>
        <GlassCard className="p-4" animate={false}>
          <FakeActivityFeed />
        </GlassCard>
      </motion.div>

      {/* Bottom spacer */}
      <div className="h-2" />
    </motion.div>
  );
}
