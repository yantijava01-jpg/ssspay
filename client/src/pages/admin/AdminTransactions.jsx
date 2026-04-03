import { useState } from "react";
import { motion } from "framer-motion";
import { adminService } from "../../services/adminService";
import GlassCard from "../../components/ui/GlassCard";
import AdminTable from "../../components/ui/AdminTable";
import Pagination from "../../components/ui/Pagination";
import { InlineLoader } from "../../components/ui/LoadingSpinner";
import useApi from "../../hooks/useApi";

const TX_TYPES = [
    { value: "", label: "All" },
    { value: "deposit", label: "Deposit" },
    { value: "reward", label: "Reward" },
    { value: "referral", label: "Referral" },
    { value: "withdraw", label: "Withdraw" },
];

const TX_COLORS = {
    deposit: "text-gold-400",
    reward: "text-emerald-400",
    referral: "text-blue-400",
    withdraw: "text-red-400",
};

const TX_ICONS = {
    deposit: "⬇️",
    reward: "⭐",
    referral: "🎁",
    withdraw: "⬆️",
};

const fmt = (n) => `₹${Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

export default function AdminTransactions() {
    const [type, setType] = useState("");
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);

    const { data, loading } = useApi(
        () => adminService.getAllTransactions({ type, search, page, limit: 30 }),
        [type, search, page]
    );

    const transactions = data?.transactions || [];
    const summary = data?.summary || {};
    const pagination = data?.pagination || {};

    const columns = [
        {
            key: "type", label: "Type",
            render: (tx) => (
                <div className="flex items-center gap-2">
                    <span className="text-base">{TX_ICONS[tx.type] || "💸"}</span>
                    <span className={`font-semibold text-sm capitalize ${TX_COLORS[tx.type] || "text-white"}`}>
                        {tx.type}
                    </span>
                </div>
            ),
        },
        {
            key: "userId", label: "User",
            render: (tx) => (
                <span className="font-mono text-xs text-white/70">
                    {tx.userId?.phone ? `···${tx.userId.phone.slice(-7)}` : "—"}
                </span>
            ),
        },
        {
            key: "amount", label: "Amount",
            render: (tx) => (
                <span className={`font-black text-sm ${TX_COLORS[tx.type] || "text-white"}`}>
                    {tx.type === "withdraw" ? "-" : "+"}{fmt(tx.amount)}
                </span>
            ),
        },
        {
            key: "balanceAfter", label: "Balance After",
            render: (tx) => (
                <span className="text-white/50 text-xs">
                    {tx.balanceAfter != null ? fmt(tx.balanceAfter) : "—"}
                </span>
            ),
        },
        {
            key: "description", label: "Description",
            render: (tx) => (
                <span className="text-white/40 text-xs max-w-[180px] truncate block">
                    {tx.description || "—"}
                </span>
            ),
        },
        {
            key: "orderId", label: "Order",
            render: (tx) => (
                <span className="text-white/30 text-xs font-mono">
                    {tx.orderId?.orderId ? `#${tx.orderId.orderId.slice(-8)}` : "—"}
                </span>
            ),
        },
        {
            key: "createdAt", label: "Date",
            render: (tx) => (
                <span className="text-white/30 text-xs">
                    {new Date(tx.createdAt).toLocaleString("en-IN", {
                        day: "2-digit", month: "short",
                        hour: "2-digit", minute: "2-digit",
                    })}
                </span>
            ),
        },
        {
            key: "createdByAdmin", label: "By",
            render: (tx) => tx.createdByAdmin
                ? <span className="badge badge-warning text-xs">Admin</span>
                : <span className="badge badge-info text-xs">System</span>,
        },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-white font-black text-2xl">Transactions</h1>
                <p className="text-white/40 text-sm">{pagination.total || 0} total records</p>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { type: "deposit", label: "Total Deposits", color: "text-gold-400", border: "border-gold-500/20" },
                    { type: "reward", label: "Total Rewards", color: "text-emerald-400", border: "border-emerald-500/20" },
                    { type: "referral", label: "Total Referrals", color: "text-blue-400", border: "border-blue-500/20" },
                    { type: "withdraw", label: "Total Withdrawals", color: "text-red-400", border: "border-red-500/20" },
                ].map((s, i) => (
                    <motion.div
                        key={s.type}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.07 }}
                        className={`glass-card p-4 border ${s.border}`}
                    >
                        <p className="text-white/30 text-xs mb-1">{s.label}</p>
                        <p className={`font-black text-xl ${s.color}`}>{fmt(summary[s.type])}</p>
                    </motion.div>
                ))}
            </div>

            {/* Filters */}
            <GlassCard className="p-4" animate={false}>
                <div className="flex flex-col sm:flex-row gap-3">
                    <input
                        type="text"
                        placeholder="Search by phone number..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        className="input-field flex-1 py-2.5"
                    />
                    <div className="flex gap-2 flex-wrap">
                        {TX_TYPES.map((t) => (
                            <button
                                key={t.value}
                                onClick={() => { setType(t.value); setPage(1); }}
                                className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${type === t.value
                                        ? "bg-gold-500/20 border-gold-500/40 text-gold-400"
                                        : "bg-white/5 border-white/10 text-white/50"
                                    }`}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>
                </div>
            </GlassCard>

            {/* Table */}
            <AdminTable
                columns={columns}
                data={transactions}
                loading={loading}
                emptyText="No transactions found"
            />

            {/* Pagination */}
            <Pagination
                page={pagination.page}
                pages={pagination.pages}
                onPage={setPage}
            />
        </div>
    );
}