import { useState } from "react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { adminService } from "../../services/adminService";
import { getErrorMessage } from "../../services/api";
import GlassCard from "../../components/ui/GlassCard";
import Modal from "../../components/ui/Modal";
import { InlineLoader } from "../../components/ui/LoadingSpinner";
import EmptyState from "../../components/ui/EmptyState";
import useApi from "../../hooks/useApi";

const EMPTY_FORM = { title: "", message: "", isPopup: false, priority: 0 };

export default function AdminNotices() {
  const { data, loading, execute } = useApi(() => adminService.getAllNotices(), []);
  const notices = data?.notices || [];

  const [modal, setModal]   = useState(false);
  const [editing, setEditing] = useState(null); // notice object if editing
  const [form, setForm]     = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setModal(true);
  };

  const openEdit = (notice) => {
    setEditing(notice);
    setForm({
      title:    notice.title,
      message:  notice.message,
      isPopup:  notice.isPopup,
      priority: notice.priority || 0,
    });
    setModal(true);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.message.trim()) {
      toast.error("Title and message are required."); return;
    }
    setSaving(true);
    try {
      if (editing) {
        await adminService.updateNotice(editing._id, form);
        toast.success("Notice updated.");
      } else {
        await adminService.createNotice(form);
        toast.success("Notice created and broadcast to all users!");
      }
      setModal(false);
      execute();
    } catch (err) { toast.error(getErrorMessage(err)); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    setDeleting(id);
    try {
      await adminService.deleteNotice(id);
      toast.success("Notice deleted.");
      execute();
    } catch (err) { toast.error(getErrorMessage(err)); }
    finally { setDeleting(null); }
  };

  const handleToggleActive = async (notice) => {
    try {
      await adminService.updateNotice(notice._id, { isActive: !notice.isActive });
      toast.success(`Notice ${notice.isActive ? "deactivated" : "activated"}.`);
      execute();
    } catch (err) { toast.error(getErrorMessage(err)); }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white font-black text-2xl">Notices</h1>
          <p className="text-white/40 text-sm">{notices.length} notices</p>
        </div>
        <button onClick={openCreate} className="btn-gold text-sm py-2.5 px-4">
          + Create Notice
        </button>
      </div>

      {/* Notice list */}
      {loading ? <InlineLoader /> : notices.length === 0 ? (
        <EmptyState
          icon="📢"
          title="No notices yet"
          subtitle="Create a notice to broadcast to all users"
          action={<button onClick={openCreate} className="btn-gold text-sm">Create First Notice</button>}
        />
      ) : (
        <div className="space-y-3">
          {notices.map((n, i) => (
            <motion.div
              key={n._id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className={`glass-card p-4 border transition-all ${
                n.isActive ? "border-white/10" : "border-white/5 opacity-50"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="text-white font-semibold text-sm">{n.title}</h3>
                    {n.isPopup && (
                      <span className="badge badge-warning text-xs">📢 Popup</span>
                    )}
                    {!n.isActive && (
                      <span className="badge badge-danger text-xs">Inactive</span>
                    )}
                    {n.priority > 0 && (
                      <span className="badge badge-info text-xs">P{n.priority}</span>
                    )}
                  </div>
                  <p className="text-white/40 text-xs line-clamp-2 leading-relaxed">{n.message}</p>
                  <p className="text-white/20 text-xs mt-1.5">
                    {new Date(n.createdAt).toLocaleDateString("en-IN")}
                    {n.expiresAt && ` · Expires ${new Date(n.expiresAt).toLocaleDateString("en-IN")}`}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => openEdit(n)}
                    className="text-xs px-2.5 py-1 rounded-lg bg-white/5 text-white/50 border border-white/10 hover:bg-white/10 transition-colors"
                  >✏️</button>
                  <button
                    onClick={() => handleToggleActive(n)}
                    className={`text-xs px-2.5 py-1 rounded-lg border transition-colors ${
                      n.isActive
                        ? "bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20"
                        : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
                    }`}
                  >{n.isActive ? "⏸" : "▶"}</button>
                  <button
                    onClick={() => handleDelete(n._id)}
                    disabled={deleting === n._id}
                    className="text-xs px-2.5 py-1 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors"
                  >
                    {deleting === n._id
                      ? <div className="w-3 h-3 border border-red-400/40 border-t-red-400 rounded-full animate-spin mx-auto" />
                      : "🗑"}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        isOpen={modal}
        onClose={() => setModal(false)}
        title={editing ? "Edit Notice" : "Create Notice"}
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="text-white/50 text-xs mb-1.5 block">Title *</label>
            <input
              type="text"
              placeholder="Notice title..."
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="input-field"
              maxLength={100}
            />
          </div>

          <div>
            <label className="text-white/50 text-xs mb-1.5 block">Message *</label>
            <textarea
              placeholder="Notice message..."
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="input-field resize-none"
              rows={4}
              maxLength={1000}
            />
            <p className="text-white/20 text-xs text-right mt-0.5">{form.message.length}/1000</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-white/50 text-xs mb-1.5 block">Priority</label>
              <input
                type="number"
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: parseInt(e.target.value) || 0 })}
                className="input-field"
                min={0} max={100}
              />
            </div>
            <div>
              <label className="text-white/50 text-xs mb-1.5 block">Type</label>
              <button
                onClick={() => setForm({ ...form, isPopup: !form.isPopup })}
                className={`w-full py-3 rounded-xl text-sm font-semibold border transition-all ${
                  form.isPopup
                    ? "bg-amber-500/20 border-amber-500/40 text-amber-400"
                    : "bg-white/5 border-white/10 text-white/40"
                }`}
              >
                {form.isPopup ? "📢 Popup Modal" : "📋 List Only"}
              </button>
            </div>
          </div>

          {form.isPopup && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
              <p className="text-amber-400 text-xs">⚠️ Popup notices appear as a modal when users open the app (once per session).</p>
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button onClick={() => setModal(false)} className="btn-ghost flex-1">Cancel</button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-gold flex-1 flex items-center justify-center gap-2"
            >
              {saving
                ? <div className="w-4 h-4 border-2 border-dark-900/40 border-t-dark-900 rounded-full animate-spin" />
                : editing ? "Save Changes" : "Create & Broadcast"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
