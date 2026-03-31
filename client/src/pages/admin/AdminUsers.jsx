import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { adminService } from "../../services/adminService";
import { getErrorMessage } from "../../services/api";
import GlassCard from "../../components/ui/GlassCard";
import AdminTable from "../../components/ui/AdminTable";
import StatusBadge from "../../components/ui/StatusBadge";
import Pagination from "../../components/ui/Pagination";
import Modal from "../../components/ui/Modal";
import useApi from "../../hooks/useApi";

const STATUS_FILTERS = [
  { value: "",         label: "All"      },
  { value: "pending",  label: "Pending"  },
  { value: "active",   label: "Active"   },
  { value: "disabled", label: "Disabled" },
];

export default function AdminUsers() {
  const [searchParams]          = useSearchParams();
  const [status, setStatus]     = useState(searchParams.get("status") || "");
  const [search, setSearch]     = useState("");
  const [page, setPage]         = useState(1);
  const [actionUser, setActionUser] = useState(null); // { user, action }
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving]     = useState(false);

  const { data, loading, execute } = useApi(
    () => adminService.getAllUsers({ status, search, page, limit: 20 }),
    [status, search, page]
  );

  const users      = data?.users      || [];
  const pagination = data?.pagination || {};

  // ── Download CSV ──────────────────────────────────────────────────────────
  const handleExport = async () => {
    try {
      const res = await adminService.exportUsers();
      const url = URL.createObjectURL(new Blob([res.data]));
      const a   = document.createElement("a");
      a.href = url; a.download = "ssspay_users.csv"; a.click();
      URL.revokeObjectURL(url);
    } catch { toast.error("Export failed."); }
  };

  // ── Generic action handler ─────────────────────────────────────────────────
  const doAction = async () => {
    if (!actionUser) return;
    setSaving(true);
    try {
      const { user, action } = actionUser;
      if (action === "approve")  await adminService.updateUserStatus(user._id, { status: "active" });
      if (action === "disable")  await adminService.updateUserStatus(user._id, { status: "disabled" });
      if (action === "pending")  await adminService.updateUserStatus(user._id, { status: "pending" });
      if (action === "freeze")   await adminService.toggleFreeze(user._id);
      if (action === "reset") {
        if (!newPassword || newPassword.length < 6) { toast.error("Min 6 characters."); setSaving(false); return; }
        await adminService.resetPassword(user._id, { newPassword });
      }
      toast.success("Done!");
      setActionUser(null);
      setNewPassword("");
      execute();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    {
      key: "phone",
      label: "User",
      render: (u) => (
        <div>
          <Link to={`/admin/users/${u._id}`} className="text-white hover:text-gold-400 font-semibold transition-colors">
            ···{u.phone.slice(-6)}
          </Link>
          <p className="text-white/30 text-xs font-mono">{u._id.slice(-8)}</p>
        </div>
      ),
    },
    { key: "status", label: "Status", render: (u) => (
        <div className="flex flex-col gap-1">
          <StatusBadge status={u.status} />
          {u.isFrozen && <span className="badge badge-info text-xs">🧊 Frozen</span>}
        </div>
      )
    },
    { key: "balance",  label: "Balance",  render: (u) => <span className="text-gold-400 font-bold">₹{u.balance.toFixed(2)}</span> },
    { key: "reward",   label: "Reward",   render: (u) => <span className="text-emerald-400">₹{u.reward.toFixed(2)}</span> },
    { key: "totalDeposits", label: "Deposits", render: (u) => `₹${u.totalDeposits.toFixed(2)}` },
    {
      key: "createdAt",
      label: "Joined",
      render: (u) => new Date(u.createdAt).toLocaleDateString("en-IN"),
    },
    {
      key: "actions",
      label: "Actions",
      render: (u) => (
        <div className="flex flex-wrap gap-1.5">
          {u.status === "pending" && (
            <ActionBtn color="green" onClick={() => setActionUser({ user: u, action: "approve" })}>Approve</ActionBtn>
          )}
          {u.status === "active" && (
            <ActionBtn color="red" onClick={() => setActionUser({ user: u, action: "disable" })}>Disable</ActionBtn>
          )}
          {u.status === "disabled" && (
            <ActionBtn color="green" onClick={() => setActionUser({ user: u, action: "approve" })}>Enable</ActionBtn>
          )}
          <ActionBtn color="blue" onClick={() => setActionUser({ user: u, action: "freeze" })}>
            {u.isFrozen ? "Unfreeze" : "Freeze"}
          </ActionBtn>
          <ActionBtn color="purple" onClick={() => setActionUser({ user: u, action: "reset" })}>Reset PW</ActionBtn>
          <Link
            to={`/admin/users/${u._id}`}
            className="px-2 py-1 rounded-lg bg-white/5 text-white/50 hover:text-white text-xs transition-colors"
          >
            View →
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-white font-black text-2xl">Users</h1>
          <p className="text-white/40 text-sm">{data?.pagination?.total || 0} total users</p>
        </div>
        <button onClick={handleExport} className="btn-ghost text-sm py-2 px-4">
          📥 Export CSV
        </button>
      </div>

      {/* Filters */}
      <GlassCard className="p-4" animate={false}>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Search by phone..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="input-field flex-1 py-2.5"
          />
          <div className="flex gap-2 flex-wrap">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => { setStatus(f.value); setPage(1); }}
                className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                  status === f.value
                    ? "bg-gold-500/20 border-gold-500/40 text-gold-400"
                    : "bg-white/5 border-white/10 text-white/50"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </GlassCard>

      {/* Table */}
      <AdminTable columns={columns} data={users} loading={loading} emptyText="No users found" />

      {/* Pagination */}
      <Pagination page={pagination.page} pages={pagination.pages} onPage={setPage} />

      {/* Confirm / Action Modal */}
      <Modal
        isOpen={!!actionUser}
        onClose={() => { setActionUser(null); setNewPassword(""); }}
        title={actionUser?.action === "reset" ? "Reset Password" : "Confirm Action"}
      >
        {actionUser && (
          <div className="space-y-4">
            <p className="text-white/60 text-sm">
              {actionUser.action === "approve"  && `Approve user ···${actionUser.user.phone.slice(-6)}?`}
              {actionUser.action === "disable"  && `Disable account for ···${actionUser.user.phone.slice(-6)}?`}
              {actionUser.action === "freeze"   && `${actionUser.user.isFrozen ? "Unfreeze" : "Freeze"} account for ···${actionUser.user.phone.slice(-6)}?`}
              {actionUser.action === "reset"    && `Set a new password for ···${actionUser.user.phone.slice(-6)}.`}
            </p>

            {actionUser.action === "reset" && (
              <input
                type="password"
                placeholder="New password (min 6 chars)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="input-field"
              />
            )}

            <div className="flex gap-3">
              <button
                onClick={() => { setActionUser(null); setNewPassword(""); }}
                className="btn-ghost flex-1 text-sm py-2.5"
              >
                Cancel
              </button>
              <button
                onClick={doAction}
                disabled={saving}
                className="btn-gold flex-1 text-sm py-2.5 flex items-center justify-center gap-2"
              >
                {saving
                  ? <><div className="w-4 h-4 border-2 border-dark-900/40 border-t-dark-900 rounded-full animate-spin" />Saving...</>
                  : "Confirm"}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function ActionBtn({ children, color, onClick }) {
  const colors = {
    green:  "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border-emerald-500/20",
    red:    "bg-red-500/10 text-red-400 hover:bg-red-500/20 border-red-500/20",
    blue:   "bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border-blue-500/20",
    purple: "bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 border-purple-500/20",
    gold:   "bg-gold-500/10 text-gold-400 hover:bg-gold-500/20 border-gold-500/20",
  };
  return (
    <button
      onClick={onClick}
      className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${colors[color]}`}
    >
      {children}
    </button>
  );
}
