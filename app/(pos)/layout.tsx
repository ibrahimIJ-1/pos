import { POSProvider } from "@/providers/POSProvider";
import { Permission } from "@/lib/permissions";
import POSSidebar from "@/components/PosSidebar";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/sidebar";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const additionalPermissions: any[] = [];
  return (
    <POSProvider>
      <Navbar>
        <POSSidebar additionalPermissions={[]} />
      </Navbar>
      {children}
    </POSProvider>
  );
}
