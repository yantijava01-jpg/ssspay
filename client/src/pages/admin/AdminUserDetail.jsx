import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { adminService } from "../../services/adminService";
import { getErrorMessage } from "../../services/api";
import PageHeader from "../../components/ui/PageHeader";
import GlassCard from "../../components/ui/GlassCard";
import StatusBadge from "../../components/ui/StatusBadge";
import Modal from "../../components/ui/Modal";
import { InlineLoader } from "../../components/ui/LoadingSpinner";
import useApi from "../../hooks/useApi";

const UPI_STATUSES = ["enabled", "disabled", "risk", "failed"];

export default function AdminUserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data, loading, execute } = useApi(() => adminService.getUserById(id), [id]);

  const [balModal, setBalModal] = useState(false);
  const [balAmount, setBalAmount] = useState("");
  const [balType, setBalType] = useState("add");
  const [balDesc, setBalDesc] = useState("");
  const [saving, setSaving] = useState(false);

  // UPI status edit
  const [upiModal, setUpiModal] = useState(null); // upi object
  const [upiStatus, setUpiStatus] = useState("");
  const [upiNote, setUpiNote] = useState("");
  const [upiSaving, setUpiSaving] = useState(false);

  const user = data?.user;
  const upis = data?.upis || [];
  const orders = data?.recentOrders || [];
  const txSummary = data?.txSummary || {};

  // ── Balance adjust ──────────────────────────────────────────────────────────
  const handleBalanceAdjust = async () => {
    const amt = parseFloat(balAmount);
    if (!amt || amt <= 0) { toast.error("Enter a valid amount."); return; }
    setSaving(true);
    try {
      await adminService.adjustBalance(id, {
        amount: amt, type: balType, description: balDesc,
      });
      toast.success(`Balance ${balType === "add" ? "added" : "deducted"} successfully!`);
      setBalModal(false);
      setBalAmount(""); setBalDesc("");
      execute();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally { setSaving(false); }
  };

  // ── Status change ───────────────────────────────────────────────────────────
  const handleStatusChange = async (status) => {
    try {
      await adminService.updateUserStatus(id, { status });
      toast.success(`Status updated to ${status}`);
      execute();
    } catch (err) { toast.error(getErrorMessage(err)); }
  };

  const handleFreeze = async () => {
    try {
      await adminService.toggleFreeze(id);
      toast.success("Freeze status toggled.");
      execute();
    } catch (err) { toast.error(getErrorMessage(err)); }
  };

  // ── UPI status edit ─────────────────────────────────────────────────────────
  const openUpiModal = (upi) => {
    setUpiModal(upi);
    setUpiStatus(upi.status);
    setUpiNote(upi.adminNote || "");
  };

  const handleUpiSave = async () => {
    if (!upiModal) return;
    setUpiSaving(true);
    try {
      await adminService.updateUPI(upiModal._id, { status: upiStatus, adminNote: upiNote });
      toast.success("UPI status updated.");
      setUpiModal(null);
      execute();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally { setUpiSaving(false); }
  };

  if (loading) return (
    <div>
      <PageHeader title="User Detail" showBack />
      <InlineLoader />
    </div>
  );

  if (!user) return (
    <div>
      <PageHeader title="User Detail" showBack />
      <p className="text-white/40 text-center mt-8">User not found.</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <PageHeader title="User Detail" showBack />

      {/* Identity card */}
      <GlassCard gold className="p-6" animate={false}>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gold-gradient flex items-center justify-center text-dark-900 font-black text-xl flex-shrink-0">
              {user.phone.charAt(0)}
            </div>
            <div>
              <p className="text-white font-black text-xl font-mono">+91 {user.phone}</p>
              <p className="text-white/30 text-xs mt-0.5 font-mono">ID: {user._id}</p>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <StatusBadge status={user.status} />
                {user.isFrozen && (
                  <span className="badge bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs px-2 py-0.5 rounded-full">
                    🧊 Frozen
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2">
            {user.status === "pending" && <Btn color="green" onClick={() => handleStatusChange("active")}>✅ Approve</Btn>}
            {user.status === "active" && <Btn color="red" onClick={() => handleStatusChange("disabled")}>🚫 Disable</Btn>}
            {user.status === "disabled" && <Btn color="green" onClick={() => handleStatusChange("active")}>✅ Enable</Btn>}
            <Btn color="blue" onClick={handleFreeze}>
              {user.isFrozen ? "🔓 Unfreeze" : "🧊 Freeze"}
            </Btn>
            <Btn color="gold" onClick={() => setBalModal(true)}>💰 Adjust Balance</Btn>
          </div>
        </div>
      </GlassCard>

      {/* Balance row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Balance", value: `₹${user.balance.toFixed(2)}`, color: "text-gold-400" },
          { label: "Reward", value: `₹${user.reward.toFixed(2)}`, color: "text-emerald-400" },
          { label: "Total Deposits", value: `₹${user.totalDeposits.toFixed(2)}`, color: "text-blue-400" },
          { label: "Total Withdrawals", value: `₹${user.totalWithdrawals.toFixed(2)}`, color: "text-red-400" },
        ].map((s) => (
          <GlassCard key={s.label} className="p-4" animate={false}>
            <p className="text-white/30 text-xs mb-1">{s.label}</p>
            <p className={`font-black text-xl ${s.color}`}>{s.value}</p>
          </GlassCard>
        ))}
      </div>

      {/* Transaction summary */}
      <GlassCard className="p-5" animate={false}>
        <p className="text-white/40 text-xs uppercase tracking-widest mb-4">Transaction Summary</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { type: "deposit", label: "Deposits", color: "text-gold-400" },
            { type: "reward", label: "Rewards", color: "text-emerald-400" },
            { type: "referral", label: "Referrals", color: "text-blue-400" },
            { type: "withdraw", label: "Withdrawals", color: "text-red-400" },
          ].map((t) => (
            <div key={t.type} className="bg-dark-700/50 rounded-xl p-3">
              <p className="text-white/30 text-xs mb-1">{t.label}</p>
              <p className={`font-bold text-lg ${t.color}`}>
                ₹{(txSummary[t.type] || 0).toFixed(2)}
              </p>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* ✅ All UPIs — now shows multiple */}
      <GlassCard className="p-5" animate={false}>
        <div className="flex items-center justify-between mb-4">
          <p className="text-white/40 text-xs uppercase tracking-widest">
            UPI IDs ({upis.length})
          </p>
        </div>

        {upis.length === 0 ? (
          <p className="text-white/30 text-sm text-center py-4">No UPI IDs submitted.</p>
        ) : (
          <div className="space-y-3">
            {upis.map((upi, i) => (
              <div
                key={upi._id}
                className="flex items-center justify-between gap-3 p-3 bg-dark-700/50 rounded-xl border border-white/5"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-7 h-7 rounded-full bg-dark-600 border border-white/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-white/40 text-xs font-bold">{i + 1}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-white font-mono text-sm truncate">{upi.upiId}</p>
                    {upi.label && (
                      <p className="text-gold-400/60 text-xs">{upi.label}</p>
                    )}
                    <p className="text-white/25 text-xs mt-0.5">
                      {new Date(upi.createdAt).toLocaleDateString("en-IN")}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <StatusBadge status={upi.status} />
                  <button
                    onClick={() => openUpiModal(upi)}
                    className="px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10 text-xs transition-all"
                  >
                    ✏️ Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCard>

      {/* Account meta */}
      <GlassCard className="p-5" animate={false}>
        <p className="text-white/40 text-xs uppercase tracking-widest mb-4">Account Info</p>
        <div className="space-y-2">
          {[
            { label: "Referral Code", value: user.referralCode },
            { label: "Referred By", value: user.referredBy?.phone || "Direct" },
            { label: "IP Address", value: user.ipAddress || "—" },
            { label: "Device", value: user.deviceInfo ? user.deviceInfo.substring(0, 55) + "…" : "—" },
            { label: "Joined", value: new Date(user.createdAt).toLocaleString("en-IN") },
          ].map((r) => (
            <div key={r.label} className="flex items-start justify-between gap-4 py-2 border-b border-white/5 last:border-0">
              <span className="text-white/40 text-sm flex-shrink-0">{r.label}</span>
              <span className="text-white/70 text-xs text-right font-mono break-all">{r.value}</span>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Recent orders */}
      <GlassCard className="p-5" animate={false}>
        <p className="text-white/40 text-xs uppercase tracking-widest mb-4">Recent Orders</p>
        {orders.length === 0 ? (
          <p className="text-white/30 text-sm text-center py-4">No orders yet.</p>
        ) : (
          <div className="space-y-2">
            {orders.map((o) => (
              <div
                key={o._id}
                className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0"
              >
                <div>
                  <p className="text-white/70 text-sm font-mono">{o.orderId}</p>
                  <p className="text-white/30 text-xs">
                    {new Date(o.createdAt).toLocaleDateString("en-IN")}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-gold-400 font-bold text-sm">
                    ₹{(o.approvedAmount ?? o.amount).toFixed(2)}
                  </p>
                  <StatusBadge status={o.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCard>

      {/* ── Balance modal ── */}
      <Modal isOpen={balModal} onClose={() => setBalModal(false)} title="Adjust Balance">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {["add", "deduct"].map((t) => (
              <button
                key={t}
                onClick={() => setBalType(t)}
                className={`py-3 rounded-xl font-semibold text-sm border transition-all capitalize ${balType === t
                    ? t === "add"
                      ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
                      : "bg-red-500/20 border-red-500/40 text-red-400"
                    : "bg-white/5 border-white/10 text-white/50"
                  }`}
              >
                {t === "add" ? "➕ Add" : "➖ Deduct"}
              </button>
            ))}
          </div>

          <div>
            <label className="text-white/40 text-xs uppercase tracking-wider block mb-1.5">
              Amount (₹)
            </label>
            <input
              type="number" placeholder="Enter amount"
              value={balAmount} onChange={(e) => setBalAmount(e.target.value)}
              className="input-field" min="1"
            />
          </div>

          <div>
            <label className="text-white/40 text-xs uppercase tracking-wider block mb-1.5">
              Description <span className="normal-case text-white/20">(optional)</span>
            </label>
            <input
              type="text" placeholder="e.g. Manual deposit"
              value={balDesc} onChange={(e) => setBalDesc(e.target.value)}
              className="input-field"
            />
          </div>

          {balAmount && parseFloat(balAmount) > 0 && (
            <div className={`rounded-xl p-3 flex items-center justify-between border ${balType === "add"
                ? "bg-emerald-500/10 border-emerald-500/20"
                : "bg-red-500/10 border-red-500/20"
              }`}>
              <span className="text-white/60 text-sm">New balance</span>
              <span className={`font-black text-lg ${balType === "add" ? "text-emerald-400" : "text-red-400"}`}>
                ₹{(user.balance + (balType === "add" ? 1 : -1) * parseFloat(balAmount || 0)).toFixed(2)}
              </span>
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={() => setBalModal(false)} className="btn-ghost flex-1 text-sm py-2.5">
              Cancel
            </button>
            <button
              onClick={handleBalanceAdjust}
              disabled={saving}
              className="btn-gold flex-1 text-sm py-2.5 flex items-center justify-center gap-2"
            >
              {saving
                ? <><div className="w-4 h-4 border-2 border-dark-900/40 border-t-dark-900 rounded-full animate-spin" />Saving...</>
                : "Confirm"}
            </button>
          </div>
        </div>
      </Modal>

      {/* ── UPI status modal ── */}
      <Modal isOpen={!!upiModal} onClose={() => setUpiModal(null)} title="Update UPI Status">
        {upiModal && (
          <div className="space-y-4">
            <div className="glass-card p-3">
              <p className="text-white/40 text-xs mb-1">UPI ID</p>
              <p className="text-white font-mono font-bold">{upiModal.upiId}</p>
              {upiModal.label && (
                <p className="text-gold-400/60 text-xs mt-0.5">{upiModal.label}</p>
              )}
            </div>

            <div>
              <label className="text-white/40 text-xs uppercase tracking-wider block mb-2">
                New Status
              </label>
              <div className="grid grid-cols-2 gap-2">
                {UPI_STATUSES.map((s) => (
                  <button
                    key={s}
                    onClick={() => setUpiStatus(s)}
                    className={`py-2.5 rounded-xl text-sm font-semibold border transition-all capitalize ${upiStatus === s
                        ? "bg-gold-500/20 border-gold-500/40 text-gold-400"
                        : "bg-white/5 border-white/10 text-white/50 hover:border-white/20"
                      }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-white/40 text-xs uppercase tracking-wider block mb-1.5">
                Admin Note <span className="normal-case text-white/20">(optional)</span>
              </label>
              <input
                type="text"
                placeholder="Reason for status change"
                value={upiNote}
                onChange={(e) => setUpiNote(e.target.value)}
                className="input-field"
              />
            </div>

            <div className="flex gap-3">
              <button onClick={() => setUpiModal(null)} className="btn-ghost flex-1 text-sm py-2.5">
                Cancel
              </button>
              <button
                onClick={handleUpiSave}
                disabled={upiSaving}
                className="btn-gold flex-1 text-sm py-2.5 flex items-center justify-center gap-2"
              >
                {upiSaving
                  ? <><div className="w-4 h-4 border-2 border-dark-900/40 border-t-dark-900 rounded-full animate-spin" />Saving...</>
                  : "Save Changes"}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function Btn({ children, color, onClick }) {
  const colors = {
    green: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20",
    red: "bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20",
    blue: "bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20",
    gold: "bg-gold-500/10 text-gold-400 border-gold-500/20 hover:bg-gold-500/20",
    purple: "bg-purple-500/10 text-purple-400 border-purple-500/20 hover:bg-purple-500/20",
  };
  return (
    <button
      onClick={onClick}
      className={`px-3 py-2 rounded-xl text-sm font-semibold border transition-all ${colors[color]}`}
    >
      {children}
    </button>
  );
}