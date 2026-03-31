import { useState, useCallback } from "react";
import toast from "react-hot-toast";

const useCopyToClipboard = () => {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(async (text, label = "Copied!") => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success(label, { duration: 2000, icon: "📋" });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const el = document.createElement("textarea");
      el.value = text;
      el.style.position = "fixed";
      el.style.opacity = "0";
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      toast.success(label, { duration: 2000, icon: "📋" });
      setTimeout(() => setCopied(false), 2000);
    }
  }, []);

  return { copy, copied };
};

export default useCopyToClipboard;
