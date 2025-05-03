"use client";

import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RolePermissionManager } from "@/components/user-management/RolePermissionManager";
import { usePermissions } from "@/hooks/usePermissions";
import { Permission, UserRole } from "@/lib/permissions";
import { Shield, Settings2, Store, Bell, Users } from "lucide-react";
import {
  saveSettings,
  getGeneralSettings,
  getStoreSettings,
  getNotificationSettings,
} from "@/lib/settings-service";
import { toast } from "sonner";
import { DatabaseInitializer } from "@/components/DatabaseInitializer";
import { UserRoleManager } from "@/components/user-management/UserRoleManager";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { NumberInput } from "@/components/ui/number-input";
const icon = await import("@/public/logo.svg");
interface IStoreSettings {
  storeName: string;
  refundDays: string;
  storeAddress: string;
  currency: string;
  taxEnabled: string;
  productImages: string;
  nearestValue: string;
  logo: string | File;
}
export default function SettingsPage() {
  const t = useTranslations();
  // For demonstration, assume admin with multiple roles
  const userRoles = [UserRole.ADMIN, UserRole.MANAGER];
  const additionalPermissions = [Permission.ISSUE_REFUND];
  const { checkPermission } = usePermissions(userRoles, additionalPermissions);

  // State for all settings sections
  const [generalSettings, setGeneralSettings] = useState({
    appName: "POS System",
    timezone: "utc",
    darkMode: "true",
  });

  const [storeSettings, setStoreSettings] = useState<IStoreSettings>({
    storeName: "My Awesome Store",
    refundDays: "14",
    storeAddress: "123 Main St, Anytown, USA",
    currency: "usd",
    taxEnabled: "true",
    productImages: "false",
    logo: "",
    nearestValue: "0",
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: "true",
    inventoryAlerts: "true",
    salesReports: "false",
  });

  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const [logoFile, setLogoFile] = useState<File | undefined>(undefined);
  const [logoImage, setLogoImage] = useState<string | null>(null);

  // Fetch settings on component mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        // Fetch settings for each category
        const generalData = await getGeneralSettings();
        const storeData = await getStoreSettings();
        const notificationData = await getNotificationSettings();

        // Update state with fetched settings, using defaults when values are missing
        setGeneralSettings({
          appName: generalData.appName || "POS System",
          timezone: generalData.timezone || "utc",
          darkMode: generalData.darkMode || "true",
        });

        setStoreSettings({
          storeName: storeData.storeName || "My Awesome Store",
          refundDays: storeData.refundDays || "14",
          storeAddress: storeData.storeAddress || "123 Main St, Anytown, USA",
          currency: storeData.currency || "usd",
          taxEnabled: storeData.taxEnabled || "true",
          productImages: generalData.productImages || "false",
          logo: storeData.logo || "",
          nearestValue: storeData.nearestValue || "0",
        });
        if (storeData.logo) {
          setLogoImage(storeData.logo);
        }

        setNotificationSettings({
          emailNotifications: notificationData.emailNotifications || "true",
          inventoryAlerts: notificationData.inventoryAlerts || "true",
          salesReports: notificationData.salesReports || "false",
        });
      } catch (error) {
        console.error("Error fetching settings:", error);
        toast.error(t("Failed to load settings"));
      }
    };

    fetchSettings();
  }, []);

  // Handle saving all settings
  const handleSaveSettings = async () => {
    try {
      setIsSaving(true);
      toast.loading(t("Saving settings") + "...");

      // Prepare settings object for API
      const settingsPayload = {
        // General settings
        appName: { value: generalSettings.appName, category: "general" },
        timezone: { value: generalSettings.timezone, category: "general" },
        darkMode: { value: generalSettings.darkMode, category: "general" },

        // Store settings
        storeName: { value: storeSettings.storeName, category: "store" },
        storeAddress: { value: storeSettings.storeAddress, category: "store" },
        refundDays: { value: storeSettings.refundDays, category: "store" },
        currency: { value: storeSettings.currency, category: "store" },
        taxEnabled: { value: storeSettings.taxEnabled, category: "store" },
        logo: { value: storeSettings.logo, category: "store" },
        nearestValue: { value: storeSettings.nearestValue, category: "store" },
        productImages: {
          value: storeSettings.productImages,
          category: "store",
        },

        // Notification settings
        emailNotifications: {
          value: notificationSettings.emailNotifications,
          category: "notifications",
        },
        inventoryAlerts: {
          value: notificationSettings.inventoryAlerts,
          category: "notifications",
        },
        salesReports: {
          value: notificationSettings.salesReports,
          category: "notifications",
        },
      };

      await saveSettings(settingsPayload);
      toast.success(t("Settings saved successfully"));
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error(t("Failed to save settings"));
    } finally {
      setIsSaving(false);
    }
  };

  // Handle general settings changes
  const handleGeneralChange = (
    key: keyof typeof generalSettings,
    value: string
  ) => {
    setGeneralSettings((prev) => ({ ...prev, [key]: value }));
  };

  // Handle store settings changes
  const handleStoreChange = (
    key: keyof typeof storeSettings,
    value: string | File
  ) => {
    setStoreSettings((prev) => ({ ...prev, [key]: value }));
  };

  // Handle notification settings changes
  const handleNotificationChange = (
    key: keyof typeof notificationSettings,
    value: string
  ) => {
    setNotificationSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleLogoChange = (files: FileList | null) => {
    if (files && files.length > 0) {
      const file = files[0];
      const imageUrl = URL.createObjectURL(file);
      setLogoFile(file);
      handleStoreChange("logo", file);
      setLogoImage(imageUrl);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">{t("Settings")}</h1>
        <div className="flex gap-2">
          {/* <DatabaseInitializer /> */}
          <Button
            onClick={handleSaveSettings}
            disabled={isSaving}
            className="neon-glow animate-glow"
          >
            {isSaving ? t("Saving") + "..." : t("Save Changes")}
          </Button>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
        dir={t("dir") as "rtl" | "ltr"}
      >
        <TabsList>
          <TabsTrigger value="general" className="flex items-center gap-1">
            <Settings2 className="h-4 w-4" />
            <span>{t("General")}</span>
          </TabsTrigger>

          <TabsTrigger value="store" className="flex items-center gap-1">
            <Store className="h-4 w-4" />
            <span>{t("Store")}</span>
          </TabsTrigger>

          {/* <TabsTrigger
            value="notifications"
            className="flex items-center gap-1"
          >
            <Bell className="h-4 w-4" />
            <span>{t("Notifications")}</span>
          </TabsTrigger> */}

          {checkPermission(Permission.EDIT_USERS) && (
            <TabsTrigger value="users" className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{t("Users")}</span>
            </TabsTrigger>
          )}

          {checkPermission(Permission.EDIT_USERS) && (
            <TabsTrigger
              value="permissions"
              className="flex items-center gap-1"
            >
              <Shield className="h-4 w-4" />
              <span>{t("Permissions")}</span>
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="general">
          <Card className="neon-card neon-border">
            <CardHeader>
              <CardTitle className="rtl:text-start">
                {t("General Settings")}
              </CardTitle>
              <CardDescription className="rtl:text-start">
                {t("Manage your application settings")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="app-name">{t("Application Name")}</Label>
                <Input
                  id="app-name"
                  value={generalSettings.appName}
                  onChange={(e) =>
                    handleGeneralChange("appName", e.target.value)
                  }
                  className="neon-input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="timezone">{t("Timezone")}</Label>
                <Select
                  value={generalSettings.timezone}
                  onValueChange={(value) =>
                    handleGeneralChange("timezone", value)
                  }
                  dir={t("dir") as "rtl" | "ltr"}
                >
                  <SelectTrigger id="timezone" className="neon-input">
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="utc">UTC</SelectItem>
                    <SelectItem value="est">Eastern Time (ET)</SelectItem>
                    <SelectItem value="cst">Central Time (CT)</SelectItem>
                    <SelectItem value="mst">Mountain Time (MT)</SelectItem>
                    <SelectItem value="pst">Pacific Time (PT)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="space-y-0.5">
                  <Label htmlFor="show-image">{t("Show Product Images")}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t("Show POS Product Image")}
                  </p>
                </div>
                <Switch
                  id="show-image"
                  checked={storeSettings.productImages == "true"}
                  onCheckedChange={(checked) =>
                    handleStoreChange("productImages", checked.toString())
                  }
                />
              </div>
              <div className="flex items-center justify-between pt-2">
                <div className="space-y-0.5">
                  <Label htmlFor="dark-mode">{t("Dark Mode")}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t("Toggle dark mode on or off")}
                  </p>
                </div>
                <Switch
                  id="dark-mode"
                  checked={generalSettings.darkMode === "true"}
                  onCheckedChange={(checked) =>
                    handleGeneralChange("darkMode", checked.toString())
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="store">
          <Card className="neon-card neon-border">
            <CardHeader>
              <CardTitle className="rtl:text-start">
                {t("Store Settings")}
              </CardTitle>
              <CardDescription className="rtl:text-start">
                {t("Configure your store information")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 flex justify-start gap-x-5">
                <div className="w-1/4">
                  <Label htmlFor="store-name">{t("Logo")}</Label>
                  <Input
                    type="file"
                    multiple={false}
                    id="store-logo"
                    onChange={(e) => handleLogoChange(e.target.files)}
                    className="neon-input"
                  />
                </div>
                <Image
                  src={logoImage ?? icon}
                  alt="logo"
                  width={"100"}
                  height={"100"}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="store-name">{t("Store Name")}</Label>
                <Input
                  id="store-name"
                  value={storeSettings.storeName}
                  onChange={(e) =>
                    handleStoreChange("storeName", e.target.value)
                  }
                  className="neon-input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="store-address">{t("Store Address")}</Label>
                <Input
                  id="store-address"
                  value={storeSettings.storeAddress}
                  onChange={(e) =>
                    handleStoreChange("storeAddress", e.target.value)
                  }
                  className="neon-input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="refund-days">
                  {t("Order refund max days")}
                </Label>
                <Input
                  type="number"
                  id="refund-days"
                  value={storeSettings.refundDays}
                  onChange={(e) =>
                    handleStoreChange("refundDays", e.target.value)
                  }
                  className="neon-input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency">{t("Currency")}</Label>
                <Select
                  value={storeSettings.currency}
                  onValueChange={(value) =>
                    handleStoreChange("currency", value)
                  }
                  dir={t("dir") as "rtl" | "ltr"}
                >
                  <SelectTrigger id="currency" className="neon-input">
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="usd">USD ($)</SelectItem>
                    <SelectItem value="IQD">IQD (IQD)</SelectItem>
                    <SelectItem value="SP">SP (SP)</SelectItem>
                    <SelectItem value="eur">EUR (€)</SelectItem>
                    <SelectItem value="gbp">GBP (£)</SelectItem>
                    <SelectItem value="cad">CAD ($)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="refund-days">{t("Nearest Amount (0 for none)")}</Label>
                <NumberInput
                  type="number"
                  id="refund-days"
                  value={Number(storeSettings.nearestValue)}
                  onChange={(e) =>
                    handleStoreChange("nearestValue", e.toFixed(2))
                  }
                  className="neon-input"
                />
              </div>

              {/* <div className="flex items-center justify-between pt-2">
                <div className="space-y-0.5">
                  <Label htmlFor="tax-enabled">{t("Enable Tax")}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t("Apply tax to transactions")}
                  </p>
                </div>
                <Switch
                  id="tax-enabled"
                  checked={storeSettings.taxEnabled === "true"}
                  onCheckedChange={(checked) =>
                    handleStoreChange("taxEnabled", checked.toString())
                  }
                />
              </div> */}
            </CardContent>
          </Card>
        </TabsContent>

        {/* <TabsContent value="notifications">
          <Card className="neon-card neon-border">
            <CardHeader>
              <CardTitle className="rtl:text-start">
                {t("Notification Settings")}
              </CardTitle>
              <CardDescription className="rtl:text-start">
                {t("Configure when and how you receive notifications")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-notifications">
                    {t("Email Notifications")}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {t("Receive notifications via email")}
                  </p>
                </div>
                <Switch
                  id="email-notifications"
                  checked={notificationSettings.emailNotifications === "true"}
                  onCheckedChange={(checked) =>
                    handleNotificationChange(
                      "emailNotifications",
                      checked.toString()
                    )
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="inventory-alerts">
                    {t("Inventory Alerts")}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {t("Notify when inventory is low")}
                  </p>
                </div>
                <Switch
                  id="inventory-alerts"
                  checked={notificationSettings.inventoryAlerts === "true"}
                  onCheckedChange={(checked) =>
                    handleNotificationChange(
                      "inventoryAlerts",
                      checked.toString()
                    )
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="sales-reports">{t("Sales Reports")}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t("Receive daily sales reports")}
                  </p>
                </div>
                <Switch
                  id="sales-reports"
                  checked={notificationSettings.salesReports === "true"}
                  onCheckedChange={(checked) =>
                    handleNotificationChange("salesReports", checked.toString())
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent> */}

        {checkPermission(Permission.EDIT_USERS) && (
          <TabsContent value="users">
            <UserRoleManager />
          </TabsContent>
        )}

        {checkPermission(Permission.EDIT_USERS) && (
          <TabsContent value="permissions">
            <RolePermissionManager />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
