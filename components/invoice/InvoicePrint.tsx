import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Printer, Download, Send } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { Sale, SaleItem } from "@prisma/client";

interface InvoicePrintProps {
  data: any; //Sale
  onClose: () => void;
}

export function InvoicePrint({ data, onClose }: InvoicePrintProps) {
  const [printing, setPrinting] = useState(false);

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
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Invoice</h2>
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
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Download
          </Button>
          <Button variant="outline" className="gap-2">
            <Send className="h-4 w-4" />
            Email
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>

      <div className="bg-white p-8 rounded-lg shadow-lg max-w-3xl mx-auto">
        <div className="print:block">
          {/* Invoice Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-3xl font-bold text-primary">Invoice</h1>
              <p className="text-muted-foreground">#{data.id}</p>
            </div>
            <div className="text-right">
              <div className="h-10 w-10 rounded-md bg-primary flex items-center justify-center mb-2 ml-auto">
                <span className="text-primary-foreground font-bold">P</span>
              </div>
              <p className="font-bold">POS System</p>
              <p className="text-muted-foreground text-sm">
                123 Business Street
              </p>
              <p className="text-muted-foreground text-sm">
                contact@possystem.com
              </p>
            </div>
          </div>

          {/* Invoice Details */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="font-semibold mb-1 text-muted-foreground">
                Bill To:
              </h3>
              <p className="font-bold">
                {data.customer?.name || "Guest Customer"}
              </p>
              {data.customerId && (
                <p className="text-sm text-muted-foreground">
                  ID: {data.customerId}
                </p>
              )}
            </div>
            <div className="text-right">
              <div className="mb-2">
                <h3 className="font-semibold text-muted-foreground">
                  Invoice Date:
                </h3>
                <p>{formatDate(data.date)}</p>
              </div>
              <div>
                <h3 className="font-semibold text-muted-foreground">
                  Payment Method:
                </h3>
                <p className="capitalize">{data.paymentMethod}</p>
              </div>
            </div>
          </div>

          {/* Invoice Table */}
          <div className="mb-8">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="py-2 text-left">Item</th>
                  <th className="py-2 text-right">Qty</th>
                  <th className="py-2 text-right">Unit Price</th>
                  <th className="py-2 text-right">Discount</th>
                  <th className="py-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((item: SaleItem) => (
                  <tr key={item.id} className="border-b">
                    <td className="py-3">{item.productName}</td>
                    <td className="py-3 text-right">{item.quantity}</td>
                    <td className="py-3 text-right">
                      ${item.unitPrice.toString()}
                    </td>
                    <td className="py-3 text-right">
                      {parseFloat(item.discountAmount.toString()) > 0
                        ? `$${item.discountAmount}`
                        : "-"}
                    </td>
                    <td className="py-3 text-right">
                      ${item.subtotal.toString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Invoice Summary */}
          <div className="flex justify-end mb-8">
            <div className="w-72">
              <div className="flex justify-between py-1">
                <span className="text-muted-foreground">Subtotal:</span>
                <span>${data.subtotal.toString()}</span>
              </div>
              {parseFloat(data.discountTotal.toString()) > 0 && (
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Discount:</span>
                  <span className="text-green-600">
                    -${data.discountTotal.toString()}
                  </span>
                </div>
              )}
              <div className="flex justify-between py-1">
                <span className="text-muted-foreground">Tax:</span>
                <span>${data.taxTotal.toString()}</span>
              </div>
              <div className="flex justify-between py-2 border-t font-bold">
                <span>Total:</span>
                <span>${data.totalAmount.toString()}</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-sm text-muted-foreground border-t pt-4">
            <p>Thank you for your business!</p>
            <p>
              For questions or concerns regarding this invoice, please contact
              our customer service.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InvoicePrint;
