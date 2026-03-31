import { motion } from "framer-motion";

export default function EmptyState({ icon = "📭", title, subtitle, action }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 text-center"
    >
      <div className="text-5xl mb-4 opacity-40">{icon}</div>
      <h3 className="text-white/60 font-semibold text-lg mb-1">{title}</h3>
      {subtitle && <p className="text-white/30 text-sm max-w-xs">{subtitle}</p>}
      {action && <div className="mt-6">{action}</div>}
    </motion.div>
  );
}
