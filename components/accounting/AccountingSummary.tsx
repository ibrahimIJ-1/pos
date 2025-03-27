import React from "react";
import { useAccountingSummary } from "@/lib/pos-service";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  DollarSignIcon,
  ShoppingCartIcon,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function AccountingSummary() {
  const [period, setPeriod] = React.useState<"day" | "week" | "month">("day");
  const { data, isLoading } = useAccountingSummary(period);

  const renderSummaryCard = (
    title: string,
    value: number,
    description: string,
    icon: React.ReactNode,
    colorClass: string
  ) => {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <div className={`p-2 rounded-full ${colorClass}`}>{icon}</div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ${value.toFixed(2)}
          </div>
          <p className="text-xs text-muted-foreground">{description}</p>
        </CardContent>
      </Card>
    );
  };

  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>Financial Summary</CardTitle>
        <CardDescription>
          Overview of your business financial performance
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <Tabs
          value={period}
          onValueChange={(value) =>
            setPeriod(value as "day" | "week" | "month")
          }
        >
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="day">Today</TabsTrigger>
            <TabsTrigger value="week">This Week</TabsTrigger>
            <TabsTrigger value="month">This Month</TabsTrigger>
          </TabsList>

          {["day", "week", "month"].map((p) => (
            <TabsContent key={p} value={p}>
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <Card key={i}>
                      <CardHeader className="pb-2">
                        <Skeleton className="h-4 w-1/2" />
                      </CardHeader>
                      <CardContent>
                        <Skeleton className="h-6 w-1/3 mb-2" />
                        <Skeleton className="h-3 w-3/4" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : data ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {renderSummaryCard(
                    "Total Sales",
                    data.sales,
                    `${data.transactionCount} transactions`,
                    <ShoppingCartIcon className="h-4 w-4 text-white" />,
                    "bg-green-500"
                  )}
                  {renderSummaryCard(
                    "Net Income",
                    data.netIncome,
                    "After refunds and expenses",
                    <DollarSignIcon className="h-4 w-4 text-white" />,
                    "bg-blue-500"
                  )}
                  {renderSummaryCard(
                    "Expenses",
                    data.expenses,
                    "Total business expenses",
                    <ArrowDownIcon className="h-4 w-4 text-white" />,
                    "bg-red-500"
                  )}
                  {renderSummaryCard(
                    "Cash Flow",
                    data.cashFlow,
                    "Net cash movement",
                    <ArrowUpIcon className="h-4 w-4 text-white" />,
                    "bg-purple-500"
                  )}

                  {/* Payment Methods Breakdown */}
                  <Card className="col-span-full mt-4">
                    <CardHeader>
                      <CardTitle className="text-md">Payment Methods</CardTitle>
                      <CardDescription>
                        Breakdown by payment type
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {Object.entries(data.byPaymentMethod || {}).map(
                          ([method, amount]) => (
                            <div key={method} className="flex flex-col">
                              <span className="text-sm font-medium text-muted-foreground">
                                {method.replace("_", " ").toUpperCase()}
                              </span>
                              <span className="text-lg font-semibold">
                                $
                                {typeof amount === "number"
                                  ? amount.toFixed(2)
                                  : "0.00"}
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <p>No data available.</p>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}

export default AccountingSummary;
