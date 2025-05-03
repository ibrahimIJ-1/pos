import React from "react";
import { Button } from "../ui/button";
import { LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

const LogoutButton = () => {
  const t = useTranslations();
  const { logout } = useAuth();
  const router = useRouter();
  const handleLogout = async () => {
    // Implement actual logout logic here
    logout().then(() => {
      router.replace("/");
    });
  };
  return (
    <Button
      variant="destructive"
      size="sm"
      className="gap-2"
      onClick={handleLogout}
    >
      <LogOut className="h-4 w-4" />
      <span>{t("Logout")}</span>
    </Button>
  );
};

export default LogoutButton;
