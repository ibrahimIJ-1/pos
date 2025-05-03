import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DateInput } from "@/components/ui/date-input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { FileDown, Printer, UserPlus } from "lucide-react";
import { reportsApi } from "@/lib/api";
import { format, subMonths } from "date-fns";
import { useCustomerReports } from "@/lib/reports-service";
import { useTranslations } from "next-intl";
import { useSystem } from "@/providers/SystemProvider";

export default function CustomerReports() {
  const { storeCurrency } = useSystem();
  const t = useTranslations();
  const [fromDate, setFromDate] = useState<Date>(subMonths(new Date(), 3));
  const [toDate, setToDate] = useState<Date>(new Date());

  // Fetch customer report data
  const { data, isLoading } = useCustomerReports(fromDate, toDate);

  // Handle export
  const handleExport = async () => {
    try {
      const blob = await reportsApi.exportReport("customers", "csv", {
        from: format(fromDate, "yyyy-MM-dd"),
        to: format(toDate, "yyyy-MM-dd"),
      });

      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `customer-report-${format(
        fromDate,
        "yyyy-MM-dd"
      )}-to-${format(toDate, "yyyy-MM-dd")}.csv`;
      document.body.appendChild(a);
      a.click();

      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error exporting report:", error);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div>
              <CardTitle>{t("Customer Report")}</CardTitle>
              <CardDescription>
                {t("Analyze customer purchasing patterns and behavior")}
              </CardDescription>
            </div>

            <div className="flex flex-wrap gap-2">
              <div className="flex gap-2">
                <DateInput
                  date={fromDate}
                  onDateChange={(val) => setFromDate(val!)}
                  placeholder={t("From Date")}
                />
                <DateInput
                  date={toDate}
                  onDateChange={(val) => setToDate(val!)}
                  placeholder={t("To Date")}
                />
              </div>

              {/* <div className="flex gap-2">
                <Button variant="outline" size="icon" onClick={handleExport}>
                  <FileDown className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <Printer className="h-4 w-4" />
                </Button>
              </div> */}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <p>{t("Loading customer data")}...</p>
            </div>
          ) : data ? (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="text-sm text-muted-foreground">
                      {t("Total Customers")}
                    </div>
                    <div className="text-2xl font-bold">
                      {data.totalCustomers || 0}
                    </div>
                    <div className="flex items-center gap-2 text-xs mt-1 text-muted-foreground">
                      <UserPlus className="h-3 w-3" />
                      <span>
                        {data.newCustomers || 0} {t("new in this period")}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="text-sm text-muted-foreground">
                      {t("Average Purchase Value")}
                    </div>
                    <div className="text-2xl font-bold">
                    {storeCurrency} {data.averagePurchaseValue?.toFixed(2) || "0.00"}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="text-sm text-muted-foreground">
                      {t("Customer Retention Rate")}
                    </div>
                    <div className="text-2xl font-bold">
                      {data.customerRetentionRate?.toFixed(1) || "0"}%
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div>
                <h3 className="font-medium mb-4">{t("Top Customers")}</h3>
                <Table dir={t("dir") as "rtl" | "ltr"}>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="rtl:text-start">
                        {t("Customer")}
                      </TableHead>
                      <TableHead className="rtl:text-start">
                        {t("Purchases")}
                      </TableHead>
                      <TableHead className="rtl:text-start">
                        {t("Total Spend")}
                      </TableHead>
                      <TableHead className="rtl:text-start">
                        {t("Average Order Value")}
                      </TableHead>
                      <TableHead className="rtl:text-start">
                        {t("Last Purchase")}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.topCustomers?.map((customer: any) => (
                      <TableRow key={customer.id}>
                        <TableCell className="font-medium">
                          {customer.name}
                        </TableCell>
                        <TableCell>{customer.purchaseCount}</TableCell>
                        <TableCell>{storeCurrency} {customer.totalSpend.toFixed(2)}</TableCell>
                        <TableCell>
                          {storeCurrency} {customer.averageOrderValue.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          {new Date(
                            customer.lastPurchaseDate
                          ).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div>
                <h3 className="font-medium mb-4">
                  {t("Customer Purchasing by Location")}
                </h3>
                <Table dir={t("dir") as "rtl" | "ltr"}>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="rtl:text-start">
                        {t("Region")}
                      </TableHead>
                      <TableHead className="rtl:text-start">
                        {t("Customers")}
                      </TableHead>
                      <TableHead className="rtl:text-start">
                        {t("Orders")}
                      </TableHead>
                      <TableHead className="rtl:text-start">
                        {t("Revenue")}
                      </TableHead>
                      <TableHead className="rtl:text-start">
                        {t("Average Order Value")}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.customerPurchasesByLocation?.map((location: any) => (
                      <TableRow key={location.region}>
                        <TableCell className="font-medium">
                          {location.region}
                        </TableCell>
                        <TableCell>{location.customerCount}</TableCell>
                        <TableCell>{location.orderCount}</TableCell>
                        <TableCell>{storeCurrency} {location.revenue.toFixed(2)}</TableCell>
                        <TableCell>
                          {storeCurrency} {location.averageOrderValue.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          ) : (
            <div className="flex justify-center items-center h-40">
              <p>{t("No customer data available for the selected period")}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
