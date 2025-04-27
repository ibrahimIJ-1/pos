import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Printer, Download, Send } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { Sale, SaleItem } from "@prisma/client";
import { ScrollArea } from "../ui/scroll-area";
import { useReactToPrint } from "react-to-print";
import { usePOS } from "@/providers/POSProvider";
interface InvoicePrintProps {
  data: any; //Sale
  onClose: () => void;
}

export function InvoicePrint({ data, onClose }: InvoicePrintProps) {
  const { trans } = usePOS();
  const [printing, setPrinting] = useState(false);

  const componentRef = useRef<HTMLDivElement>(null);

  const handleDownloadPDF = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `invoice-${data.id}`,
    pageStyle: `
    @media print { 
      @page { 
        size: A4 portrait;
        margin: 15mm 10mm;
      }
      body { 
        -webkit-print-color-adjust: exact;
        background: white !important;
        color: black !important;
        font-size: 12pt !important;
      }
      .no-print { 
        display: none !important; 
      }
      .print-table {
        width: 100% !important;
        display: table !important;
      }
      .scroll-area {
        overflow: visible !important;
        height: auto !important;
      }
      .invoice-card {
        box-shadow: none !important;
        border-radius: 0 !important;
      }
    }
  `,
  });
  // const printReceipt = async () => {
  //   try {
  //     setPrinting(true);

  //     // Create a printable HTML content
  //     const printableContent = `
  //       <div style="font-family: Arial, sans-serif; padding: 5px;">
  //         <h1 style="text-align: center;">Invoice</h1>
  //         <p style="text-align: center;">#${data.id}</p>
  //         <div style="display: flex; justify-content: space-between; margin-bottom: 7px; width:100%;">
  //           <div>
  //             <h3>Bill To:</h3>
  //             <p>${data.customer?.name || "Guest Customer"}</p>
  //             ${data.customerId ? `<p>ID: ${data.customerId}</p>` : ""}
  //           </div>
  //           <div>
  //             <h3>Invoice Date:</h3>
  //             <p>${formatDate(data.date)}</p>
  //             <h3>Payment Method:</h3>
  //             <p>${data.paymentMethod}</p>
  //           </div>
  //         </div>
  //         <table style="width: 100%; border-collapse: collapse;">
  //           <thead>
  //             <tr>
  //               <th style="text-align: left;">Item</th>
  //               <th style="text-align: right;">Qty</th>
  //               <th style="text-align: right;">Price</th>
  //               <th style="text-align: right;">Amount</th>
  //             </tr>
  //           </thead>
  //           <tbody>
  //             ${data.items
  //               .map(
  //                 (item: SaleItem) => `
  //               <tr>
  //                 <td style="font-size: 10px;">${item.productName}</td>
  //                 <td style="text-align: right; font-size: 10px;">${
  //                   item.quantity
  //                 }</td>
  //                 <td style="text-align: right; font-size: 10px;">$${item.unitPrice.toString()}</td>
  //                 <td style="text-align: right; font-size: 10px;">$${item.subtotal.toString()}</td>
  //               </tr>
  //             `
  //               )
  //               .join("")}
  //           </tbody>
  //         </table>
  //         <div style="text-align: right; margin-top: 20px;">
  //           <p>Subtotal: $${data.subtotal.toString()}</p>
  //           ${
  //             parseFloat(data.discountTotal.toString()) > 0
  //               ? `<p>Discount: -$${data.discountTotal.toString()}</p>`
  //               : ""
  //           }
  //           <p>Tax: $${data.taxTotal.toString()}</p>
  //           <p><strong>Total: $${data.totalAmount.toString()}</strong></p>
  //         </div>
  //         <div style="text-align: center; margin-top: 20px;">
  //           <p>Thank you for your business!</p>
  //           <p>For questions or concerns regarding this invoice, please contact our customer service.</p>
  //         </div>
  //       </div>
  //     `;

  //     // Open a new window with the printable content
  //     const printWindow = window.open("", "_blank");
  //     printWindow.document.write(printableContent);
  //     printWindow.document.close();
  //     printWindow.print();
  //   } catch (error) {
  //     console.error("Printing error:", error);
  //     alert("Failed to print: " + error.message);
  //   } finally {
  //     setPrinting(false);
  //   }
  // };

  const printWithService = async () => {
    try {
      setPrinting(true);

      // Prepare the bill data to send to the service
      const billData = {
        Id: data.id, // Invoice ID
        storeName: data.storeName, // storeName
        branchName: data.branch?.name, // branchName
        branchAddress: data.branch?.address, // branchAddress
        cashierName: data.cashier?.name, // cashierName
        CustomerName: data.customer?.name || "Guest Customer", // Customer name
        CustomerId: data.customerId || "", // Customer ID (optional)
        Date: formatDate(data.date), // Invoice date
        PaymentMethod: data.paymentMethod, // Payment method
        Items: data.items.map((item: SaleItem) => ({
          Name: item.productName, // Item name
          Quantity: item.quantity, // Item quantity
          Price: item.unitPrice, // Item unit price
          Subtotal: item.subtotal, // Item subtotal (quantity * price)
        })),
        Subtotal: data.subtotal, // Subtotal amount
        DiscountTotal: data.discountTotal, // Discount amount
        TaxTotal: data.taxTotal, // Tax amount
        TotalAmount: data.totalAmount, // Total amount
      };

      // Send the bill data to the Windows Service
      const response = await fetch("http://localhost:5000/print", {
        method: "POST",
        headers: {
          "Content-Type": "application/json", // Ensure this header is set
        },
        body: JSON.stringify(billData),
      });

      if (!response.ok) {
        throw new Error("Failed to send print request to the service");
      }
    } catch (error) {
      console.error("Printing error:", error);
      alert("Failed to print: " + (error as Error).message);
    } finally {
      setPrinting(false);
    }
  };

  return (
    <div className="p-4 flex flex-col h-[90vh] overflow-y-scroll">
      {" "}
      {/* Control overall height */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">{trans("Invoice")}</h2>
        <div className="flex space-x-2">
          <Button
            className="gap-2"
            variant="default"
            disabled={printing}
            onClick={printWithService}
          >
            <Printer className="h-4 w-4" />
            {printing ? "Printing..." : "Print"}
          </Button>
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => handleDownloadPDF()}
          >
            <Download className="h-4 w-4" />
            {trans("Download")}
          </Button>
          <Button variant="outline" className="gap-2">
            <Send className="h-4 w-4" />
            {trans("Email")}
          </Button>
          <Button variant="ghost" onClick={onClose}>
            {trans("Close")}
          </Button>
        </div>
      </div>
      <div
        ref={componentRef}
        className="bg-white p-6 rounded-lg shadow-lg max-w-3xl mx-auto flex-1 flex flex-col h"
      >
        <div className="print:block flex-1 flex flex-col gap-4">
          {/* Invoice Header */}
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-primary">
                {trans("Invoice")}
              </h1>
              <p className="text-muted-foreground text-sm">#{data.id}</p>
            </div>
            <div className="text-right">
              <div className="mb-2 flex items-center gap-2">
                <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-sm">
                    {data.storeName}
                  </span>
                </div>
                <p className="font-bold text-sm">{data.branch?.name}</p>
              </div>
              <p className="text-muted-foreground text-xs">
                {data.branch?.address}
              </p>
              <p className="text-muted-foreground text-xs">
                {data.cashier.name}
              </p>
            </div>
          </div>

          {/* Invoice Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-1">
                {trans("Bill To")}:
              </h3>
              <p className="font-medium">
                {data.customer?.name || "Guest Customer"}
              </p>
            </div>
            <div>
              <div className="flex flex-col md:items-end">
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold">{trans("Date")}:</span>{" "}
                  {formatDate(data.date)}
                </p>
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold">{trans("Payment")}:</span>{" "}
                  {data.paymentMethod}
                </p>
              </div>
            </div>
          </div>

          {/* Scrollable Items Table */}
          <div className="flex-1 overflow-hidden border rounded-lg">
            <ScrollArea className="h-full">
              <table className="w-full relative">
                <thead className="sticky top-0 bg-background z-10 border-b">
                  <tr>
                    <th className="text-left py-3 px-4 text-sm font-semibold">
                      {trans("Item")}
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-semibold">
                      {trans("Qty")}
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-semibold">
                      {trans("Price")}
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-semibold">
                      {trans("Discount")}
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-semibold">
                      {trans("Amount")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((item: SaleItem) => (
                    <tr key={item.id} className="border-b hover:bg-muted/10">
                      <td className="py-2 px-4 text-sm">{item.productName}</td>
                      <td className="py-2 px-4 text-sm text-right">
                        {item.quantity}
                      </td>
                      <td className="py-2 px-4 text-sm text-right">
                        ${item.unitPrice.toFixed(2)}
                      </td>
                      <td className="py-2 px-4 text-sm text-right">
                        {Number(item.discountAmount) > 0
                          ? `-$${item.discountAmount.toFixed(2)}`
                          : "-"}
                      </td>
                      <td className="py-2 px-4 text-sm text-right font-medium">
                        ${item.subtotal.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </ScrollArea>
          </div>

          {/* Totals Section */}
          <div className="border-t pt-4">
            <div className="flex justify-end">
              <div className="w-full md:w-64">
                <div className="flex justify-between py-1 text-sm">
                  <span className="text-muted-foreground">
                    {trans("Subtotal")}:
                  </span>
                  <span>${data.subtotal.toFixed(2)}</span>
                </div>
                {data.discountTotal > 0 && (
                  <div className="flex justify-between py-1 text-sm">
                    <span className="text-muted-foreground">
                      {trans("Discount")}:
                    </span>
                    <span className="text-green-600">
                      -${data.discountTotal.toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between py-1 text-sm">
                  <span className="text-muted-foreground">{trans("Tax")}:</span>
                  <span>${data.taxTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2 border-t font-semibold">
                  <span>{trans("Total")}:</span>
                  <span>${data.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-xs text-muted-foreground pt-4">
            <p>{trans("Thank you for your business")}!</p>
            <p>
              {trans("Questions")}? {trans("Contact our customer service")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InvoicePrint;
