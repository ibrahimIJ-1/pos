import React from "react";
import { Button } from "../ui/button";
import { LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

const LogoutButton = () => {
  const t = useTranslations();
  const { logout } = useAuth();
  const navigate = useRouter();
  const handleLogout = () => {
    // Implement actual logout logic here
    logout();
    navigate.push("/auth/login");
  };
  return (
    <Button variant="destructive" size="sm" className="gap-2" onClick={logout}>
      <LogOut className="h-4 w-4" />
      <span>{t("Logout")}</span>
    </Button>
  );
};

export default LogoutButton;
