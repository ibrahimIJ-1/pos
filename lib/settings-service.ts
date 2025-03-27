import { getSetting } from "@/actions/settings/get-settings";
import { saveSetting } from "@/actions/settings/save-setting";
import { AppSettings, SaveSettingsPayload } from "./types/settings";

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

// Save multiple settings at once
export const saveSettings = async (settings: {
  [key: string]: { value: string; category: string };
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
