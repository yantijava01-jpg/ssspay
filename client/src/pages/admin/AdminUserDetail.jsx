import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { adminService } from "../../services/adminService";
import { getErrorMessage } from "../../services/api";
import GlassCard from "../../components/ui/GlassCard";
import StatusBadge from "../../components/ui/StatusBadge";
import Modal from "../../components/ui/Modal";
import { InlineLoader } from "../../components/ui/LoadingSpinner";
import useApi from "../../hooks/useApi";

export default function AdminUserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, loading, execute } = useApi(() => adminService.getUserById(id), [id]);

  const [balModal, setBalModal] = useState(false);
  const [balForm, setBalForm]   = useState({ type: "add", amount: "", description: "" });
  const [saving, setSaving]     = useState(false);

  const user         = data?.user;
  const upi          = data?.upi;
  const recentOrders = data?.recentOrders || [];
  const txSummary    = data?.txSummary    || {};

  const handleBalanceAdjust = async () => {
    if (!balForm.amount || parseFloat(balForm.amount) <= 0) { toast.error("Enter a valid amount."); return; }
    setSaving(true);
    try {
      await adminService.adjustBalance(id, balForm);
      toast.success(`Balance ${balForm.type === "add" ? "added" : "deducted"} successfully.`);
      setBalModal(false);
      setBalForm({ type: "add", amount: "", description: "" });
      execute();
    } catch (err) { toast.error(getErrorMessage(err)); }
    finally { setSaving(false); }
  };

  const handleStatusChange = async (status) => {
    try { await adminService.updateUserStatus(id, { status }); toast.success(`User ${status}.`); execute(); }
    catch (err) { toast.error(getErrorMessage(err)); }
  };

  const handleFreeze = async () => {
    try { await adminService.toggleFreeze(id); toast.success(user.isFrozen ? "User unfrozen." : "User frozen."); execute(); }
    catch (err) { toast.error(getErrorMessage(err)); }
  };

  if (loading) return <InlineLoader />;
  if (!user) return <div className="text-center py-20 text-white/40">User not found.</div>;

  return (
    <div className="space-y-5 max-w-3xl">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate("/admin/users")} className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors">←</button>
        <div>
          <h1 className="text-white font-black text-2xl">User Detail</h1>
          <p className="text-white/40 text-sm">···{user.phone.slice(-7)}</p>
        </div>
      </div>

      <GlassCard gold className="p-5" animate={false}>
        <div className="flex items-start gap-4 mb-5">
          <div className="w-14 h-14 rounded-2xl bg-gold-gradient flex items-center justify-center text-dark-900 font-black text-xl">{user.phone.charAt(0)}</div>
          <div className="flex-1">
            <h2 className="text-white font-bold text-xl">···{user.phone.slice(-7)}</h2>
            <p className="text-white/40 text-sm font-mono">{user.phone}</p>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <StatusBadge status={user.status} />
              {user.isFrozen && <span className="badge badge-info">🧊 Frozen</span>}
              <span className="badge badge-info">{user.role}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-5">
          {[
            { label: "Balance",     value: `₹${user.balance.toLocaleString("en-IN")}`,         color: "text-gold-400"    },
            { label: "Reward",      value: `₹${user.reward.toLocaleString("en-IN")}`,           color: "text-emerald-400" },
            { label: "Deposits",    value: `₹${user.totalDeposits.toLocaleString("en-IN")}`,    color: "text-blue-400"    },
            { label: "Withdrawals", value: `₹${user.totalWithdrawals.toLocaleString("en-IN")}`, color: "text-red-400"     },
          ].map((s) => (
            <div key={s.label} className="bg-dark-700/50 rounded-xl p-3">
              <p className="text-white/30 text-xs mb-0.5">{s.label}</p>
              <p className={`font-black text-lg ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        <div className="space-y-2 text-sm border-t border-white/5 pt-4 mb-5">
          {[
            { label: "Referral Code", value: user.referralCode },
            { label: "IP Address",    value: user.ipAddress || "Unknown" },
            { label: "Joined",        value: new Date(user.createdAt).toLocaleString("en-IN") },
          ].map((r) => (
            <div key={r.label} className="flex items-start justify-between gap-2">
              <span className="text-white/30 flex-shrink-0">{r.label}</span>
              <span className="text-white/70 text-right font-mono text-xs break-all">{r.value}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <button onClick={() => setBalModal(true)} className="btn-gold text-sm py-2 flex-1">💰 Adjust Balance</button>
          {user.status !== "active"   && <button onClick={() => handleStatusChange("active")}   className="text-sm px-4 py-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 transition-colors">✓ Activate</button>}
          {user.status !== "disabled" && <button onClick={() => handleStatusChange("disabled")} className="text-sm px-4 py-2 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-colors">✗ Disable</button>}
          <button onClick={handleFreeze} className="text-sm px-4 py-2 rounded-xl bg-blue-500/10 text-blue-300 border border-blue-500/20 hover:bg-blue-500/20 transition-colors">
            {user.isFrozen ? "🔓 Unfreeze" : "🧊 Freeze"}
          </button>
        </div>
      </GlassCard>

      {upi && (
        <GlassCard className="p-5" animate={false}>
          <p className="text-white/40 text-xs uppercase tracking-widest mb-3">💳 UPI</p>
          <div className="flex items-center justify-between">
            <p className="text-white font-mono text-sm">{upi.upiId}</p>
            <StatusBadge status={upi.status} />
          </div>
          {upi.adminNote && <p className="text-white/40 text-xs mt-2">Note: {upi.adminNote}</p>}
        </GlassCard>
      )}

      <GlassCard className="p-5" animate={false}>
        <p className="text-white/40 text-xs uppercase tracking-widest mb-3">📊 Transaction Summary</p>
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(txSummary).map(([type, total]) => (
            <div key={type} className="bg-dark-700/50 rounded-xl p-3">
              <p className="text-white/30 text-xs capitalize mb-0.5">{type}</p>
              <p className="text-white font-bold">₹{Number(total).toFixed(2)}</p>
            </div>
          ))}
        </div>
      </GlassCard>

      {recentOrders.length > 0 && (
        <GlassCard className="p-5" animate={false}>
          <p className="text-white/40 text-xs uppercase tracking-widest mb-3">📦 Recent Orders</p>
          <div className="space-y-2">
            {recentOrders.map((o) => (
              <div key={o._id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                <div>
                  <p className="text-white/70 font-mono text-xs">{o.orderId}</p>
                  <p className="text-white/30 text-xs">{new Date(o.createdAt).toLocaleDateString("en-IN")}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gold-400 font-bold text-sm">₹{o.amount.toLocaleString("en-IN")}</span>
                  <StatusBadge status={o.status} />
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      <Modal isOpen={balModal} onClose={() => setBalModal(false)} title="Adjust Balance">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            {["add", "deduct"].map((t) => (
              <button key={t} onClick={() => setBalForm({ ...balForm, type: t })}
                className={`py-2.5 rounded-xl text-sm font-semibold border transition-all capitalize ${
                  balForm.type === t
                    ? t === "add" ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400" : "bg-red-500/20 border-red-500/40 text-red-400"
                    : "bg-white/5 border-white/10 text-white/40"
                }`}
              >{t === "add" ? "➕ Add" : "➖ Deduct"}</button>
            ))}
          </div>
          <div>
            <label className="text-white/50 text-xs mb-1.5 block">Amount (₹)</label>
            <input type="number" placeholder="Enter amount" value={balForm.amount} onChange={(e) => setBalForm({ ...balForm, amount: e.target.value })} className="input-field" min={1} />
          </div>
          <div>
            <label className="text-white/50 text-xs mb-1.5 block">Description (optional)</label>
            <input type="text" placeholder="Reason..." value={balForm.description} onChange={(e) => setBalForm({ ...balForm, description: e.target.value })} className="input-field" />
          </div>
          <div className="flex gap-3 pt-1">
            <button onClick={() => setBalModal(false)} className="btn-ghost flex-1">Cancel</button>
            <button onClick={handleBalanceAdjust} disabled={saving} className="btn-gold flex-1 flex items-center justify-center gap-2">
              {saving ? <div className="w-4 h-4 border-2 border-dark-900/40 border-t-dark-900 rounded-full animate-spin" /> : "Confirm"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
