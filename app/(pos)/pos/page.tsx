import InvoicePrintDialog from "@/components/pos/InvoicePrintDialog";
import PaymentDialog from "@/components/pos/PaymentDialog";
import ItemsSelector from "@/components/pos/ItemsSelector";
import FullCart from "@/components/pos/FullCart";

function POS() {
  return (
    <div className="px-10 py-4 neon-card h-screen">
      <div className="flex gap-4">
        <div className="w-2/4 lg:w-3/4">
          <ItemsSelector />
        </div>
        <div className="w-2/4 lg:w-auto">
          <FullCart />
        </div>
      </div>
      <PaymentDialog />
      <InvoicePrintDialog />
    </div>
  );
}

export default POS;
