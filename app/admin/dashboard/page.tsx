"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ResponsiveBar } from "@nivo/bar";
import { ResponsivePie } from "@nivo/pie";
import { ResponsiveLine } from "@nivo/line";
import { UserRole } from "@/lib/permissions";
import { usePermissions } from "@/hooks/usePermissions";
import {
  Users,
  DollarSign,
  ActivitySquare,
  ShoppingCart,
  Package,
  CreditCard,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { getDashboardData } from "@/actions/dashboard/get-dashboard-data";
import { useSystem } from "@/providers/SystemProvider";

// Type definitions for our data
type DashboardData = {
  totalRevenue: number;
  salesCount: number;
  activeCustomers: number;
  productsLowStock: number;
  monthlyRevenue: { month: string; revenue: number }[];
  salesByCategory: { id: string; value: number }[];
  paymentMethods: { id: string; value: number }[];
  recentTransactions: {
    id: string;
    amount: number;
    type: string;
    paymentMethod: string;
    createdAt: Date;
  }[];
};

export default function Dashboard() {
  const {storeCurrency} = useSystem();
  const userRoles = [UserRole.ADMIN, UserRole.MANAGER, UserRole.CASHIER];
  const { isAdmin } = usePermissions(userRoles);

  const { data, isLoading, error } = useQuery<DashboardData>({
    queryKey: ["dashboard"],
    queryFn: ()=>getDashboardData(),
  });

  if (error) {
    return <div className="p-6">Error loading dashboard data</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        {isAdmin && (
          <Button className="neon-glow animate-glow">Export Report</Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="neon-card neon-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-full" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {storeCurrency}
                  {data?.totalRevenue.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </div>
                <p className="text-xs text-muted-foreground">
                  All time revenue
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="neon-card neon-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-full" />
            ) : (
              <>
                <div className="text-2xl font-bold">+{data?.salesCount}</div>
                <p className="text-xs text-muted-foreground">
                  Completed transactions
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="neon-card neon-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Active Customers
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-full" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {data?.activeCustomers}
                </div>
                <p className="text-xs text-muted-foreground">
                  Customers with purchases
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="neon-card neon-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Low Stock Items
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-full" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {data?.productsLowStock}
                </div>
                <p className="text-xs text-muted-foreground">
                  Products needing restock
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="neon-card neon-border md:col-span-4">
          <CardHeader>
            <CardTitle>Monthly Revenue</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            {isLoading ? (
              <Skeleton className="h-full w-full" />
            ) : (
              <ResponsiveLine
                data={[
                  {
                    id: "revenue",
                    data:
                      data?.monthlyRevenue.map((item) => ({
                        x: item.month,
                        y: item.revenue,
                      })) || [],
                  },
                ]}
                margin={{ top: 20, right: 30, bottom: 50, left: 60 }}
                xScale={{ type: "point" }}
                yScale={{
                  type: "linear",
                  min: "auto",
                  max: "auto",
                }}
                curve="monotoneX"
                axisBottom={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: 0,
                }}
                axisLeft={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: 0,
                  format: (value) => `${storeCurrency} ${value.toLocaleString()}`,
                }}
                colors={["hsl(var(--primary))"]}
                pointSize={10}
                pointColor={{ theme: "background" }}
                pointBorderWidth={2}
                pointBorderColor={{ from: "serieColor" }}
                enableGridX={false}
                theme={{
                  axis: {
                    ticks: {
                      text: {
                        fill: "hsl(var(--muted-foreground))",
                      },
                    },
                  },
                  tooltip: {
                    container: {
                      backgroundColor: "hsl(var(--card))",
                      color: "hsl(var(--card-foreground))",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                      borderRadius: "0.5rem",
                      padding: "8px 12px",
                    },
                  },
                }}
              />
            )}
          </CardContent>
        </Card>

        <Card className="neon-card neon-border md:col-span-3">
          <CardHeader>
            <CardTitle>Payment Methods</CardTitle>
            <CardDescription>Distribution of payment types</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            {isLoading ? (
              <Skeleton className="h-full w-full" />
            ) : (
              <ResponsivePie
                data={data?.paymentMethods || []}
                margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                innerRadius={0.6}
                padAngle={0.7}
                cornerRadius={3}
                activeOuterRadiusOffset={8}
                colors={["#9b87f5", "#d946ef", "#0ea5e9", "#10b981"]}
                borderWidth={1}
                borderColor={{
                  from: "color",
                  modifiers: [["darker", 0.2]],
                }}
                enableArcLinkLabels={false}
                arcLabelsSkipAngle={10}
                theme={{
                  tooltip: {
                    container: {
                      backgroundColor: "hsl(var(--card))",
                      color: "hsl(var(--card-foreground))",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                      borderRadius: "0.5rem",
                      padding: "8px 12px",
                    },
                  },
                  labels: {
                    text: {
                      fill: "hsl(var(--card-foreground))",
                    },
                  },
                }}
                legends={[
                  {
                    anchor: "bottom",
                    direction: "row",
                    justify: false,
                    translateX: 0,
                    translateY: 20,
                    itemsSpacing: 0,
                    itemWidth: 80,
                    itemHeight: 20,
                    itemTextColor: "hsl(var(--muted-foreground))",
                    itemDirection: "left-to-right",
                    itemOpacity: 1,
                    symbolSize: 12,
                    symbolShape: "circle",
                  },
                ]}
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="neon-card neon-border md:col-span-4">
          <CardHeader>
            <CardTitle>Sales by Category</CardTitle>
            <CardDescription>
              Revenue distribution across product categories
            </CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            {isLoading ? (
              <Skeleton className="h-full w-full" />
            ) : (
              <ResponsiveBar
                data={
                  data?.salesByCategory.map((item) => ({
                    category: item.id,
                    Revenue: item.value,
                  })) || []
                }
                keys={["Revenue"]}
                indexBy="category"
                margin={{ top: 20, right: 20, bottom: 50, left: 60 }}
                padding={0.3}
                valueScale={{ type: "linear" }}
                colors={["hsl(var(--primary))"]}
                borderColor={{
                  from: "color",
                  modifiers: [["darker", 1.6]],
                }}
                axisTop={null}
                axisRight={null}
                axisBottom={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: 45,
                }}
                axisLeft={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: 0,
                  format: (value) => `${storeCurrency} ${value.toLocaleString()}`,
                }}
                labelSkipWidth={12}
                labelSkipHeight={12}
                animate={true}
                theme={{
                  axis: {
                    ticks: {
                      text: {
                        fill: "hsl(var(--muted-foreground))",
                      },
                    },
                  },
                  tooltip: {
                    container: {
                      backgroundColor: "hsl(var(--card))",
                      color: "hsl(var(--card-foreground))",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                      borderRadius: "0.5rem",
                      padding: "8px 12px",
                    },
                  },
                }}
              />
            )}
          </CardContent>
        </Card>

        <Card className="neon-card neon-border md:col-span-3">
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Latest 5 transactions</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {data?.recentTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-2">
                      <CreditCard className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">
                          {tx.type === "SALE"
                            ? "Sale"
                            : tx.type === "REFUND"
                            ? "Refund"
                            : tx.type}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(tx.createdAt), "MMM d, h:mm a")}
                        </p>
                      </div>
                    </div>
                    <div
                      className={`text-sm font-medium ${
                        tx.type === "REFUND" ||
                        tx.type === "EXPENSE" ||
                        tx.type === "CASH_OUT"
                          ? "text-red-500"
                          : "text-green-500"
                      }`}
                    >
                      {tx.type === "REFUND" ||
                      tx.type === "EXPENSE" ||
                      tx.type === "CASH_OUT"
                        ? "-"
                        : "+"}
                      {storeCurrency} {tx.amount.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
