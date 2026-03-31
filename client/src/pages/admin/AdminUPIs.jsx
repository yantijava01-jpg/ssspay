// AdminUPIs — full production version
import { useState } from "react";
import toast from "react-hot-toast";
import { adminService } from "../../services/adminService";
import { getErrorMessage } from "../../services/api";
import AdminTable from "../../components/ui/AdminTable";
import StatusBadge from "../../components/ui/StatusBadge";
import Modal from "../../components/ui/Modal";
import useApi from "../../hooks/useApi";

const UPI_STATUSES   = ["enabled", "disabled", "risk", "failed"];
const FILTER_OPTIONS = ["", ...UPI_STATUSES];
const STATUS_COLORS  = {
  enabled:  "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  disabled: "bg-red-500/20 text-red-400 border-red-500/30",
  risk:     "bg-amber-500/20 text-amber-400 border-amber-500/30",
  failed:   "bg-red-500/20 text-red-400 border-red-500/30",
};

export default function AdminUPIs() {
  const [filter, setFilter] = useState("");
  const [modal, setModal]   = useState(null);
  const [form, setForm]     = useState({ status: "", adminNote: "" });
  const [saving, setSaving] = useState(false);

  const { data, loading, execute } = useApi(
    () => adminService.getAllUPIs(filter ? { status: filter } : {}),
    [filter]
  );

  const upis = data?.upis || [];

  const openModal = (upi) => { setModal(upi); setForm({ status: upi.status, adminNote: upi.adminNote || "" }); };

  const handleUpdate = async () => {
    setSaving(true);
    try {
      await adminService.updateUPI(modal._id, form);
      toast.success("UPI status updated.");
      setModal(null);
      execute();
    } catch (err) { toast.error(getErrorMessage(err)); }
    finally { setSaving(false); }
  };

  const columns = [
    { key: "user",      label: "User",      render: (u) => <span className="text-white/70 text-sm">···{u.userId?.phone?.slice(-7) || "—"}</span> },
    { key: "upiId",     label: "UPI ID",    render: (u) => <span className="text-white font-mono text-xs">{u.upiId}</span> },
    { key: "status",    label: "Status",    render: (u) => <StatusBadge status={u.status} /> },
    { key: "adminNote", label: "Note",      render: (u) => <span className="text-white/30 text-xs">{u.adminNote || "—"}</span> },
    { key: "createdAt", label: "Submitted", render: (u) => <span className="text-white/30 text-xs">{new Date(u.createdAt).toLocaleDateString("en-IN")}</span> },
    { key: "actions",   label: "Actions",   render: (u) => (
      <button onClick={() => openModal(u)} className="text-xs px-3 py-1.5 rounded-lg bg-white/5 text-white/60 border border-white/10 hover:bg-white/10 transition-colors">✏️ Edit</button>
    )},
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-white font-black text-2xl">UPI Management</h1>
        <p className="text-white/40 text-sm">{upis.length} UPI IDs submitted</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {FILTER_OPTIONS.map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all capitalize ${filter === s ? "bg-gold-500/20 border-gold-500/40 text-gold-400" : "bg-white/5 border-white/10 text-white/50"}`}>
            {s || "All"}
          </button>
        ))}
      </div>

      <AdminTable columns={columns} data={upis} loading={loading} emptyText="No UPI IDs found" />

      <Modal isOpen={!!modal} onClose={() => setModal(null)} title="Update UPI Status">
        {modal && (
          <div className="space-y-4">
            <div className="glass-card p-3">
              <p className="text-white/40 text-xs">UPI ID</p>
              <p className="text-white font-mono text-sm">{modal.upiId}</p>
            </div>
            <div>
              <label className="text-white/50 text-xs mb-2 block">Status</label>
              <div className="grid grid-cols-2 gap-2">
                {UPI_STATUSES.map((s) => (
                  <button key={s} onClick={() => setForm({ ...form, status: s })}
                    className={`py-2.5 rounded-xl text-xs font-semibold border transition-all capitalize ${form.status === s ? STATUS_COLORS[s] : "bg-white/5 border-white/10 text-white/40"}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-white/50 text-xs mb-1.5 block">Admin Note (optional)</label>
              <input type="text" placeholder="Reason for status change..." value={form.adminNote} onChange={(e) => setForm({ ...form, adminNote: e.target.value })} className="input-field text-sm" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setModal(null)} className="btn-ghost flex-1">Cancel</button>
              <button onClick={handleUpdate} disabled={saving} className="btn-gold flex-1 flex items-center justify-center gap-2">
                {saving ? <div className="w-4 h-4 border-2 border-dark-900/40 border-t-dark-900 rounded-full animate-spin" /> : "Update Status"}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
