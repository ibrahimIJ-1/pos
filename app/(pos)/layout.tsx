import Navbar from "@/components/Navbar";
import { SystemProvider } from "@/providers/SystemProvider";
import Sidebar from "@/components/sidebar/sidebar";
import { SidebarPOSItems } from "@/components/sidebar/sidebar-items";
export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const additionalPermissions: any[] = [];
  return (
    <SystemProvider>
      <Navbar>
        <Sidebar
          additionalPermissions={[]}
          sidebarItems={SidebarPOSItems}
          title="POS System"
          description="Sale Or Refund your products, make a happy customer"
        />
      </Navbar>
      {children}
    </SystemProvider>
  );
}
