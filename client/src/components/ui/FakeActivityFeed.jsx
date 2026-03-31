import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const FIRST_NAMES = ["Raj", "Priya", "Amit", "Neha", "Vikram", "Sunita", "Rahul", "Anita", "Deepak", "Kavya", "Suresh", "Meena", "Arun", "Pooja", "Kiran"];
const LAST_INIT   = ["K", "S", "M", "P", "R", "G", "B", "T", "V", "N", "A", "C", "D", "J", "L"];

const randomName = () =>
  `${FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)]} ${
    LAST_INIT[Math.floor(Math.random() * LAST_INIT.length)]
  }.`;

const randomAmount = () =>
  (Math.floor(Math.random() * 49) + 1) * 100 + Math.floor(Math.random() * 9) * 10;

const randomTime = () => {
  const mins = Math.floor(Math.random() * 30) + 1;
  return `${mins}m ago`;
};

const generateActivity = () => ({
  id: Math.random().toString(36).slice(2),
  name: randomName(),
  amount: randomAmount(),
  time: randomTime(),
  type: Math.random() > 0.3 ? "deposit" : "reward",
});

export default function FakeActivityFeed() {
  const [items, setItems] = useState(() =>
    Array.from({ length: 5 }, generateActivity)
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setItems((prev) => [generateActivity(), ...prev.slice(0, 7)]);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-2 overflow-hidden">
      <div className="flex items-center justify-between mb-3">
        <p className="text-white/50 text-xs uppercase tracking-widest font-semibold">Live Activity</p>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-emerald-400 text-xs">Live</span>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {items.map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -20, height: 0 }}
            animate={{ opacity: 1, x: 0, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0"
          >
            {/* Avatar */}
            <div className="w-8 h-8 rounded-full bg-gold-500/15 border border-gold-500/20 flex items-center justify-center flex-shrink-0">
              <span className="text-gold-400 font-bold text-xs">
                {item.name.charAt(0)}
              </span>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-white/80 text-sm font-medium truncate">{item.name}</p>
              <p className="text-white/30 text-xs">
                {item.type === "deposit" ? "Deposited" : "Earned reward"} · {item.time}
              </p>
            </div>

            {/* Amount */}
            <div className="text-right flex-shrink-0">
              <p className={`font-bold text-sm ${item.type === "deposit" ? "text-gold-400" : "text-emerald-400"}`}>
                +₹{item.amount.toLocaleString("en-IN")}
              </p>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
