import { POSProvider } from "@/providers/POSProvider";
import { Permission } from "@/lib/permissions";
import POSSidebar from "@/components/PosSidebar";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const additionalPermissions: any[] = [];
  return (
    <POSProvider>
      <div className="fixed">
        <POSSidebar additionalPermissions={additionalPermissions} />
      </div>
      {children}
    </POSProvider>
  );
}
