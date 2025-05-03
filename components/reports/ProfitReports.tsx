import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DateInput } from "@/components/ui/date-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { FileDown, Printer, DollarSign } from "lucide-react";
import { reportsApi } from "@/lib/api";
import {
  format,
  subDays,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
} from "date-fns";
import { useProfitReports } from "@/lib/reports-service";
import { useTranslations } from "next-intl";
import { useSystem } from "@/providers/SystemProvider";

export default function ProfitReports() {
  const { storeCurrency } = useSystem();
  const t = useTranslations();
  const [dateRange, setDateRange] = useState<
    "day" | "week" | "month" | "custom"
  >("month");
  const [fromDate, setFromDate] = useState<Date>(startOfMonth(new Date()));
  const [toDate, setToDate] = useState<Date>(endOfMonth(new Date()));

  // Update date range when the preset option changes
  React.useEffect(() => {
    const today = new Date();

    switch (dateRange) {
      case "day":
        setFromDate(today);
        setToDate(today);
        break;
      case "week":
        setFromDate(startOfWeek(today));
        setToDate(endOfWeek(today));
        break;
      case "month":
        setFromDate(startOfMonth(today));
        setToDate(endOfMonth(today));
        break;
      // For custom, don't automatically change the dates
    }
  }, [dateRange]);

  // Fetch profit report data
  const { data, isLoading } = useProfitReports(fromDate, toDate);

  // Handle export
  const handleExport = async () => {
    try {
      const blob = await reportsApi.exportReport("profit", "csv", {
        from: format(fromDate, "yyyy-MM-dd"),
        to: format(toDate, "yyyy-MM-dd"),
      });

      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `profit-report-${format(fromDate, "yyyy-MM-dd")}-to-${format(
        toDate,
        "yyyy-MM-dd"
      )}.csv`;
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
              <CardTitle>{t("Profit Report")}</CardTitle>
              <CardDescription>
                {t("Analyze revenue, costs, and profit margins")}
              </CardDescription>
            </div>

            <div className="flex flex-wrap gap-2">
              <Select
                value={dateRange}
                onValueChange={(value) => setDateRange(value as any)}
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Date Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">{t("Today")}</SelectItem>
                  <SelectItem value="week">{t("This Week")}</SelectItem>
                  <SelectItem value="month">{t("This Month")}</SelectItem>
                  <SelectItem value="custom">{t("Custom")}</SelectItem>
                </SelectContent>
              </Select>

              {dateRange === "custom" && (
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
              )}

              <div className="flex gap-2">
                <Button variant="outline" size="icon" onClick={handleExport}>
                  <FileDown className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <Printer className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <p>{t("Loading profit data")}...</p>
            </div>
          ) : data ? (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="text-sm text-muted-foreground">
                      {t("Total Revenue")}
                    </div>
                    <div className="text-2xl font-bold">
                    {storeCurrency} {data.totalRevenue?.toFixed(2) || "0.00"}
                    </div>
                    {data.revenueGrowth !== undefined && (
                      <div
                        className={`text-xs mt-1 ${
                          data.revenueGrowth >= 0
                            ? "text-green-600"
                            : "text-destructive"
                        }`}
                      >
                        {data.revenueGrowth >= 0 ? "↑" : "↓"}{" "}
                        {Math.abs(data.revenueGrowth)}%{" "}
                        {t("from previous period")}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="text-sm text-muted-foreground">
                      {t("Cost of Goods")}
                    </div>
                    <div className="text-2xl font-bold">
                      {storeCurrency} {data.totalCosts?.toFixed(2) || "0.00"}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="text-sm text-muted-foreground">
                      {t("Gross Profit")}
                    </div>
                    <div className="text-2xl font-bold">
                      {storeCurrency} {data.grossProfit?.toFixed(2) || "0.00"}
                    </div>
                    {data.profitGrowth !== undefined && (
                      <div
                        className={`text-xs mt-1 ${
                          data.profitGrowth >= 0
                            ? "text-green-600"
                            : "text-destructive"
                        }`}
                      >
                        {data.profitGrowth >= 0 ? "↑" : "↓"}{" "}
                        {Math.abs(data.profitGrowth)}%{" "}
                        {t("from previous period")}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="text-sm text-muted-foreground">
                      {t("Profit Margin")}
                    </div>
                    <div className="text-2xl font-bold">
                      {data.profitMargin?.toFixed(1) || "0"}%
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div>
                <h3 className="font-medium mb-4">{t("Profit by Category")}</h3>
                <Table dir={t("dir") as "rtl" | "ltr"}>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="rtl:text-start">
                        {t("Category")}
                      </TableHead>
                      <TableHead className="rtl:text-start">
                        {t("Revenue")}
                      </TableHead>
                      <TableHead className="rtl:text-start">
                        {t("Cost")}
                      </TableHead>
                      <TableHead className="rtl:text-start">
                        {t("Profit")}
                      </TableHead>
                      <TableHead className="rtl:text-start">
                        {t("Margin")}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.profitByCategory?.map((category) => (
                      <TableRow key={category.name}>
                        <TableCell className="font-medium">
                          {category.name}
                        </TableCell>
                        <TableCell>{storeCurrency} {category.revenue.toFixed(2)}</TableCell>
                        <TableCell>{storeCurrency} {category.cost.toFixed(2)}</TableCell>
                        <TableCell>{storeCurrency} {category.profit.toFixed(2)}</TableCell>
                        <TableCell>{category.margin.toFixed(1)}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div>
                <h3 className="font-medium mb-4">
                  {t("Most Profitable Products")}
                </h3>
                <Table dir={t("dir") as "rtl" | "ltr"}>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="rtl:text-start">
                        {t("Product")}
                      </TableHead>
                      <TableHead className="rtl:text-start">
                        {t("Units Sold")}
                      </TableHead>
                      <TableHead className="rtl:text-start">
                        {t("Revenue")}
                      </TableHead>
                      <TableHead className="rtl:text-start">
                        {t("Cost")}
                      </TableHead>
                      <TableHead className="rtl:text-start">
                        {t("Profit")}
                      </TableHead>
                      <TableHead className="rtl:text-start">
                        {t("Margin")}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.mostProfitableProducts?.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">
                          {product.name}
                        </TableCell>
                        <TableCell>{product.unitsSold}</TableCell>
                        <TableCell>{storeCurrency} {product.revenue.toFixed(2)}</TableCell>
                        <TableCell>{storeCurrency} {product.cost.toFixed(2)}</TableCell>
                        <TableCell>{storeCurrency} {product.profit.toFixed(2)}</TableCell>
                        <TableCell>{product.margin.toFixed(1)}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          ) : (
            <div className="flex justify-center items-center h-40">
              <p>{t("No profit data available for the selected period")}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
