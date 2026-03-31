import { NavLink, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

const NAV_TABS = [
  { to: "/",        label: "Home",    icon: "🏠", iconActive: "🏠" },
  { to: "/payment", label: "Pay",     icon: "💸", iconActive: "💸" },
  { to: "/team",    label: "Team",    icon: "👥", iconActive: "👥" },
  { to: "/tool",    label: "Tool",    icon: "🔧", iconActive: "🔧" },
  { to: "/profile", label: "My",      icon: "👤", iconActive: "👤" },
];

// Center "Wallet" tab is the payment button — styled differently
const CENTER_INDEX = 1; // payment is index 1

export default function BottomNav() {
  const location = useLocation();

  return (
    <div className="bottom-nav">
      {/* Blur backdrop */}
      <div className="absolute inset-0 bg-dark-800/90 backdrop-blur-xl border-t border-white/5" />

      <div className="relative flex items-end justify-around px-2 pt-2 pb-2">
        {NAV_TABS.map((tab, idx) => {
          const isCenter = idx === CENTER_INDEX;
          const isActive = location.pathname === tab.to;

          return (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.to === "/"}
              className="flex-1 flex flex-col items-center"
            >
              {({ isActive: navActive }) => (
                <div className="flex flex-col items-center gap-1 relative">
                  {/* Center button — elevated wallet style */}
                  {isCenter ? (
                    <motion.div
                      whileTap={{ scale: 0.9 }}
                      className={`
                        w-14 h-14 rounded-2xl flex items-center justify-center
                        shadow-gold-lg -mt-6 transition-all duration-300
                        ${navActive
                          ? "bg-gold-gradient animate-pulse-gold"
                          : "bg-gold-gradient opacity-90"
                        }
                      `}
                    >
                      <span className="text-2xl">{tab.icon}</span>
                    </motion.div>
                  ) : (
                    <motion.div
                      whileTap={{ scale: 0.85 }}
                      className={`
                        w-10 h-10 rounded-xl flex items-center justify-center
                        transition-all duration-200
                        ${navActive ? "bg-gold-500/20" : "bg-transparent"}
                      `}
                    >
                      <span className={`text-xl transition-all ${navActive ? "scale-110" : "scale-100 opacity-50"}`}>
                        {tab.icon}
                      </span>
                    </motion.div>
                  )}

                  {/* Label */}
                  <span
                    className={`text-[10px] font-semibold tracking-wide transition-colors ${
                      isCenter
                        ? "text-gold-400 mt-0.5"
                        : navActive
                        ? "text-gold-400"
                        : "text-white/30"
                    }`}
                  >
                    {tab.label}
                  </span>

                  {/* Active dot */}
                  {navActive && !isCenter && (
                    <motion.div
                      layoutId="nav-dot"
                      className="absolute -bottom-1 w-1 h-1 rounded-full bg-gold-500"
                    />
                  )}
                </div>
              )}
            </NavLink>
          );
        })}
      </div>
    </div>
  );
}
