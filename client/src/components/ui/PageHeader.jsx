import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function PageHeader({ title, subtitle, showBack = false, action = null }) {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between mb-6 pt-2"
    >
      <div className="flex items-center gap-3">
        {showBack && (
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all"
          >
            ←
          </button>
        )}
        <div>
          <h1 className="text-white font-bold text-xl leading-tight">{title}</h1>
          {subtitle && <p className="text-white/40 text-sm mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {action && <div>{action}</div>}
    </motion.div>
  );
}
