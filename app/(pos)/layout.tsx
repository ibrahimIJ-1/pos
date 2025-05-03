import POSSidebar from "@/components/PosSidebar";
import Navbar from "@/components/Navbar";
import { SystemProvider } from "@/providers/SystemProvider";
export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const additionalPermissions: any[] = [];
  return (
    <SystemProvider>
      <Navbar>
        <POSSidebar additionalPermissions={[]} />
      </Navbar>
      {children}
    </SystemProvider>
  );
}
