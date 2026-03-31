import { motion } from "framer-motion";

export default function StatCard({ label, value, icon, color = "gold", sub, delay = 0 }) {
  const colors = {
    gold:    { bg: "bg-gold-500/10",    border: "border-gold-500/20",    text: "text-gold-400"    },
    green:   { bg: "bg-emerald-500/10", border: "border-emerald-500/20", text: "text-emerald-400" },
    blue:    { bg: "bg-blue-500/10",    border: "border-blue-500/20",    text: "text-blue-400"    },
    red:     { bg: "bg-red-500/10",     border: "border-red-500/20",     text: "text-red-400"     },
    purple:  { bg: "bg-purple-500/10",  border: "border-purple-500/20",  text: "text-purple-400"  },
  };

  const c = colors[color] || colors.gold;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
      className={`glass-card p-5 border ${c.border}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl ${c.bg} border ${c.border} flex items-center justify-center`}>
          <span className="text-xl">{icon}</span>
        </div>
        {sub && <span className="text-white/30 text-xs">{sub}</span>}
      </div>
      <p className={`font-black text-2xl ${c.text} leading-none`}>{value}</p>
      <p className="text-white/40 text-sm mt-1">{label}</p>
    </motion.div>
  );
}
