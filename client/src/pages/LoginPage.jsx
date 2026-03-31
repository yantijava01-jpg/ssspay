import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage } from "../services/api";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate  = useNavigate();

  const [form, setForm]       = useState({ phone: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.phone || !form.password) {
      toast.error("Please fill in all fields.");
      return;
    }
    setLoading(true);
    try {
      const user = await login(form.phone, form.password);
      toast.success("Welcome back! 👋");
      navigate(user.role === "admin" ? "/admin" : "/", { replace: true });
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
      className="mt-4"
    >
      <div className="glass-card p-6">
        <h2 className="text-white font-bold text-2xl mb-1">Welcome back</h2>
        <p className="text-white/40 text-sm mb-6">Sign in to your SSSPay account</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Phone */}
          <div>
            <label className="text-white/50 text-xs uppercase tracking-wider mb-1.5 block">
              Phone Number
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 text-sm font-medium">
                +91
              </span>
              <input
                type="tel"
                placeholder="9876543210"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, "") })}
                maxLength={15}
                className="input-field pl-12"
                autoComplete="tel"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="text-white/50 text-xs uppercase tracking-wider mb-1.5 block">
              Password
            </label>
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="input-field pr-12"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors text-sm"
              >
                {showPass ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="btn-gold w-full mt-2 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-dark-900/40 border-t-dark-900 rounded-full animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign In →"
            )}
          </button>
        </form>

        {/* Footer */}
        <p className="text-white/30 text-sm text-center mt-6">
          Don't have an account?{" "}
          <Link to="/register" className="text-gold-400 font-semibold hover:text-gold-300 transition-colors">
            Register
          </Link>
        </p>
      </div>

      {/* Security note */}
      <p className="text-white/20 text-xs text-center mt-4 px-4">
        🔒 Your data is encrypted and secured
      </p>
    </motion.div>
  );
}
