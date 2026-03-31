import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { noticeService } from "../../services/miscService";

export default function NoticePopup() {
  const [notice, setNotice]   = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await noticeService.getNotices();
        const popups = res.data.popups;
        if (popups && popups.length > 0) {
          const key = `ssspay_notice_${popups[0]._id}`;
          if (!sessionStorage.getItem(key)) {
            setNotice(popups[0]);
            setVisible(true);
          }
        }
      } catch {
        // Silently ignore
      }
    };
    fetch();
  }, []);

  const dismiss = () => {
    if (notice) {
      sessionStorage.setItem(`ssspay_notice_${notice._id}`, "1");
    }
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && notice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={dismiss}
          />

          {/* Notice card */}
          <motion.div
            className="relative w-full max-w-sm glass-card-gold z-10 overflow-hidden"
            initial={{ opacity: 0, scale: 0.8, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 22, stiffness: 280 }}
          >
            {/* Gold top bar */}
            <div className="h-1 w-full bg-gold-gradient" />

            <div className="p-6">
              {/* Icon */}
              <div className="w-14 h-14 rounded-2xl bg-gold-500/15 border border-gold-500/25 flex items-center justify-center mb-4 mx-auto">
                <span className="text-3xl">📢</span>
              </div>

              <h2 className="text-white font-bold text-xl text-center mb-2">
                {notice.title}
              </h2>
              <p className="text-white/60 text-sm text-center leading-relaxed whitespace-pre-line">
                {notice.message}
              </p>

              <button
                onClick={dismiss}
                className="btn-gold w-full mt-6 text-sm"
              >
                Got it! 👍
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
