import { createContext, useContext, useEffect, useState } from "react";
import { settingsService } from "../services/miscService";

const SettingsContext = createContext(null);

const DEFAULT_SETTINGS = {
  usdtRate: 83.5,
  minOrderAmount: 100,
  cashbackRate: 2.5,
  referralRate: 0.3,
  telegramLink: "",
  supportWhatsapp: "",
  appName: "SSSPay",
  maintenanceMode: false,
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loadingSettings, setLoadingSettings] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await settingsService.getPublicSettings();
        setSettings({ ...DEFAULT_SETTINGS, ...res.data.settings });
      } catch {
        // Fallback to defaults silently
      } finally {
        setLoadingSettings(false);
      }
    };
    fetch();
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, loadingSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useSettings = () => {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
};
