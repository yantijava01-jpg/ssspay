import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";

export default function Modal({ isOpen, onClose, title, children, size = "md" }) {
  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else        document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const sizes = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal panel */}
          <motion.div
            className={`relative w-full ${sizes[size]} glass-card border-white/15 z-10`}
            initial={{ opacity: 0, y: 60, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.97 }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
          >
            {/* Header */}
            {title && (
              <div className="flex items-center justify-between p-5 border-b border-white/5">
                <h2 className="text-white font-bold text-lg">{title}</h2>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all text-sm"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Body */}
            <div className="p-5">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
