import { InlineLoader } from "./LoadingSpinner";
import EmptyState from "./EmptyState";

export default function AdminTable({ columns, data, loading, emptyText = "No data found" }) {
  if (loading) return <InlineLoader />;

  if (!data || data.length === 0) {
    return <EmptyState icon="📭" title={emptyText} />;
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-white/5">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/5 bg-dark-700/50">
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-4 py-3 text-left text-white/40 text-xs uppercase tracking-wider font-semibold whitespace-nowrap"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr
              key={row._id || i}
              className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
            >
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-3 text-white/70 whitespace-nowrap">
                  {col.render ? col.render(row) : row[col.key] ?? "—"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
