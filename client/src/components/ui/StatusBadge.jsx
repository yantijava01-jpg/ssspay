const STATUS_MAP = {
  // Order statuses
  success:    { cls: "badge-success",  label: "✓ Success"    },
  failed:     { cls: "badge-danger",   label: "✗ Failed"     },
  processing: { cls: "badge-info",     label: "⟳ Processing" },
  pending:    { cls: "badge-pending",  label: "◷ Pending"    },

  // User statuses
  active:     { cls: "badge-success",  label: "● Active"     },
  disabled:   { cls: "badge-danger",   label: "● Disabled"   },

  // UPI statuses
  enabled:    { cls: "badge-success",  label: "✓ Enabled"    },
  risk:       { cls: "badge-warning",  label: "⚠ Risk"       },

  // Generic
  true:       { cls: "badge-success",  label: "Yes"          },
  false:      { cls: "badge-danger",   label: "No"           },
};

export default function StatusBadge({ status, label: overrideLabel }) {
  const key = String(status).toLowerCase();
  const config = STATUS_MAP[key] || { cls: "badge-info", label: status };

  return (
    <span className={config.cls}>
      {overrideLabel || config.label}
    </span>
  );
}
