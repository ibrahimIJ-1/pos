export type AppSettings = {
  [key: string]: string;
};

export interface SaveSettingPayload {
  value: string | File;
  category: string;
}

export interface SaveSettingsPayload {
  settings: {
    [key: string]: SaveSettingPayload;
  };
}
