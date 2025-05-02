
import POSSidebar from "@/components/PosSidebar";
import Navbar from "@/components/Navbar";
export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const additionalPermissions: any[] = [];
  return (
    <>
      <Navbar>
        <POSSidebar additionalPermissions={[]} />
      </Navbar>
      {children}
    </>
  );
}
