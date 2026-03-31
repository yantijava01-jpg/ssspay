import { useState } from "react";
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
  { value: "",           label: "All"        },
  { value: "processing", label: "Processing" },
  { value: "pending",    label: "Pending"    },
  { value: "success",    label: "Success"    },
  { value: "failed",     label: "Failed"     },
];

export default function AdminOrders() {
  const [status, setStatus]       = useState("processing");
  const [search, setSearch]       = useState("");
  const [page, setPage]           = useState(1);
  const [modalData, setModalData] = useState(null);
  const [approvedAmt, setApprovedAmt] = useState("");
  const [rejectNote, setRejectNote]   = useState("");
  const [saving, setSaving]           = useState(false);

  const { data, loading, execute } = useApi(
    () => adminService.getAllOrders({ status, search, page, limit: 20 }),
    [status, search, page]
  );

  const orders     = data?.orders     || [];
  const pagination = data?.pagination || {};

  const openApprove = (order) => { setModalData({ order, mode: "approve" }); setApprovedAmt(String(order.amount)); };
  const openReject  = (order) => { setModalData({ order, mode: "reject"  }); setRejectNote(""); };

  const handleApprove = async () => {
    setSaving(true);
    try {
      await adminService.approveOrder(modalData.order._id, {
        approvedAmount: parseFloat(approvedAmt) || undefined,
      });
      toast.success("Order approved and balance credited! ✅");
      setModalData(null);
      execute();
    } catch (err) { toast.error(getErrorMessage(err)); }
    finally { setSaving(false); }
  };

  const handleReject = async () => {
    setSaving(true);
    try {
      await adminService.rejectOrder(modalData.order._id, { adminNote: rejectNote });
      toast.success("Order rejected.");
      setModalData(null);
      execute();
    } catch (err) { toast.error(getErrorMessage(err)); }
    finally { setSaving(false); }
  };

  const handleExport = async () => {
    try {
      const res = await adminService.exportOrders();
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url; a.download = "ssspay_orders.csv"; a.click();
      URL.revokeObjectURL(url);
    } catch { toast.error("Export failed."); }
  };

  const columns = [
    { key: "orderId",   label: "Order ID",   render: (o) => <span className="font-mono text-xs text-white/70 select-all">{o.orderId}</span> },
    { key: "userId",    label: "User",       render: (o) => <span className="font-mono text-sm">···{o.userId?.phone?.slice(-6) || "—"}</span> },
    {
      key: "amount", label: "Amount",
      render: (o) => (
        <div>
          <span className="text-gold-400 font-bold">₹{(o.approvedAmount ?? o.amount).toLocaleString("en-IN")}</span>
          {o.approvedAmount && o.approvedAmount !== o.amount && (
            <p className="text-white/30 text-xs line-through">₹{o.amount}</p>
          )}
        </div>
      ),
    },
    { key: "status",    label: "Status",     render: (o) => <StatusBadge status={o.status} /> },
    { key: "createdAt", label: "Date",        render: (o) => <span className="text-white/40 text-xs">{new Date(o.createdAt).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</span> },
    {
      key: "actions", label: "Actions",
      render: (o) => {
        if (o.status === "success" || o.status === "failed") return <span className="text-white/20 text-xs">Done</span>;
        return (
          <div className="flex gap-2">
            <button onClick={() => openApprove(o)} className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold hover:bg-emerald-500/20 transition-all">✅ Approve</button>
            <button onClick={() => openReject(o)}  className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-semibold hover:bg-red-500/20 transition-all">❌ Reject</button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-white font-black text-2xl">Orders</h1>
          <p className="text-white/40 text-sm">{pagination.total || 0} total</p>
        </div>
        <button onClick={handleExport} className="btn-ghost text-sm py-2 px-4">📥 Export CSV</button>
      </div>

      <GlassCard className="p-4" animate={false}>
        <div className="flex flex-col sm:flex-row gap-3">
          <input type="text" placeholder="Search by Order ID or phone..." value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="input-field flex-1 py-2.5" />
          <div className="flex gap-2 flex-wrap">
            {STATUS_FILTERS.map((f) => (
              <button key={f.value} onClick={() => { setStatus(f.value); setPage(1); }}
                className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${status === f.value ? "bg-gold-500/20 border-gold-500/40 text-gold-400" : "bg-white/5 border-white/10 text-white/50"}`}>
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </GlassCard>

      <AdminTable columns={columns} data={orders} loading={loading} emptyText="No orders found" />
      <Pagination page={pagination.page} pages={pagination.pages} onPage={setPage} />

      {/* Approve Modal */}
      <Modal isOpen={modalData?.mode === "approve"} onClose={() => setModalData(null)} title="Approve Order">
        {modalData && (
          <div className="space-y-4">
            <div className="glass-card p-4 space-y-2">
              <InfoRow label="Order ID" value={modalData.order.orderId} mono />
              <InfoRow label="User"     value={`···${modalData.order.userId?.phone?.slice(-6)}`} />
              <InfoRow label="Amount"   value={`₹${modalData.order.amount}`} gold />
            </div>
            <div>
              <label className="text-white/40 text-xs uppercase tracking-wider block mb-1.5">Approved Amount</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gold-400 font-bold">₹</span>
                <input type="number" value={approvedAmt} onChange={(e) => setApprovedAmt(e.target.value)} className="input-field pl-8" min="1" />
              </div>
            </div>
            {approvedAmt && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 space-y-1.5">
                <div className="flex justify-between text-sm"><span className="text-white/50">Deposit</span><span className="text-emerald-400 font-bold">+₹{parseFloat(approvedAmt||0).toFixed(2)}</span></div>
                <div className="flex justify-between text-sm"><span className="text-white/50">Cashback (2.5%)</span><span className="text-gold-400 font-bold">+₹{(parseFloat(approvedAmt||0)*0.025).toFixed(2)}</span></div>
              </div>
            )}
            <div className="flex gap-3">
              <button onClick={() => setModalData(null)} className="btn-ghost flex-1 text-sm py-2.5">Cancel</button>
              <button onClick={handleApprove} disabled={saving} className="btn-gold flex-1 text-sm py-2.5 flex items-center justify-center gap-2">
                {saving ? <><div className="w-4 h-4 border-2 border-dark-900/40 border-t-dark-900 rounded-full animate-spin"/>Processing...</> : "✅ Approve & Credit"}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Reject Modal */}
      <Modal isOpen={modalData?.mode === "reject"} onClose={() => setModalData(null)} title="Reject Order">
        {modalData && (
          <div className="space-y-4">
            <div className="glass-card p-4">
              <InfoRow label="Order ID" value={modalData.order.orderId} mono />
              <InfoRow label="Amount"   value={`₹${modalData.order.amount}`} gold />
            </div>
            <div>
              <label className="text-white/40 text-xs uppercase tracking-wider block mb-1.5">Rejection Reason <span className="normal-case text-white/20">(optional)</span></label>
              <input type="text" placeholder="e.g. Payment not received" value={rejectNote} onChange={(e) => setRejectNote(e.target.value)} className="input-field" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setModalData(null)} className="btn-ghost flex-1 text-sm py-2.5">Cancel</button>
              <button onClick={handleReject} disabled={saving} className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 transition-all flex items-center justify-center gap-2">
                {saving ? <><div className="w-4 h-4 border-2 border-red-400/40 border-t-red-400 rounded-full animate-spin"/>Rejecting...</> : "❌ Reject Order"}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function InfoRow({ label, value, mono, gold }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-0">
      <span className="text-white/40 text-sm">{label}</span>
      <span className={`text-sm font-semibold ${gold ? "text-gold-400" : "text-white/70"} ${mono ? "font-mono text-xs" : ""}`}>{value}</span>
    </div>
  );
}
