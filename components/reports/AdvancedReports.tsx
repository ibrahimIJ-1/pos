import React, { useState, ReactNode } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LineChart,
  BarChart,
  PieChart,
  AreaChart,
} from "@/components/ui/chart";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  FileDown,
  Calendar as CalendarIcon,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  Sliders,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import useAdvancedReports from "@/lib/reports-service";
import { useTranslations } from "next-intl";
import { useSystem } from "@/providers/SystemProvider";

export function AdvancedReports() {
  const { storeCurrency } = useSystem();
  const t = useTranslations();
  const [reportType, setReportType] = useState<
    "sales" | "inventory" | "customers" | "profit"
  >("sales");
  const [dateRange, setDateRange] = useState<
    "day" | "week" | "month" | "quarter" | "year"
  >("month");
  const [chartType, setChartType] = useState<"bar" | "line" | "pie" | "area">(
    "bar"
  );
  const [fromDate, setFromDate] = useState<Date>(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  );
  const [toDate, setToDate] = useState<Date>(new Date());

  const { data, isLoading } = useAdvancedReports(
    reportType,
    dateRange,
    fromDate,
    toDate
  );

  const renderChart = () => {
    if (isLoading) {
      return <Skeleton className="w-full h-[300px]" />;
    }

    if (!data || !data.chartData) {
      return (
        <div className="text-center py-12">
          {t("No data available for the selected period")}
        </div>
      );
    }

    // Prepare chart config
    const chartConfig: any = {};
    if (data.categories) {
      data.categories.forEach((category: string, index: number) => {
        chartConfig[category] = {
          color: data.colors?.[index] || undefined,
        };
      });
    }

    // Define children as a React Node (required by the chart components)
    const chartChildren: ReactNode = <React.Fragment />;
    console.log(data.chartData);

    switch (chartType) {
      case "bar":
        return (
          <BarChart
            data={data.chartData}
            index="date"
            categories={data.categories ?? []}
            colors={data.colors || ["primary", "secondary"]}
            valueFormatter={(value) => `${storeCurrency} ${value.toFixed(2)}`}
            showLegend={true}
            showXAxis={true}
            showYAxis={true}
            showAnimation={true}
            height={300}
            config={chartConfig}
          >
            {chartChildren}
          </BarChart>
        );
      case "line":
        return (
          <LineChart
            data={data.chartData}
            index="date"
            categories={data.categories ?? []}
            colors={data.colors || ["primary", "accent", "secondary"]}
            valueFormatter={(value) => `${storeCurrency} ${value.toFixed(2)}`}
            showLegend={true}
            showXAxis={true}
            showYAxis={true}
            showAnimation={true}
            height={300}
            config={chartConfig}
          >
            {chartChildren}
          </LineChart>
        );
      case "pie":
        return (
          <PieChart
            data={data.chartData}
            category="value"
            index="name"
            colors={
              data.colors || [
                "primary",
                "secondary",
                "accent",
                "destructive",
                "muted",
              ]
            }
            valueFormatter={(value) => `${storeCurrency} ${value.toFixed(2)}`}
            showLabel={true}
            showAnimation={true}
            height={300}
            config={chartConfig}
          >
            {chartChildren}
          </PieChart>
        );
      case "area":
        return (
          <AreaChart
            data={data.chartData}
            index="date"
            categories={data.categories ?? []}
            colors={data.colors || ["primary", "secondary"]}
            valueFormatter={(value) => `${storeCurrency} ${value.toFixed(2)}`}
            showLegend={true}
            showXAxis={true}
            showYAxis={true}
            showAnimation={true}
            height={300}
            config={chartConfig}
          >
            {chartChildren}
          </AreaChart>
        );
      default:
        return null;
    }
  };

  return (
    <Card
      className="border-neon-purple/30 dark:border-neon-purple/20 shadow-md"
      dir={t("dir") as "rtl" | "ltr"}
    >
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <CardTitle className="rtl:text-start">
              {t("Advanced Reports")}
            </CardTitle>
            <CardDescription className="rtl:text-start">
              {t("Analyze your business performance with detailed reports")}
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Select
              value={chartType}
              onValueChange={(value) => setChartType(value as any)}
              dir={t("dir") as "rtl" | "ltr"}
            >
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Chart Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bar">{t("Bar Chart")}</SelectItem>
                <SelectItem value="line">{t("Line Chart")}</SelectItem>
                <SelectItem value="pie">{t("Pie Chart")}</SelectItem>
                <SelectItem value="area">{t("Area Chart")}</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    <span>{t("Date Range")}</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto p-2"
                  align="end"
                  dir={t("dir") as "rtl" | "ltr"}
                >
                  <div className="grid gap-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <div className="text-sm mb-2">{t("From")}</div>
                        <Calendar
                          dir={t("dir") as "rtl" | "ltr"}
                          mode="single"
                          selected={fromDate}
                          onSelect={(date) => date && setFromDate(date)}
                          initialFocus
                        />
                      </div>
                      <div>
                        <div className="text-sm mb-2">{t("To")}</div>
                        <Calendar
                          dir={t("dir") as "rtl" | "ltr"}
                          mode="single"
                          selected={toDate}
                          onSelect={(date) => date && setToDate(date)}
                          initialFocus
                        />
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <Button size="sm">{t("Apply Range")}</Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              {/* <Button variant="outline" className="gap-2">
                <FileDown className="h-4 w-4" />
                {t("Export")}
              </Button>

              <Button variant="outline" size="icon">
                <Sliders className="h-4 w-4" />
              </Button> */}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs
          value={reportType}
          onValueChange={(value) => setReportType(value as any)}
          className="mb-6"
          dir={t("dir") as "rtl" | "ltr"}
        >
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="sales" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              {t("Sales")}
            </TabsTrigger>
            <TabsTrigger value="inventory" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              {t("Inventory")}
            </TabsTrigger>
            <TabsTrigger value="customers" className="gap-2">
              <PieChartIcon className="h-4 w-4" />
              {t("Customers")}
            </TabsTrigger>
            <TabsTrigger value="profit" className="gap-2">
              <LineChartIcon className="h-4 w-4" />
              {t("Profit")}
            </TabsTrigger>
          </TabsList>

          <div className="flex justify-end mb-6">
            <Tabs
              value={dateRange}
              onValueChange={(value) => setDateRange(value as any)}
              dir={t("dir") as "rtl" | "ltr"}
            >
              <TabsList>
                <TabsTrigger value="day">{t("Today")}</TabsTrigger>
                <TabsTrigger value="week">{t("This Week")}</TabsTrigger>
                <TabsTrigger value="month">{t("This Month")}</TabsTrigger>
                <TabsTrigger value="quarter">{t("Quarter")}</TabsTrigger>
                <TabsTrigger value="year">{t("Year")}</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          {reportType != "inventory" && (
            <div className="mt-4">{renderChart()}</div>
          )}

          {data && data.summary && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              {data.summary.map((item: any, index: number) => (
                <Card
                  key={index}
                  className="bg-muted/40"
                  dir={t("dir") as "rtl" | "ltr"}
                >
                  <CardContent className="p-6">
                    <div className="text-sm text-muted-foreground">
                      {t(item.label)}
                    </div>
                    <div className="text-2xl font-bold mt-1">
                      {item.formatter ? item.formatter(item.value) : item.value}
                    </div>
                    {item.change !== undefined && (
                      <div
                        className={`text-xs mt-1 ${
                          item.change >= 0
                            ? "text-green-600"
                            : "text-destructive"
                        }`}
                      >
                        {item.change >= 0 ? "↑" : "↓"} {Math.abs(item.change)}%
                        {t("from last period")}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {data && data.tableData && (
            <div className="mt-8">
              <h3 className="text-lg font-medium mb-4">{t("Detailed Data")}</h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      {data.tableHeaders?.map((header: any, index: number) => (
                        <th
                          key={index}
                          className="text-left py-3 px-4 rtl:text-start"
                        >
                          {t(header)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.tableData.map((row: any, rowIndex: number) => (
                      <tr key={rowIndex} className="border-b">
                        {row.map((cell: any, cellIndex: number) => (
                          <td key={cellIndex} className="py-3 px-4">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
}

export default AdvancedReports;
