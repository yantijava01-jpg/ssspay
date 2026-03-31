import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

// Layouts
import UserLayout   from "./layouts/UserLayout";
import AdminLayout  from "./layouts/AdminLayout";
import AuthLayout   from "./layouts/AuthLayout";

// Auth pages
import LoginPage    from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

// User pages
import HomePage         from "./pages/HomePage";
import PaymentPage      from "./pages/PaymentPage";
import TeamPage         from "./pages/TeamPage";
import ToolPage         from "./pages/ToolPage";
import ProfilePage      from "./pages/ProfilePage";
import TransactionsPage from "./pages/TransactionsPage";
import ServicePage      from "./pages/ServicePage";

// Admin pages
import AdminDashboard  from "./pages/admin/AdminDashboard";
import AdminUsers      from "./pages/admin/AdminUsers";
import AdminUserDetail from "./pages/admin/AdminUserDetail";
import AdminOrders     from "./pages/admin/AdminOrders";
import AdminUPIs       from "./pages/admin/AdminUPIs";
import AdminNotices    from "./pages/admin/AdminNotices";
import AdminSettings   from "./pages/admin/AdminSettings";

// ── Route Guards ─────────────────────────────────────────────────────────────
const PrivateRoute = ({ children }) => {
  const { isLoggedIn, loading } = useAuth();
  if (loading) return <FullPageLoader />;
  return isLoggedIn ? children : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children }) => {
  const { isLoggedIn, isAdmin, loading } = useAuth();
  if (loading) return <FullPageLoader />;
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  if (!isAdmin)    return <Navigate to="/" replace />;
  return children;
};

const GuestRoute = ({ children }) => {
  const { isLoggedIn, isAdmin, loading } = useAuth();
  if (loading) return <FullPageLoader />;
  if (isLoggedIn) return <Navigate to={isAdmin ? "/admin" : "/"} replace />;
  return children;
};

// ── Full page loader (bootstrap) ─────────────────────────────────────────────
const FullPageLoader = () => (
  <div className="min-h-dvh bg-dark-900 flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 rounded-full border-4 border-gold-500/30 border-t-gold-500 animate-spin" />
      <p className="text-white/50 text-sm">Loading SSSPay...</p>
    </div>
  </div>
);

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <Routes>
      {/* Guest routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login"    element={<GuestRoute><LoginPage /></GuestRoute>} />
        <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />
      </Route>

      {/* User routes */}
      <Route element={<PrivateRoute><UserLayout /></PrivateRoute>}>
        <Route path="/"              element={<HomePage />} />
        <Route path="/payment"       element={<PaymentPage />} />
        <Route path="/team"          element={<TeamPage />} />
        <Route path="/tool"          element={<ToolPage />} />
        <Route path="/profile"       element={<ProfilePage />} />
        <Route path="/transactions"  element={<TransactionsPage />} />
        <Route path="/service"       element={<ServicePage />} />
      </Route>

      {/* Admin routes */}
      <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
        <Route index                  element={<AdminDashboard />} />
        <Route path="users"           element={<AdminUsers />} />
        <Route path="users/:id"       element={<AdminUserDetail />} />
        <Route path="orders"          element={<AdminOrders />} />
        <Route path="upis"            element={<AdminUPIs />} />
        <Route path="notices"         element={<AdminNotices />} />
        <Route path="settings"        element={<AdminSettings />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
