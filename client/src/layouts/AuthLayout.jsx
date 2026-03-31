import { Outlet } from "react-router-dom";
import { motion } from "framer-motion";

export default function AuthLayout() {
  return (
    <div className="min-h-dvh bg-dark-900 flex flex-col relative overflow-hidden">
      {/* Ambient background orbs */}
      <div className="fixed inset-0 pointer-events-none">
        <div
          className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, #f59e0b 0%, transparent 70%)" }}
        />
        <div
          className="absolute bottom-[-20%] right-[-10%] w-[400px] h-[400px] rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #fbbf24 0%, transparent 70%)" }}
        />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(245,158,11,1) 1px, transparent 1px), linear-gradient(90deg, rgba(245,158,11,1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      {/* Logo header */}
      <div className="relative z-10 flex justify-center pt-12 pb-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center gap-2"
        >
          <div className="w-16 h-16 rounded-2xl bg-gold-gradient flex items-center justify-center shadow-gold-lg">
            <span className="text-dark-900 font-black text-2xl tracking-tight">S³</span>
          </div>
          <h1 className="text-gold-gradient font-black text-2xl tracking-wide">SSSPay</h1>
          <p className="text-white/30 text-xs tracking-widest uppercase">Fast · Secure · Smart</p>
        </motion.div>
      </div>

      {/* Page content */}
      <div className="relative z-10 flex-1 flex items-start justify-center px-4 pb-8">
        <div className="w-full max-w-sm">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
