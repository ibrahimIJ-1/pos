import InvoicePrintDialog from "@/components/pos/InvoicePrintDialog";
import PaymentDialog from "@/components/pos/PaymentDialog";
import ItemsSelector from "@/components/pos/ItemsSelector";
import FullCart from "@/components/pos/FullCart";

function POS() {
  return (
    <div className="px-10 py-4 dark:pt-0 neon-card dark:bg-black  dark:border-b-1 dark:border-r-1 dark:border-l-1 rounded-b-md dark:shadow-md dark:shadow-violet-700 dark:border-violet-800 h-[95vh]">
      <div className="flex justify-center gap-4 h-[-webkit-fill-available]">
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
