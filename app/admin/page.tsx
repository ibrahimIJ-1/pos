"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ResponsiveBar } from "@nivo/bar";
import { ResponsivePie } from "@nivo/pie";
import { ResponsiveLine } from "@nivo/line";
import { UserRole } from "@/lib/permissions";
import { usePermissions } from "@/hooks/usePermissions";
import { Users, DollarSign, ActivitySquare, ShoppingCart } from "lucide-react";

const salesData = [
  { name: "Jan", sales: 400 },
  { name: "Feb", sales: 300 },
  { name: "Mar", sales: 500 },
  { name: "Apr", sales: 700 },
  { name: "May", sales: 600 },
  { name: "Jun", sales: 800 },
];

const trafficData = [
  { id: "Direct", value: 40 },
  { id: "Social", value: 30 },
  { id: "Referral", value: 20 },
  { id: "Organic", value: 10 },
];

const revenueData = [
  {
    id: "revenue",
    data: [
      { x: "Jan", y: 10000 },
      { x: "Feb", y: 12000 },
      { x: "Mar", y: 9000 },
      { x: "Apr", y: 15000 },
      { x: "May", y: 14000 },
      { x: "Jun", y: 18000 },
    ],
  },
];

export default function Dashboard() {
  const userRoles = [UserRole.ADMIN, UserRole.MANAGER];
  const { isAdmin } = usePermissions(userRoles);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        {isAdmin && (
          <Button className="neon-glow animate-glow">Export Report</Button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="neon-card neon-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$45,231.89</div>
            <p className="text-xs text-muted-foreground">
              +20.1% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="neon-card neon-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Subscriptions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+2350</div>
            <p className="text-xs text-muted-foreground">
              +180.1% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="neon-card neon-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Sales</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+12,234</div>
            <p className="text-xs text-muted-foreground">
              +19% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="neon-card neon-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Now</CardTitle>
            <ActivitySquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+573</div>
            <p className="text-xs text-muted-foreground">
              +201 since last hour
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="neon-card neon-border md:col-span-4">
          <CardHeader>
            <CardTitle>Revenue over time</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveLine
              data={revenueData}
              margin={{ top: 20, right: 30, bottom: 50, left: 60 }}
              xScale={{ type: "point" }}
              yScale={{
                type: "linear",
                min: "auto",
                max: "auto",
              }}
              curve="cardinal"
              axisBottom={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
              }}
              axisLeft={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                format: (value) => `$${value}`,
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
          </CardContent>
        </Card>
        
        <Card className="neon-card neon-border md:col-span-3">
          <CardHeader>
            <CardTitle>Traffic Source</CardTitle>
            <CardDescription>
              Where your visitors are coming from
            </CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsivePie
              data={trafficData}
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
          </CardContent>
        </Card>
      </div>

      <Card className="neon-card neon-border">
        <CardHeader>
          <CardTitle>Monthly Sales</CardTitle>
          <CardDescription>
            Your sales performance over the last 6 months
          </CardDescription>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveBar
            data={salesData.map((item) => ({
              month: item.name,
              Sales: item.sales,
            }))}
            keys={["Sales"]}
            indexBy="month"
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
              tickRotation: 0,
            }}
            axisLeft={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
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
        </CardContent>
      </Card>
    </div>
  );
}
