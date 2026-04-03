import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { useSettings } from "../context/SettingsContext";
import { orderService } from "../services/orderService";
import { getErrorMessage } from "../services/api";
import PageHeader from "../components/ui/PageHeader";
import GlassCard from "../components/ui/GlassCard";
import useCountdown from "../hooks/useCountdown";
import useCopyToClipboard from "../hooks/useCopyToClipboard";

const COUNTDOWN_SECS = 180;

const TABS = [
  { id: "inr", label: "₹ INR Deposit", icon: "💰" },
  { id: "usdt", label: "₿ USDT Deposit", icon: "💎" },
];

export default function PaymentPage() {
  const { user } = useAuth();
  const { settings } = useSettings();
  const { copy, copied } = useCopyToClipboard();

  const [activeTab, setActiveTab] = useState("inr");
  const [amount, setAmount] = useState("");
  const [usdtAmount, setUsdtAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState(null);
  const [phase, setPhase] = useState("input");

  const countdown = useCountdown(COUNTDOWN_SECS, () => {
    toast.error("Payment window expired. Please try again.");
    setPhase("input");
    setOrder(null);
  });

  const quickAmounts = [100, 500, 1000, 2000, 5000, 10000];
  const usdtRate = settings.usdtRate || 83.5;
  const inrFromUsdt = usdtAmount ? (parseFloat(usdtAmount) * usdtRate).toFixed(2) : "0.00";
  const cashback = amount ? (parseFloat(amount) * 0.025).toFixed(2) : "0.00";

  // ── INR order submit ────────────────────────────────────────────────────────
  const handleINRSubmit = async (e) => {
    e.preventDefault();
    const parsed = parseFloat(amount);
    if (!parsed || parsed < (settings.minOrderAmount || 100)) {
      toast.error(`Minimum amount is ₹${settings.minOrderAmount || 100}`);
      return;
    }
    if (user?.isFrozen) {
      toast.error("Your account is frozen. Contact support.");
      return;
    }
    setLoading(true);
    try {
      const res = await orderService.createOrder({ amount: parsed });
      const data = res.data;
      setOrder(data);
      setPhase("processing");
      countdown.start(COUNTDOWN_SECS);
      window.open(data.whatsappUrl, "_blank");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // ── USDT redirect ───────────────────────────────────────────────────────────
  const handleUSDTSubmit = (e) => {
    e.preventDefault();
    const usdt = parseFloat(usdtAmount);
    if (!usdt || usdt <= 0) {
      toast.error("Enter a valid USDT amount.");
      return;
    }
    if (user?.isFrozen) {
      toast.error("Your account is frozen. Contact support.");
      return;
    }

    const supportNum = settings.supportWhatsapp || "919999999999";
    const message = `Hello Admin,\nUSDT Deposit Request\nUser: ${user?.phone} (ID: ${user?._id})\nUSDT Amount: ${usdt} USDT\nINR Equivalent: ₹${inrFromUsdt} (@ ₹${usdtRate}/USDT)\nPlease confirm wallet address.`;
    const url = `https://wa.me/${supportNum.replace(/[\s+\-()]/g, "")}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
    toast.success("Opening WhatsApp for USDT deposit...");
  };

  const handleDone = () => {
    setPhase("input");
    setOrder(null);
    setAmount("");
    countdown.reset();
  };

  return (
    <div className="space-y-4">
      <PageHeader title="Payment" subtitle="Deposit funds" />

      <AnimatePresence mode="wait">
        {/* ── INPUT PHASE ── */}
        {phase === "input" && (
          <motion.div
            key="input"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            className="space-y-4"
          >
            {/* Balance preview */}
            <GlassCard gold className="p-4" delay={0.05}>
              <div className="grid grid-cols-3 divide-x divide-white/5">
                {[
                  { label: "Balance", value: `₹${(user?.balance || 0).toFixed(2)}`, icon: "💰" },
                  { label: "Reward", value: `₹${(user?.reward || 0).toFixed(2)}`, icon: "⭐" },
                  { label: "Cashback", value: `${settings.cashbackRate || 2.5}%`, icon: "⚡" },
                ].map((s) => (
                  <div key={s.label} className="text-center px-2">
                    <p className="text-lg mb-0.5">{s.icon}</p>
                    <p className="text-white font-bold text-sm">{s.value}</p>
                    <p className="text-white/30 text-xs">{s.label}</p>
                  </div>
                ))}
              </div>
            </GlassCard>

            {/* Tab switcher */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-dark-700 rounded-2xl">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === tab.id
                      ? "bg-gold-gradient text-dark-900 shadow-gold"
                      : "text-white/40 hover:text-white/60"
                    }`}
                >
                  <span>{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">

              {/* ── INR TAB ── */}
              {activeTab === "inr" && (
                <motion.div
                  key="inr"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  <GlassCard className="p-5" animate={false}>
                    <p className="text-white/40 text-xs uppercase tracking-widest mb-4">
                      Enter INR Amount
                    </p>

                    {/* Quick amounts */}
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      {quickAmounts.map((q) => (
                        <button
                          key={q}
                          onClick={() => setAmount(String(q))}
                          className={`py-2 rounded-xl text-sm font-semibold border transition-all ${amount === String(q)
                              ? "bg-gold-500/20 border-gold-500/50 text-gold-400"
                              : "bg-white/5 border-white/10 text-white/60 hover:border-white/20"
                            }`}
                        >
                          ₹{q >= 1000 ? `${q / 1000}K` : q}
                        </button>
                      ))}
                    </div>

                    <form onSubmit={handleINRSubmit}>
                      <div className="relative mb-3">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gold-400 font-bold text-lg">₹</span>
                        <input
                          type="number"
                          placeholder="Enter custom amount"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          className="input-field pl-10 text-lg font-bold"
                          min={settings.minOrderAmount || 100}
                        />
                      </div>

                      {/* Cashback preview */}
                      {amount && parseFloat(amount) > 0 && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 mb-3 flex items-center justify-between"
                        >
                          <span className="text-emerald-400 text-sm">⚡ Instant cashback</span>
                          <span className="text-emerald-400 font-bold">+₹{cashback}</span>
                        </motion.div>
                      )}

                      <button
                        type="submit"
                        disabled={loading || !amount || parseFloat(amount) < 1}
                        className="btn-gold w-full flex items-center justify-center gap-2"
                      >
                        {loading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-dark-900/40 border-t-dark-900 rounded-full animate-spin" />
                            Creating order...
                          </>
                        ) : (
                          "📲 Pay via WhatsApp"
                        )}
                      </button>
                    </form>
                  </GlassCard>

                  {/* How it works */}
                  <GlassCard className="p-4" animate={false}>
                    <p className="text-white/40 text-xs uppercase tracking-widest mb-3">
                      How it works
                    </p>
                    <div className="space-y-2.5">
                      {[
                        ["1", "Enter your deposit amount above"],
                        ["2", "WhatsApp opens with your order details"],
                        ["3", "Send payment screenshot to admin"],
                        ["4", "Balance + 2.5% cashback credited on approval"],
                      ].map(([n, text]) => (
                        <div key={n} className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-full bg-gold-500/20 border border-gold-500/30 flex items-center justify-center flex-shrink-0">
                            <span className="text-gold-400 text-xs font-bold">{n}</span>
                          </div>
                          <p className="text-white/60 text-sm">{text}</p>
                        </div>
                      ))}
                    </div>
                  </GlassCard>
                </motion.div>
              )}

              {/* ── USDT TAB ── */}
              {activeTab === "usdt" && (
                <motion.div
                  key="usdt"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  {/* Rate display */}
                  <GlassCard className="p-4 border-blue-500/20" animate={false}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-xl">
                          💎
                        </div>
                        <div>
                          <p className="text-white/40 text-xs">Current Rate</p>
                          <p className="text-white font-bold">1 USDT = ₹{usdtRate}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-white/30 text-xs">Set by admin</p>
                        <p className="text-blue-400 text-xs font-semibold">Live rate</p>
                      </div>
                    </div>
                  </GlassCard>

                  <GlassCard className="p-5" animate={false}>
                    <p className="text-white/40 text-xs uppercase tracking-widest mb-4">
                      Enter USDT Amount
                    </p>

                    <form onSubmit={handleUSDTSubmit} className="space-y-3">
                      <div>
                        <label className="text-white/50 text-xs block mb-1.5">USDT Amount</label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400 font-bold text-sm">
                            USDT
                          </span>
                          <input
                            type="number"
                            placeholder="0.00"
                            value={usdtAmount}
                            onChange={(e) => setUsdtAmount(e.target.value)}
                            className="input-field pl-16 text-lg font-bold"
                            min="1"
                            step="0.01"
                          />
                        </div>
                      </div>

                      {/* INR equivalent */}
                      {usdtAmount && parseFloat(usdtAmount) > 0 && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="space-y-2"
                        >
                          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-white/50 text-sm">INR Equivalent</span>
                              <span className="text-blue-400 font-bold text-lg">₹{inrFromUsdt}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-white/30 text-xs">Cashback (2.5%)</span>
                              <span className="text-emerald-400 text-xs font-semibold">
                                +₹{(parseFloat(inrFromUsdt) * 0.025).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {/* USDT submit → WhatsApp */}
                      <button
                        type="submit"
                        disabled={!usdtAmount || parseFloat(usdtAmount) <= 0}
                        className="w-full rounded-2xl py-4 font-bold text-white flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50"
                        style={{
                          background: "linear-gradient(135deg, #25d366, #128c7e)",
                          boxShadow: "0 4px 20px rgba(37,211,102,0.35)",
                        }}
                      >
                        <span className="text-xl">📱</span>
                        Send USDT Deposit Request
                      </button>
                    </form>
                  </GlassCard>

                  {/* USDT instructions */}
                  <GlassCard className="p-4 border-blue-500/10" animate={false}>
                    <p className="text-white/40 text-xs uppercase tracking-widest mb-3">
                      USDT Deposit Process
                    </p>
                    <div className="space-y-2.5">
                      {[
                        ["1", "Enter USDT amount and tap the button"],
                        ["2", "WhatsApp opens — admin shares wallet address"],
                        ["3", "Send USDT to the provided TRC20/ERC20 address"],
                        ["4", "Share transaction hash with admin via WhatsApp"],
                        ["5", "INR equivalent credited after confirmation"],
                      ].map(([n, text]) => (
                        <div key={n} className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center flex-shrink-0">
                            <span className="text-blue-400 text-xs font-bold">{n}</span>
                          </div>
                          <p className="text-white/60 text-sm">{text}</p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
                      <p className="text-amber-400 text-xs font-semibold mb-1">⚠️ Important</p>
                      <p className="text-amber-400/70 text-xs">
                        Only send USDT to the wallet address provided by admin via WhatsApp.
                        Do not send to any other address.
                      </p>
                    </div>
                  </GlassCard>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* ── PROCESSING PHASE (INR only) ── */}
        {phase === "processing" && order && (
          <motion.div
            key="processing"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            className="space-y-4"
          >
            {/* Countdown */}
            <GlassCard gold className="p-6 text-center" animate={false}>
              <div className="relative w-28 h-28 mx-auto mb-5">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(245,158,11,0.1)" strokeWidth="8" />
                  <circle
                    cx="50" cy="50" r="44" fill="none"
                    stroke="#f59e0b" strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 44}`}
                    strokeDashoffset={`${2 * Math.PI * 44 * (1 - countdown.percent / 100)}`}
                    style={{ transition: "stroke-dashoffset 1s linear" }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-gold-400 font-black text-2xl tabular-nums">
                    {countdown.formatted}
                  </span>
                  <span className="text-white/30 text-xs">remaining</span>
                </div>
              </div>
              <h2 className="text-white font-black text-xl mb-1">Order Processing</h2>
              <p className="text-white/40 text-sm">
                Complete your WhatsApp payment within the time limit
              </p>
            </GlassCard>

            {/* Order details */}
            <GlassCard className="p-5" animate={false}>
              <p className="text-white/40 text-xs uppercase tracking-widest mb-4">
                ORDER DETAILS
              </p>
              <div className="space-y-3">
                {[
                  { label: "Order ID", value: order.order?.orderId, mono: true },
                  { label: "Amount", value: `₹${order.order?.amount?.toLocaleString("en-IN")}` },
                  { label: "Cashback", value: `+₹${(order.order?.amount * 0.025).toFixed(2)}`, color: "text-emerald-400" },
                  { label: "Status", value: "⟳ Processing", color: "text-blue-400" },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-0">
                    <span className="text-white/40 text-sm">{row.label}</span>
                    <span className={`font-semibold text-sm ${row.color || "text-white"} ${row.mono ? "font-mono text-xs" : ""}`}>
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => copy(order.order?.orderId, "Order ID copied!")}
                className="btn-ghost w-full mt-4 text-sm flex items-center justify-center gap-2"
              >
                {copied ? "✅ Copied!" : "📋 Copy Order ID"}
              </button>
            </GlassCard>

            {/* WhatsApp button */}
            <button
              onClick={() => window.open(order.whatsappUrl, "_blank")}
              className="w-full rounded-2xl py-4 font-bold text-white flex items-center justify-center gap-3"
              style={{
                background: "linear-gradient(135deg, #25d366, #128c7e)",
                boxShadow: "0 4px 20px rgba(37,211,102,0.4)",
              }}
            >
              <span className="text-2xl">📱</span>
              Open WhatsApp to Pay
            </button>

            <button
              onClick={handleDone}
              className="btn-ghost w-full text-sm text-white/40"
            >
              Cancel & Create New Order
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}