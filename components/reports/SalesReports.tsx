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
import {
  FileDown,
  Printer,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  TrendingDown,
  CalendarRange,
  ShoppingBag,
} from "lucide-react";
import { reportsApi } from "@/lib/api";
import {
  format,
  subDays,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
} from "date-fns";
import { LineChart, BarChart } from "@/components/ui/chart";
import { useSalesReports } from "@/lib/reports-service";
import { useTranslations } from "next-intl";
import { useSystem } from "@/providers/SystemProvider";

export default function SalesReports() {
  const { storeCurrency } = useSystem();
  const t = useTranslations();
  const [dateRange, setDateRange] = useState<
    "day" | "week" | "month" | "custom"
  >("week");
  const [fromDate, setFromDate] = useState<Date>(startOfWeek(new Date()));
  const [toDate, setToDate] = useState<Date>(endOfWeek(new Date()));
  const [chartType, setChartType] = useState<"bar" | "line">("bar");
  const { data, isLoading }: { data: any | undefined; isLoading: boolean } =
    useSalesReports(fromDate, toDate);

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
    }
  }, [dateRange]);

  const handleExport = async () => {
    try {
      const blob = await reportsApi.exportReport("sales", "csv", {
        from: format(fromDate, "yyyy-MM-dd"),
        to: format(toDate, "yyyy-MM-dd"),
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `sales-report-${format(fromDate, "yyyy-MM-dd")}-to-${format(
        toDate,
        "yyyy-MM-dd"
      )}.csv`;
      document.body.appendChild(a);
      a.click();

      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error exporting report:", error);
    }
  };

  const getChartData = () => {
    if (!data?.hourlyData) return [];
    return data.hourlyData.map((item: any) => ({
      name: item.hour,
      Sales: item.sales,
      Transactions: item.transactions,
    }));
  };

  const chartConfig = {
    Sales: { color: "indigo" },
    Transactions: { color: "blue" },
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div>
              <CardTitle>{t("Sales Performance Analysis")}</CardTitle>
              <CardDescription>
                {t(
                  "Comprehensive analysis of sales trends, patterns, and performance metrics"
                )}
              </CardDescription>
            </div>

            <div className="flex flex-wrap gap-2">
              <Select
                value={dateRange}
                onValueChange={(value) =>
                  setDateRange(value as "day" | "week" | "month" | "custom")
                }
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
              <p>{t("Loading sales data")}...</p>
            </div>
          ) : data ? (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-center mb-2">
                      <div className="text-sm text-muted-foreground">
                        {t("Total Sales")}
                      </div>
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    </div>
                    <div className="text-2xl font-bold">
                    {storeCurrency} {data.totalSales?.toFixed(2) || "0.00"}
                    </div>
                    {data.salesGrowth !== undefined && (
                      <div
                        className={`text-xs mt-1 flex items-center ${
                          data.salesGrowth >= 0
                            ? "text-green-600"
                            : "text-destructive"
                        }`}
                      >
                        {data.salesGrowth >= 0 ? (
                          <ArrowUpRight className="h-3 w-3 mr-1" />
                        ) : (
                          <ArrowDownRight className="h-3 w-3 mr-1" />
                        )}
                        {Math.abs(data.salesGrowth)}%{" "}
                        {t("from previous period")}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-center mb-2">
                      <div className="text-sm text-muted-foreground">
                        {t("Total Transactions")}
                      </div>
                      <ShoppingBag className="h-4 w-4 text-blue-500" />
                    </div>
                    <div className="text-2xl font-bold">
                      {data.totalTransactions || 0}
                    </div>
                    {data.transactionsGrowth !== undefined && (
                      <div
                        className={`text-xs mt-1 flex items-center ${
                          data.transactionsGrowth >= 0
                            ? "text-green-600"
                            : "text-destructive"
                        }`}
                      >
                        {data.transactionsGrowth >= 0 ? (
                          <ArrowUpRight className="h-3 w-3 mr-1" />
                        ) : (
                          <ArrowDownRight className="h-3 w-3 mr-1" />
                        )}
                        {Math.abs(data.transactionsGrowth)}%{" "}
                        {t("from previous period")}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card dir={t("dir") as "rtl" | "ltr"}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-center mb-2">
                      <div className="text-sm text-muted-foreground">
                        {t("Average Transaction Value")}
                      </div>
                      <CalendarRange className="h-4 w-4 text-purple-500" />
                    </div>
                    <div className="text-2xl font-bold">
                    {storeCurrency} {data.averageTransactionValue?.toFixed(2) || "0.00"}
                    </div>
                    {data.avgTransactionGrowth !== undefined && (
                      <div
                        className={`text-xs mt-1 flex items-center ${
                          data.avgTransactionGrowth >= 0
                            ? "text-green-600"
                            : "text-destructive"
                        }`}
                      >
                        {data.avgTransactionGrowth >= 0 ? (
                          <ArrowUpRight className="h-3 w-3 mr-1" />
                        ) : (
                          <ArrowDownRight className="h-3 w-3 mr-1" />
                        )}
                        {Math.abs(data.avgTransactionGrowth)}%{" "}
                        {t("from previous period")}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <Card dir={t("dir") as "rtl" | "ltr"}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg rtl:text-start">
                      {t("Hourly Sales Trend")}
                    </CardTitle>
                    <div className="flex gap-2">
                      <Button
                        variant={chartType === "bar" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setChartType("bar")}
                      >
                        <BarChart3 className="h-4 w-4 mr-1" /> {t("Bar")}
                      </Button>
                      <Button
                        variant={chartType === "line" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setChartType("line")}
                      >
                        <TrendingUp className="h-4 w-4 mr-1" /> {t("Line")}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="max-h-[300px]">
                  {chartType === "bar" ? (
                    <BarChart
                      dir={t("dir") as "rtl" | "ltr"}
                      data={getChartData()}
                      className="max-h-[300px] w-full"
                      index="name"
                      categories={["Sales", "Transactions"]}
                      colors={["indigo", "blue"]}
                      valueFormatter={(value) =>
                        typeof value === "number"
                          ? value > 100
                            ? `${storeCurrency} ${value.toFixed(0)}`
                            : value.toString()
                          : value
                      }
                      showLegend
                      showAnimation
                      config={chartConfig}
                    >
                      <div />
                    </BarChart>
                  ) : (
                    <LineChart
                      dir={t("dir") as "rtl" | "ltr"}
                      data={getChartData()}
                      index="name"
                      className="max-h-[300px] w-full"
                      categories={["Sales", "Transactions"]}
                      colors={["indigo", "blue"]}
                      valueFormatter={(value) =>
                        typeof value === "number"
                          ? value > 100
                            ? `${storeCurrency} ${value.toFixed(0)}`
                            : value.toString()
                          : value
                      }
                      showLegend
                      showAnimation
                      config={chartConfig}
                    >
                      <div />
                    </LineChart>
                  )}
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card dir={t("dir") as "rtl" | "ltr"}>
                  <CardHeader>
                    <CardTitle className="text-lg rtl:text-start">
                      {t("Sales by Payment Method")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table dir={t("dir") as "rtl" | "ltr"}>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="rtl:text-start">
                            {t("Payment Method")}
                          </TableHead>
                          <TableHead className="rtl:text-start">
                            {t("Transactions")}
                          </TableHead>
                          <TableHead className="rtl:text-start">
                            {t("Total")}
                          </TableHead>
                          <TableHead className="rtl:text-start">
                            % {t("of Sales")}
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.salesByPaymentMethod?.map((item: any) => (
                          <TableRow key={item.method}>
                            <TableCell className="font-medium">
                              {item.method}
                            </TableCell>
                            <TableCell>{item.count}</TableCell>
                            <TableCell>{storeCurrency} {item.amount?.toFixed(2)}</TableCell>
                            <TableCell>
                              {item.percentage?.toFixed(1)}%
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                <Card dir={t("dir") as "rtl" | "ltr"}>
                  <CardHeader>
                    <CardTitle className="text-lg rtl:text-start">
                      {t("Sales by Category")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table dir={t("dir") as "rtl" | "ltr"}>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="rtl:text-start">
                            {t("Category")}
                          </TableHead>
                          <TableHead className="rtl:text-start">
                            {t("Sales")}
                          </TableHead>
                          <TableHead className="rtl:text-start">
                            % {t("of Total")}
                          </TableHead>
                          <TableHead className="rtl:text-start">
                            {t("Growth")}
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.salesByCategory?.map((item: any) => (
                          <TableRow key={item.category}>
                            <TableCell className="font-medium">
                              {item.category}
                            </TableCell>
                            <TableCell>{storeCurrency} {item.sales?.toFixed(2)}</TableCell>
                            <TableCell>
                              {item.percentage?.toFixed(1)}%
                            </TableCell>
                            <TableCell
                              className={
                                item.growth >= 0
                                  ? "text-green-600"
                                  : "text-destructive"
                              }
                            >
                              <div className="flex items-center">
                                {item.growth >= 0 ? (
                                  <ArrowUpRight className="h-3 w-3 mr-1" />
                                ) : (
                                  <ArrowDownRight className="h-3 w-3 mr-1" />
                                )}
                                {Math.abs(item.growth)}%
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <Card dir={t("dir") as "rtl" | "ltr"}>
                  <CardHeader>
                    <CardTitle className="text-lg rtl:text-start">
                      {t("Top Selling Products")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table dir={t("dir") as "rtl" | "ltr"}>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="rtl:text-start">
                            {t("Product")}
                          </TableHead>
                          <TableHead className="rtl:text-start">
                            {t("Category")}
                          </TableHead>
                          <TableHead className="rtl:text-start">
                            {t("Quantity Sold")}
                          </TableHead>
                          <TableHead className="rtl:text-start">
                            {t("Revenue")}
                          </TableHead>
                          <TableHead className="rtl:text-start">
                            {t("Avg Price")}
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.topProducts?.map((product: any) => (
                          <TableRow key={product.id}>
                            <TableCell className="font-medium">
                              {product.name}
                            </TableCell>
                            <TableCell>{product.category}</TableCell>
                            <TableCell>{product.quantitySold}</TableCell>
                            <TableCell>
                              {storeCurrency} {product.revenue?.toFixed(2)}
                            </TableCell>
                            <TableCell>
                              {storeCurrency} 
                              {(product.revenue && product.quantitySold
                                ? product.revenue / product.quantitySold
                                : 0
                              )?.toFixed(2)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                <Card dir={t("dir") as "rtl" | "ltr"}>
                  <CardHeader>
                    <CardTitle className="text-lg rtl:text-start">
                      {t("Sales by Employee")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table dir={t("dir") as "rtl" | "ltr"}>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="rtl:text-start">
                            {t("Employee")}
                          </TableHead>
                          <TableHead className="rtl:text-start">
                            {t("Sales")}
                          </TableHead>
                          <TableHead className="rtl:text-start">
                            {t("Transactions")}
                          </TableHead>
                          <TableHead className="rtl:text-start">
                            {t("Avg Transaction")}
                          </TableHead>
                          <TableHead className="rtl:text-start">
                            % {t("of Total")}
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.salesByEmployee?.map(
                          (employee: any, index: number) => (
                            <TableRow key={index}>
                              <TableCell className="font-medium">
                                {employee.name}
                              </TableCell>
                              <TableCell>
                                {storeCurrency} {employee.sales?.toFixed(2)}
                              </TableCell>
                              <TableCell>{employee.transactions}</TableCell>
                              <TableCell>
                                {storeCurrency} {employee.average?.toFixed(2)}
                              </TableCell>
                              <TableCell>
                                {(data.totalSales && employee.sales
                                  ? (employee.sales / data.totalSales) * 100
                                  : 0
                                )?.toFixed(1)}
                                %
                              </TableCell>
                            </TableRow>
                          )
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <div className="flex justify-center items-center h-40">
              <p>{t("No sales data available for the selected period")}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
