import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import { io } from "socket.io-client";
import toast from "react-hot-toast";
import { useAuth } from "./AuthContext";

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { token, isLoggedIn, updateUser } = useAuth();
  const socketRef  = useRef(null);
  const [connected, setConnected] = useState(false);

  // ── Connect / reconnect when token changes ────────────────────────────────
  useEffect(() => {
    // Disconnect existing socket first
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    const socket = io("/", {
      auth: { token: token || "" },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 2000,
      reconnectionAttempts: 10,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);
    });

    socket.on("disconnect", () => {
      setConnected(false);
    });

    // ── Balance updated ───────────────────────────────────────────────────
    socket.on("balanceUpdated", (data) => {
      updateUser({ balance: data.balance, reward: data.reward });
    });

    // ── Order updated ─────────────────────────────────────────────────────
    socket.on("orderUpdated", (data) => {
      if (data.status === "success") {
        toast.success(`✅ Order #${data.orderId} approved! ₹${data.amount} credited.`, {
          duration: 5000,
        });
      } else if (data.status === "failed") {
        toast.error(`❌ Order #${data.orderId} was rejected.`, { duration: 5000 });
      }
    });

    // ── Notifications ─────────────────────────────────────────────────────
    socket.on("notification", (data) => {
      switch (data.type) {
        case "account_status":
          toast(data.message, { icon: "🔔", duration: 4000 });
          break;
        case "account_frozen":
          toast.error(data.message, { duration: 6000 });
          break;
        case "referral_bonus":
          toast.success(data.message, { icon: "🎁", duration: 4000 });
          break;
        case "upi_status":
          toast(data.message, { icon: "💳", duration: 4000 });
          break;
        case "new_notice":
          if (!data.isPopup) {
            toast(data.title, { icon: "📢", duration: 4000 });
          }
          break;
        default:
          break;
      }
    });

    return () => {
      socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // ── Emit helper ───────────────────────────────────────────────────────────
  const emit = useCallback((event, data) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data);
    }
  }, []);

  // ── Subscribe to an event from outside ───────────────────────────────────
  const on = useCallback((event, handler) => {
    socketRef.current?.on(event, handler);
    return () => socketRef.current?.off(event, handler);
  }, []);

  return (
    <SocketContext.Provider value={{ connected, emit, on, socket: socketRef.current }}>
      {children}
    </SocketContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useSocket = () => {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error("useSocket must be used within SocketProvider");
  return ctx;
};
