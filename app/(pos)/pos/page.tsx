import InvoicePrintDialog from "@/components/pos/InvoicePrintDialog";
import PaymentDialog from "@/components/pos/PaymentDialog";
import ItemsSelector from "@/components/pos/ItemsSelector";
import FullCart from "@/components/pos/FullCart";
import QrScannerModal from "@/components/qr-scanner-modal/QrScannerModal";

function POS() {
  return (
    <div className="px-10 max-sm:px-1 py-4 dark:pt-0 neon-card dark:bg-black  dark:border-b-1 dark:border-r-1 dark:border-l-1 rounded-b-md dark:shadow-md dark:shadow-violet-700 dark:border-violet-800 h-[95vh]">
      <div className="flex max-sm:flex-col-reverse justify-center gap-4 md:h-[-webkit-fill-available]">
        <div className="w-2/4 lg:w-3/4 max-sm:w-full">
          <ItemsSelector />
        </div>
        <div className="w-2/4 lg:w-auto max-sm:w-full">
          <FullCart />
        </div>
      </div>
      <PaymentDialog />
      <InvoicePrintDialog />
      <QrScannerModal />
    </div>
  );
}

export default POS;
