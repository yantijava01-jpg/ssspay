import { motion } from "framer-motion";

export default function GlassCard({
  children,
  className = "",
  gold = false,
  animate = true,
  onClick,
  delay = 0,
}) {
  const baseClass = gold ? "glass-card-gold" : "glass-card";

  const Wrapper = animate ? motion.div : "div";
  const animProps = animate
    ? {
        initial: { opacity: 0, y: 16 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.35, delay },
      }
    : {};

  return (
    <Wrapper
      className={`${baseClass} ${className} ${onClick ? "cursor-pointer active:scale-[0.98] transition-transform" : ""}`}
      onClick={onClick}
      {...animProps}
    >
      {children}
    </Wrapper>
  );
}
