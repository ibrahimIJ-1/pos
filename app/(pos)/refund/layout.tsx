import { RefundProvider } from "@/providers/RefundProvider";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <RefundProvider>
      {children}
    </RefundProvider>
  );
}
