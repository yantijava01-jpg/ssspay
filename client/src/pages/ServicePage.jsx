import { motion } from "framer-motion";
import { useSettings } from "../context/SettingsContext";
import PageHeader from "../components/ui/PageHeader";
import GlassCard from "../components/ui/GlassCard";

export default function ServicePage() {
  const { settings } = useSettings();

  const channels = [
    {
      icon: "📱",
      label: "WhatsApp Support",
      sub: "Chat with our support team",
      color: "from-green-900/50 to-teal-900/30",
      border: "border-green-500/20",
      btn: "Open WhatsApp",
      btnColor: "style={{ background: 'linear-gradient(135deg,#25d366,#128c7e)' }}",
      action: () => {
        const num = settings.supportWhatsapp || "919999999999";
        window.open(`https://wa.me/${num}?text=Hello, I need support with my SSSPay account.`, "_blank");
      },
    },
    {
      icon: "✈️",
      label: "Telegram Channel",
      sub: "Get updates and announcements",
      color: "from-blue-900/50 to-indigo-900/30",
      border: "border-blue-500/20",
      btn: "Open Telegram",
      action: () => {
        const link = settings.telegramLink || "https://t.me/ssspay_support";
        window.open(link, "_blank");
      },
    },
  ];

  const faqs = [
    {
      q: "How long does deposit approval take?",
      a: "Usually within 5-30 minutes during business hours. Admin reviews every order manually.",
    },
    {
      q: "How is cashback calculated?",
      a: "You receive 2.5% of your approved deposit amount instantly as reward balance.",
    },
    {
      q: "Can I withdraw my balance?",
      a: "Yes. Contact admin via WhatsApp or Telegram to request a withdrawal.",
    },
    {
      q: "My order was rejected. What now?",
      a: "Contact support with your Order ID. Common reasons: payment not received or wrong amount sent.",
    },
    {
      q: "How does the referral program work?",
      a: "Share your referral code. When your friend deposits, you earn 0.3% of their deposit amount.",
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader title="Service" subtitle="Support & help" />

      {/* Support channels */}
      <div className="space-y-3">
        {channels.map((ch, i) => (
          <motion.div
            key={ch.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className={`rounded-2xl bg-gradient-to-r ${ch.color} border ${ch.border} p-5`}
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-3xl">
                {ch.icon}
              </div>
              <div>
                <h3 className="text-white font-bold text-lg">{ch.label}</h3>
                <p className="text-white/50 text-sm">{ch.sub}</p>
              </div>
            </div>
            <button
              onClick={ch.action}
              className="w-full py-3 rounded-xl font-semibold text-white text-sm transition-all active:scale-95"
              style={
                ch.label === "WhatsApp Support"
                  ? { background: "linear-gradient(135deg, #25d366, #128c7e)", boxShadow: "0 4px 15px rgba(37,211,102,0.3)" }
                  : { background: "linear-gradient(135deg, #2b5797, #1a73d9)", boxShadow: "0 4px 15px rgba(29,161,242,0.3)" }
              }
            >
              {ch.btn} →
            </button>
          </motion.div>
        ))}
      </div>

      {/* FAQ */}
      <GlassCard className="p-5" delay={0.2} animate={false}>
        <p className="text-white/40 text-xs uppercase tracking-widest font-semibold mb-4">
          ❓ Frequently Asked Questions
        </p>
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 + i * 0.05 }}
              className="border-b border-white/5 pb-4 last:border-0 last:pb-0"
            >
              <p className="text-white/80 font-semibold text-sm mb-1.5">{faq.q}</p>
              <p className="text-white/40 text-sm leading-relaxed">{faq.a}</p>
            </motion.div>
          ))}
        </div>
      </GlassCard>

      {/* App info */}
      <div className="text-center py-4 space-y-1">
        <div className="w-10 h-10 rounded-xl bg-gold-gradient flex items-center justify-center mx-auto mb-2">
          <span className="text-dark-900 font-black">S³</span>
        </div>
        <p className="text-white/40 text-sm font-semibold">SSSPay</p>
        <p className="text-white/20 text-xs">Version 1.0.0 · Secure & Encrypted</p>
      </div>

      <div className="h-2" />
    </div>
  );
}
