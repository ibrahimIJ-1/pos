import { POSProvider } from "@/providers/POSProvider";
import { Permission } from "@/lib/permissions";
import POSSidebar from "@/components/PosSidebar";

export default function Layout({
  children,
  additionalPermissions = [],
}: Readonly<{
  children: React.ReactNode;
  additionalPermissions?: Permission[];
}>) {
  return (
    <POSProvider>
      <div className="fixed">
      <POSSidebar additionalPermissions={additionalPermissions} />
      </div>
      {children}
    </POSProvider>
  );
}
