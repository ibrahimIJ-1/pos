import { POSProvider } from "@/providers/POSProvider";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <POSProvider>{children}</POSProvider>;
}
