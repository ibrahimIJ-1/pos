"use client";

import FullRefund from "@/components/refund/FullRefund";
import FullSale from "@/components/refund/FullSale";
import RefundDialog from "@/components/refund/RefundDialog";
import RefundSelector from "@/components/refund/RefundSelector";
import { useRefund } from "@/providers/RefundProvider";

function Refund() {
  const { refund } = useRefund();
  return (
    <div className="px-10 py-4 dark:pt-0 neon-card dark:bg-black  dark:border-b-1 dark:border-r-1 dark:border-l-1 rounded-b-md dark:shadow-md dark:shadow-violet-700 dark:border-violet-800 h-[90vh]">
      <div className="w-full">
        <RefundSelector />
      </div>
      <div className="flex justify-center gap-x-4">
        <div className="w-2/4 h-[80vh]">{refund && <FullSale />}</div>
        <div className="w-2/4 h-[80vh]">{refund && <FullRefund />}</div>
      </div>
      <RefundDialog />
      {/* <InvoicePrintDialog /> */}
    </div>
  );
}

export default Refund;
