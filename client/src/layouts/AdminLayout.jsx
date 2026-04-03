import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";

const NAV_ITEMS = [
  { to: "/admin", label: "Dashboard", icon: "📊", end: true },
  { to: "/admin/users", label: "Users", icon: "👥" },
  { to: "/admin/orders", label: "Orders", icon: "📦" },
  { to: "/admin/transactions", label: "Transactions", icon: "💸" },
  { to: "/admin/upis", label: "UPI", icon: "💳" },
  { to: "/admin/notices", label: "Notices", icon: "📢" },
  { to: "/admin/settings", label: "Settings", icon: "⚙️" },
];

export default function AdminLayout() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-dvh bg-dark-900 flex">
      {/* ── Mobile drawer backdrop ── */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/60 z-40 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              className="fixed left-0 top-0 bottom-0 w-64 z-50 lg:hidden"
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
            >
              <SidebarContent
                navItems={NAV_ITEMS}
                user={user}
                onLogout={handleLogout}
                onClose={() => setSidebarOpen(false)}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Desktop sidebar ── */}
      <aside className="hidden lg:flex w-64 flex-shrink-0 sticky top-0 h-screen">
        <SidebarContent
          navItems={NAV_ITEMS}
          user={user}
          onLogout={handleLogout}
        />
      </aside>

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 border-b border-white/5 bg-dark-800/80 backdrop-blur sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          >
            ☰
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gold-gradient flex items-center justify-center">
              <span className="text-dark-900 font-black text-xs">S³</span>
            </div>
            <span className="text-gold-gradient font-bold text-sm">Admin Panel</span>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function SidebarContent({ navItems, user, onLogout, onClose }) {
  return (
    <div className="h-full bg-dark-800 border-r border-white/5 flex flex-col overflow-hidden">
      {/* Logo */}
      <div className="p-6 border-b border-white/5 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gold-gradient flex items-center justify-center shadow-gold">
              <span className="text-dark-900 font-black text-lg">S³</span>
            </div>
            <div>
              <p className="text-gold-gradient font-black text-lg leading-none">SSSPay</p>
              <p className="text-white/30 text-xs mt-0.5">Admin Panel</p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-white/40 hover:text-white transition-colors lg:hidden"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
                ? "bg-gold-500/15 text-gold-400 border border-gold-500/25"
                : "text-white/50 hover:text-white hover:bg-white/5"
              }`
            }
          >
            <span className="text-base flex-shrink-0">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* User + logout */}
      <div className="p-4 border-t border-white/5 flex-shrink-0">
        <div className="glass-card p-3 mb-3">
          <p className="text-white/40 text-xs">Logged in as</p>
          <p className="text-white font-semibold text-sm truncate">{user?.phone}</p>
          <span className="badge-warning text-xs mt-1 inline-block px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
            Admin
          </span>
        </div>
        <button
          onClick={onLogout}
          className="w-full btn-ghost text-sm py-2.5 text-red-400 border-red-500/20 hover:border-red-500/40 transition-colors"
        >
          🚪 Logout
        </button>
      </div>
    </div>
  );
}