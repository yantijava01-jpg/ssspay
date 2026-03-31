import { Outlet, useLocation } from "react-router-dom";
import BottomNav from "../components/layout/BottomNav";
import { motion, AnimatePresence } from "framer-motion";

export default function UserLayout() {
  const location = useLocation();

  return (
    <div className="min-h-dvh bg-dark-900 relative overflow-x-hidden">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-[-30%] right-[-20%] w-[600px] h-[600px] rounded-full opacity-[0.06]"
          style={{ background: "radial-gradient(circle, #f59e0b 0%, transparent 60%)" }}
        />
        <div
          className="absolute bottom-[10%] left-[-20%] w-[400px] h-[400px] rounded-full opacity-[0.04]"
          style={{ background: "radial-gradient(circle, #fbbf24 0%, transparent 60%)" }}
        />
      </div>

      {/* Page content with animation */}
      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="relative z-10 page-container pt-4"
        >
          <Outlet />
        </motion.main>
      </AnimatePresence>

      {/* Bottom navigation */}
      <BottomNav />
    </div>
  );
}
