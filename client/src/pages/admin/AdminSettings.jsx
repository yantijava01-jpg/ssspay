import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { adminService } from "../../services/adminService";
import { getErrorMessage } from "../../services/api";
import GlassCard from "../../components/ui/GlassCard";
import { InlineLoader } from "../../components/ui/LoadingSpinner";
import useApi from "../../hooks/useApi";

export default function AdminSettings() {
  const { data, loading, execute } = useApi(() => adminService.getSettings(), []);
  const [form, setForm]   = useState(null);
  const [saving, setSaving] = useState(false);
  const [waInput, setWaInput] = useState(""); // temp input for adding WA number

  // Populate form when data loads
  useEffect(() => {
    if (data?.settings) {
      setForm({ ...data.settings });
    }
  }, [data]);

  const handleSave = async () => {
    if (!form) return;
    setSaving(true);
    try {
      await adminService.updateSettings({
        usdtRate:       parseFloat(form.usdtRate),
        whatsappNumbers: form.whatsappNumbers,
        minOrderAmount:  parseInt(form.minOrderAmount),
        maxOrdersPerDay: parseInt(form.maxOrdersPerDay),
        cashbackRate:    parseFloat(form.cashbackRate) / 100,
        referralRate:    parseFloat(form.referralRate) / 100,
        telegramLink:    form.telegramLink,
        supportWhatsapp: form.supportWhatsapp,
        appName:         form.appName,
        maintenanceMode: form.maintenanceMode,
      });
      toast.success("Settings saved successfully! ✅");
      execute();
    } catch (err) { toast.error(getErrorMessage(err)); }
    finally { setSaving(false); }
  };

  const addWANumber = () => {
    const cleaned = waInput.replace(/\D/g, "");
    if (!cleaned || cleaned.length < 10) { toast.error("Enter a valid number."); return; }
    if (form.whatsappNumbers.includes(cleaned)) { toast.error("Number already added."); return; }
    if (form.whatsappNumbers.length >= 5) { toast.error("Max 5 WhatsApp numbers."); return; }
    setForm({ ...form, whatsappNumbers: [...form.whatsappNumbers, cleaned] });
    setWaInput("");
  };

  const removeWANumber = (num) => {
    setForm({ ...form, whatsappNumbers: form.whatsappNumbers.filter((n) => n !== num) });
  };

  if (loading || !form) return <InlineLoader />;

  const Field = ({ label, hint, children }) => (
    <div>
      <label className="text-white/50 text-xs uppercase tracking-wider mb-1.5 block">{label}</label>
      {children}
      {hint && <p className="text-white/20 text-xs mt-1">{hint}</p>}
    </div>
  );

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white font-black text-2xl">Settings</h1>
          <p className="text-white/40 text-sm">App configuration</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-gold text-sm py-2.5 px-5 flex items-center gap-2"
        >
          {saving
            ? <div className="w-4 h-4 border-2 border-dark-900/40 border-t-dark-900 rounded-full animate-spin" />
            : "💾 Save All"}
        </button>
      </div>

      {/* Payment config */}
      <GlassCard className="p-5" animate={false}>
        <p className="text-white/40 text-xs uppercase tracking-widest font-semibold mb-4">💰 Payment</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="USDT Rate (₹ per 1 USDT)" hint="Used for USDT deposit conversion">
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 text-sm">₹</span>
              <input
                type="number"
                value={form.usdtRate}
                onChange={(e) => setForm({ ...form, usdtRate: e.target.value })}
                className="input-field pl-8"
                step="0.1"
                min={1}
              />
            </div>
          </Field>

          <Field label="Min Order Amount (₹)">
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 text-sm">₹</span>
              <input
                type="number"
                value={form.minOrderAmount}
                onChange={(e) => setForm({ ...form, minOrderAmount: e.target.value })}
                className="input-field pl-8"
                min={1}
              />
            </div>
          </Field>

          <Field label="Max Orders Per Day">
            <input
              type="number"
              value={form.maxOrdersPerDay}
              onChange={(e) => setForm({ ...form, maxOrdersPerDay: e.target.value })}
              className="input-field"
              min={1}
            />
          </Field>

          <Field label="Cashback Rate (%)" hint="User earns this % on each deposit">
            <div className="relative">
              <input
                type="number"
                value={form.cashbackRate}
                onChange={(e) => setForm({ ...form, cashbackRate: e.target.value })}
                className="input-field pr-8"
                step="0.1"
                min={0}
                max={100}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 text-sm">%</span>
            </div>
          </Field>

          <Field label="Referral Rate (%)" hint="Referrer earns this % on friend's deposit">
            <div className="relative">
              <input
                type="number"
                value={form.referralRate}
                onChange={(e) => setForm({ ...form, referralRate: e.target.value })}
                className="input-field pr-8"
                step="0.01"
                min={0}
                max={100}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 text-sm">%</span>
            </div>
          </Field>
        </div>
      </GlassCard>

      {/* WhatsApp numbers */}
      <GlassCard className="p-5" animate={false}>
        <p className="text-white/40 text-xs uppercase tracking-widest font-semibold mb-4">
          📱 WhatsApp Order Numbers
        </p>
        <p className="text-white/30 text-xs mb-3">
          Orders are randomly routed to one of these numbers. Include country code (e.g. 919876543210).
        </p>

        {/* Existing numbers */}
        <div className="space-y-2 mb-3">
          {form.whatsappNumbers.length === 0 && (
            <p className="text-red-400/60 text-xs">⚠️ No WhatsApp numbers configured. Orders will fail!</p>
          )}
          {form.whatsappNumbers.map((num) => (
            <div key={num} className="flex items-center gap-2 bg-dark-700/50 rounded-xl px-3 py-2.5">
              <span className="text-xl">📱</span>
              <span className="text-white font-mono text-sm flex-1">+{num}</span>
              <button
                onClick={() => removeWANumber(num)}
                className="text-red-400/60 hover:text-red-400 transition-colors text-sm"
              >✕</button>
            </div>
          ))}
        </div>

        {/* Add number */}
        <div className="flex gap-2">
          <input
            type="tel"
            placeholder="919876543210 (with country code)"
            value={waInput}
            onChange={(e) => setWaInput(e.target.value.replace(/\D/g, ""))}
            onKeyDown={(e) => e.key === "Enter" && addWANumber()}
            className="input-field flex-1 text-sm"
            maxLength={15}
          />
          <button onClick={addWANumber} className="btn-ghost text-sm px-4">+ Add</button>
        </div>
      </GlassCard>

      {/* Support */}
      <GlassCard className="p-5" animate={false}>
        <p className="text-white/40 text-xs uppercase tracking-widest font-semibold mb-4">🔗 Support Links</p>
        <div className="space-y-4">
          <Field label="Telegram Link">
            <input
              type="text"
              placeholder="https://t.me/your_channel"
              value={form.telegramLink}
              onChange={(e) => setForm({ ...form, telegramLink: e.target.value })}
              className="input-field text-sm"
            />
          </Field>
          <Field label="Support WhatsApp (with country code)">
            <input
              type="tel"
              placeholder="919876543210"
              value={form.supportWhatsapp}
              onChange={(e) => setForm({ ...form, supportWhatsapp: e.target.value.replace(/\D/g, "") })}
              className="input-field text-sm"
              maxLength={15}
            />
          </Field>
        </div>
      </GlassCard>

      {/* App config */}
      <GlassCard className="p-5" animate={false}>
        <p className="text-white/40 text-xs uppercase tracking-widest font-semibold mb-4">⚙️ App Config</p>
        <div className="space-y-4">
          <Field label="App Name">
            <input
              type="text"
              value={form.appName}
              onChange={(e) => setForm({ ...form, appName: e.target.value })}
              className="input-field text-sm"
              maxLength={30}
            />
          </Field>

          <div className="flex items-center justify-between py-3 border-t border-white/5">
            <div>
              <p className="text-white font-semibold text-sm">Maintenance Mode</p>
              <p className="text-white/30 text-xs">Disables new orders for all users</p>
            </div>
            <button
              onClick={() => setForm({ ...form, maintenanceMode: !form.maintenanceMode })}
              className={`w-12 h-6 rounded-full transition-all relative ${
                form.maintenanceMode ? "bg-red-500" : "bg-dark-500 border border-white/10"
              }`}
            >
              <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all ${
                form.maintenanceMode ? "left-6.5" : "left-0.5"
              }`} style={{ left: form.maintenanceMode ? "26px" : "2px" }} />
            </button>
          </div>
        </div>
      </GlassCard>

      {/* Save button (bottom) */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="btn-gold w-full flex items-center justify-center gap-2 py-4"
      >
        {saving
          ? <><div className="w-4 h-4 border-2 border-dark-900/40 border-t-dark-900 rounded-full animate-spin" /> Saving...</>
          : "💾 Save All Settings"}
      </button>
    </div>
  );
}
