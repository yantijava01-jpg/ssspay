import { useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { upiService } from "../services/miscService";
import { getErrorMessage } from "../services/api";
import PageHeader from "../components/ui/PageHeader";
import GlassCard from "../components/ui/GlassCard";
import StatusBadge from "../components/ui/StatusBadge";
import { InlineLoader } from "../components/ui/LoadingSpinner";
import useApi from "../hooks/useApi";

const STATUS_INFO = {
  enabled:  { icon: "✅", text: "Your UPI ID is active and verified.", color: "text-emerald-400" },
  disabled: { icon: "🚫", text: "Your UPI ID has been disabled by admin.", color: "text-red-400" },
  risk:     { icon: "⚠️", text: "Your UPI ID is under review for risk assessment.", color: "text-amber-400" },
  failed:   { icon: "❌", text: "Your UPI ID verification failed. Contact support.", color: "text-red-400" },
};

export default function ToolPage() {
  const { data, loading, setData } = useApi(() => upiService.getMyUPI(), []);

  const [upiId, setUpiId]     = useState("");
  const [submitting, setSub]  = useState(false);

  const upi = data?.upi;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!upiId.trim()) return;
    setSub(true);
    try {
      const res = await upiService.submitUPI({ upiId });
      setData({ upi: res.data.upi });
      toast.success("UPI ID submitted successfully!");
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

  const statusInfo = upi ? STATUS_INFO[upi.status] || STATUS_INFO.enabled : null;

  return (
    <div className="space-y-4">
      <PageHeader title="Tool" subtitle="UPI Management" />

      {/* Existing UPI */}
      {upi ? (
        <GlassCard gold className="p-5" delay={0}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center">
              <span className="text-2xl">💳</span>
            </div>
            <div>
              <p className="text-white/40 text-xs uppercase tracking-wider">UPI ID</p>
              <p className="text-white font-bold text-lg font-mono">{upi.upiId}</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-white/5">
              <span className="text-white/40 text-sm">Status</span>
              <StatusBadge status={upi.status} />
            </div>
            <div className="flex items-center justify-between py-2 border-b border-white/5">
              <span className="text-white/40 text-sm">Submitted</span>
              <span className="text-white/70 text-sm">
                {new Date(upi.createdAt).toLocaleDateString("en-IN")}
              </span>
            </div>
            {upi.adminNote && (
              <div className="flex items-start justify-between py-2">
                <span className="text-white/40 text-sm">Admin Note</span>
                <span className="text-white/60 text-sm text-right max-w-[60%]">{upi.adminNote}</span>
              </div>
            )}
          </div>

          {/* Status message */}
          {statusInfo && (
            <div className="mt-4 bg-dark-700/50 rounded-xl p-3 flex items-center gap-2">
              <span className="text-xl">{statusInfo.icon}</span>
              <p className={`text-sm ${statusInfo.color}`}>{statusInfo.text}</p>
            </div>
          )}

          <p className="text-white/25 text-xs text-center mt-4">
            To update your UPI ID, please contact support
          </p>
        </GlassCard>
      ) : (
        /* Submit UPI form */
        <GlassCard className="p-5" delay={0}>
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-3xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center mx-auto mb-3">
              <span className="text-3xl">💳</span>
            </div>
            <h2 className="text-white font-bold text-lg">Submit Your UPI ID</h2>
            <p className="text-white/40 text-sm mt-1">
              You can only submit once. Contact support to make changes.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-white/50 text-xs uppercase tracking-wider mb-1.5 block">
                UPI ID
              </label>
              <input
                type="text"
                placeholder="yourname@upi"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value.toLowerCase())}
                className="input-field"
                autoComplete="off"
                spellCheck={false}
              />
              <p className="text-white/20 text-xs mt-1.5">
                Format: name@bankname (e.g. john@okaxis)
              </p>
            </div>

            <button
              type="submit"
              disabled={submitting || !upiId.trim()}
              className="btn-gold w-full flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-dark-900/40 border-t-dark-900 rounded-full animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit UPI ID →"
              )}
            </button>
          </form>
        </GlassCard>
      )}

      {/* Info box */}
      <GlassCard className="p-4" delay={0.1}>
        <p className="text-white/40 text-xs uppercase tracking-widest mb-3">ℹ️ Information</p>
        <div className="space-y-2.5">
          {[
            "UPI ID is used for identity verification",
            "Admin reviews and approves your UPI",
            "Contact support if status shows Risk or Failed",
            "You cannot change your UPI after submission",
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
