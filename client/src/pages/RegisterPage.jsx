import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { authService } from "../services/authService";
import { getErrorMessage } from "../services/api";

export default function RegisterPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    phone: "",
    password: "",
    confirmPassword: "",
    referralCode: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.phone || !form.password) {
      toast.error("Phone and password are required.");
      return;
    }
    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await authService.register({
        phone: form.phone,
        password: form.password,
        referralCode: form.referralCode || undefined,
      });
      setDone(true);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // Success screen
  if (done) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mt-8"
      >
        <div className="glass-card-gold p-8 text-center">
          <div className="w-20 h-20 rounded-3xl bg-gold-gradient flex items-center justify-center mx-auto mb-5 shadow-gold-lg">
            <span className="text-4xl">✅</span>
          </div>
          <h2 className="text-white font-black text-2xl mb-2">Registration Successful!</h2>
          <p className="text-white/50 text-sm mb-6 leading-relaxed">
            Your account is <span className="text-gold-400 font-semibold">pending admin approval</span>.
            You'll be able to login once approved.
          </p>
          <button onClick={() => navigate("/login")} className="btn-gold w-full">
            Go to Login →
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
      className="mt-4"
    >
      <div className="glass-card p-6">
        <h2 className="text-white font-bold text-2xl mb-1">Create Account</h2>
        <p className="text-white/40 text-sm mb-6">Join SSSPay and earn cashback instantly</p>

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
                placeholder="Min 6 characters"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="input-field pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 text-sm"
              >
                {showPass ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          {/* Confirm password */}
          <div>
            <label className="text-white/50 text-xs uppercase tracking-wider mb-1.5 block">
              Confirm Password
            </label>
            <input
              type="password"
              placeholder="Re-enter password"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              className="input-field"
            />
            {form.confirmPassword && form.password !== form.confirmPassword && (
              <p className="text-red-400 text-xs mt-1">Passwords do not match</p>
            )}
          </div>

          {/* Referral code */}
          <div>
            <label className="text-white/50 text-xs uppercase tracking-wider mb-1.5 block">
              Referral Code <span className="text-white/20 normal-case">(optional)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. SSS1234AB"
              value={form.referralCode}
              onChange={(e) => setForm({ ...form, referralCode: e.target.value.toUpperCase() })}
              className="input-field"
              maxLength={20}
            />
          </div>

          {/* Perks reminder */}
          <div className="glass-card p-3 flex gap-3 items-start border-gold-500/20">
            <span className="text-xl flex-shrink-0">🎁</span>
            <div>
              <p className="text-white/80 text-xs font-semibold">Earn with every deposit</p>
              <p className="text-white/40 text-xs mt-0.5">2.5% instant cashback + 0.3% referral bonus</p>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-gold w-full flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-dark-900/40 border-t-dark-900 rounded-full animate-spin" />
                Creating account...
              </>
            ) : (
              "Create Account →"
            )}
          </button>
        </form>

        <p className="text-white/30 text-sm text-center mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-gold-400 font-semibold hover:text-gold-300">
            Sign In
          </Link>
        </p>
      </div>
    </motion.div>
  );
}
