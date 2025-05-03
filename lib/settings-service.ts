import { getSetting } from "@/actions/settings/get-settings";
import { saveSetting } from "@/actions/settings/save-setting";
import { AppSettings, SaveSettingsPayload } from "./types/settings";
import { useQuery } from "@tanstack/react-query";
import { getSettingByName } from "@/actions/settings/get-setting-by-name";

// Fetch all settings or by category
export const getSettings = async (category?: string): Promise<AppSettings> => {
  try {
    const response = await getSetting(category);
    return response;
  } catch (error) {
    console.error("Failed to fetch settings:", error);
    throw error;
  }
};

export const useSetting = (key: string, bypassError?: boolean) => {
  return useQuery({
    queryKey: ["setting", key],
    queryFn: ({ queryKey }) => {
      const [_prefix, settingKey] = queryKey;
      return getSettingByName(settingKey as string, bypassError);
    },
  });
};

// Save multiple settings at once
export const saveSettings = async (settings: {
  [key: string]: { value: string | File; category: string };
}): Promise<void> => {
  try {
    const payload: SaveSettingsPayload = { settings };
    await saveSetting(payload);
  } catch (error) {
    console.error("Failed to save settings:", error);
    throw error;
  }
};

// Helper functions for specific settings categories
export const getGeneralSettings = () => getSettings("general");
export const getStoreSettings = () => getSettings("store");
export const getNotificationSettings = () => getSettings("notifications");
export const getPOSSettings = async () => await getSettings("POS");
