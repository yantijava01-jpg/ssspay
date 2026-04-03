import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { upiService } from "../services/miscService";
import { getErrorMessage } from "../services/api";
import PageHeader from "../components/ui/PageHeader";
import GlassCard from "../components/ui/GlassCard";
import StatusBadge from "../components/ui/StatusBadge";
import { InlineLoader } from "../components/ui/LoadingSpinner";
import Modal from "../components/ui/Modal";
import useApi from "../hooks/useApi";

const MAX_UPI = 7;

const STATUS_INFO = {
  enabled: { icon: "✅", text: "Active and verified.", color: "text-emerald-400" },
  disabled: { icon: "🚫", text: "Disabled by admin.", color: "text-red-400" },
  risk: { icon: "⚠️", text: "Under review for risk assessment.", color: "text-amber-400" },
  failed: { icon: "❌", text: "Verification failed. Contact support.", color: "text-red-400" },
};

export default function ToolPage() {
  const { data, loading, execute } = useApi(() => upiService.getMyUPIs(), []);

  const [showForm, setShowForm] = useState(false);
  const [upiId, setUpiId] = useState("");
  const [label, setLabel] = useState("");
  const [submitting, setSub] = useState(false);
  const [deleteModal, setDeleteModal] = useState(null);

  const upis = data?.upis || [];
  const remaining = data?.remaining ?? MAX_UPI;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!upiId.trim()) return;
    setSub(true);
    try {
      await upiService.submitUPI({ upiId, label });
      toast.success("UPI ID added successfully!");
      setUpiId("");
      setLabel("");
      setShowForm(false);
      execute();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSub(false);
    }
  };

  if (loading) return (
    <div className="space-y-4">
      <PageHeader title="Tool" subtitle="UPI Management" />
      <InlineLoader />
    </div>
  );

  return (
    <div className="space-y-4">
      <PageHeader title="Tool" subtitle="UPI Management" />

      {/* Header stats */}
      <GlassCard gold className="p-4" delay={0}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/40 text-xs uppercase tracking-widest mb-1">
              UPI IDs Added
            </p>
            <div className="flex items-end gap-2">
              <span className="text-gold-gradient font-black text-3xl">{upis.length}</span>
              <span className="text-white/30 text-lg mb-0.5">/ {MAX_UPI}</span>
            </div>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center">
            <span className="text-3xl">💳</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4 bg-dark-600 rounded-full h-1.5 overflow-hidden">
          <motion.div
            className="h-full bg-gold-gradient rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${(upis.length / MAX_UPI) * 100}%` }}
            transition={{ duration: 0.6 }}
          />
        </div>
        <p className="text-white/30 text-xs mt-1.5">{remaining} slot{remaining !== 1 ? "s" : ""} remaining</p>
      </GlassCard>

      {/* Add new UPI button */}
      {remaining > 0 && (
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-gold w-full flex items-center justify-center gap-2"
        >
          {showForm ? "✕ Cancel" : "+ Add New UPI ID"}
        </button>
      )}

      {/* Add form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
          >
            <GlassCard className="p-5" animate={false}>
              <p className="text-white/40 text-xs uppercase tracking-widest mb-4">
                Add New UPI ID
              </p>
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="text-white/50 text-xs block mb-1.5">
                    UPI ID <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="yourname@upi"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value.toLowerCase())}
                    className="input-field"
                    autoComplete="off"
                    spellCheck={false}
                    required
                  />
                  <p className="text-white/20 text-xs mt-1">e.g. john@okaxis, name@paytm</p>
                </div>

                <div>
                  <label className="text-white/50 text-xs block mb-1.5">
                    Label <span className="text-white/20">(optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Savings, Business"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    className="input-field"
                    maxLength={30}
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting || !upiId.trim()}
                  className="btn-gold w-full flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-dark-900/40 border-t-dark-900 rounded-full animate-spin" />
                      Adding...
                    </>
                  ) : (
                    "Submit UPI ID →"
                  )}
                </button>
              </form>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* UPI list */}
      {upis.length === 0 ? (
        <GlassCard className="p-8 text-center" animate={false}>
          <p className="text-4xl mb-3 opacity-40">💳</p>
          <p className="text-white/50 font-semibold">No UPI IDs yet</p>
          <p className="text-white/25 text-sm mt-1">Add up to {MAX_UPI} UPI IDs above</p>
        </GlassCard>
      ) : (
        <div className="space-y-3">
          {upis.map((upi, i) => {
            const info = STATUS_INFO[upi.status] || STATUS_INFO.enabled;
            return (
              <motion.div
                key={upi._id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <GlassCard
                  className={`p-4 ${upi.status === "enabled" ? "border-emerald-500/10" : upi.status === "risk" ? "border-amber-500/10" : ""}`}
                  animate={false}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {/* Status dot */}
                      <div className="w-10 h-10 rounded-xl bg-dark-600 border border-white/5 flex items-center justify-center flex-shrink-0 text-lg">
                        {info.icon}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-white font-mono font-bold text-sm truncate">
                          {upi.upiId}
                        </p>
                        {upi.label && (
                          <p className="text-gold-400/70 text-xs mt-0.5">{upi.label}</p>
                        )}
                        <div className="flex items-center gap-2 mt-1.5">
                          <StatusBadge status={upi.status} />
                          <span className="text-white/20 text-xs">
                            {new Date(upi.createdAt).toLocaleDateString("en-IN")}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* UPI number badge */}
                    <div className="flex-shrink-0 w-7 h-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                      <span className="text-white/40 text-xs font-bold">{i + 1}</span>
                    </div>
                  </div>

                  {/* Status message */}
                  <div className={`mt-3 bg-dark-700/50 rounded-lg px-3 py-2 flex items-center gap-2 ${info.color}`}>
                    <span className="text-xs">{info.text}</span>
                  </div>

                  {/* Admin note */}
                  {upi.adminNote && (
                    <div className="mt-2 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
                      <p className="text-amber-400 text-xs">
                        <span className="font-semibold">Admin note: </span>
                        {upi.adminNote}
                      </p>
                    </div>
                  )}
                </GlassCard>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Info box */}
      <GlassCard className="p-4" animate={false}>
        <p className="text-white/40 text-xs uppercase tracking-widest mb-3">ℹ️ Information</p>
        <div className="space-y-2">
          {[
            `You can add up to ${MAX_UPI} UPI IDs`,
            "Admin reviews and sets status for each UPI",
            "Contact support if status shows Risk or Failed",
            "Label your UPIs to identify them easily",
          ].map((text, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="text-gold-500/60 text-xs mt-0.5">◆</span>
              <p className="text-white/50 text-sm">{text}</p>
            </div>
          ))}
        </div>
      </GlassCard>

      <div className="h-2" />
    </div>
  );
}