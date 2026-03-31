import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const BANNERS = [
  {
    id: 1,
    title: "Instant Deposits",
    subtitle: "Get 2.5% cashback on every deposit",
    emoji: "⚡",
    gradient: "from-amber-900/60 to-yellow-900/40",
    accent: "#f59e0b",
  },
  {
    id: 2,
    title: "Refer & Earn",
    subtitle: "Earn 0.3% on every friend's deposit",
    emoji: "🎁",
    gradient: "from-emerald-900/60 to-teal-900/40",
    accent: "#10b981",
  },
  {
    id: 3,
    title: "USDT Deposits",
    subtitle: "Convert USDT to INR at live rates",
    emoji: "💎",
    gradient: "from-blue-900/60 to-indigo-900/40",
    accent: "#3b82f6",
  },
];

export default function BannerSlider() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % BANNERS.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const banner = BANNERS[current];

  return (
    <div className="relative rounded-2xl overflow-hidden h-32">
      <AnimatePresence mode="wait">
        <motion.div
          key={banner.id}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.4 }}
          className={`absolute inset-0 bg-gradient-to-r ${banner.gradient} border border-white/10 rounded-2xl flex items-center px-6 gap-4`}
        >
          {/* Decorative circle */}
          <div
            className="absolute right-4 top-1/2 -translate-y-1/2 w-24 h-24 rounded-full opacity-10"
            style={{ background: `radial-gradient(circle, ${banner.accent}, transparent)` }}
          />

          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: `${banner.accent}22`, border: `1px solid ${banner.accent}44` }}
          >
            <span className="text-3xl">{banner.emoji}</span>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-white font-bold text-lg leading-tight">{banner.title}</h3>
            <p className="text-white/50 text-sm mt-0.5">{banner.subtitle}</p>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Dots */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
        {BANNERS.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === current ? "w-5 bg-gold-500" : "w-1.5 bg-white/30"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
