import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { useEffect } from "react";
import { applyTheme, type ThemeColors } from "@/lib/theme";

/**
 * Loads the global theme settings (admin-editable) and applies them as CSS
 * custom properties so every page restyles live.
 */
export function SettingsApplier() {
  const settings = useQuery(api.admin.getSettings);

  useEffect(() => {
    if (settings) {
      applyTheme(settings as ThemeColors);
    }
  }, [settings]);

  return null;
}