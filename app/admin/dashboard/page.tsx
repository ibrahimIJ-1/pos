"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ResponsiveBar } from "@nivo/bar";
import { ResponsivePie } from "@nivo/pie";
import { ResponsiveLine } from "@nivo/line";
import { UserRole } from "@/lib/permissions";
import { usePermissions } from "@/hooks/usePermissions";
import { Users, DollarSign, ActivitySquare, ShoppingCart } from "lucide-react";
import { useQuery } from '@tanstack/react-query'
// ... other imports

export default function Dashboard() {
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => fetch('/api/dashboard/metrics').then(res => res.json())
  })

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error loading data</div>

  const revenueData = [{
    id: "revenue",
    data: data.revenueData.map((d: any) => ({ x: d.month, y: d.revenue }))
  }]

  const trafficData = data.paymentMethods

  const salesData = data.monthlySales.map((d: any) => ({
    name: d.month,
    sales: d.sales
  }))

  return (
    <div className="space-y-6">
      {/* Update cards */}
      <Card className="neon-card neon-border">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ${data.totalRevenue.toFixed(2)}
          </div>
        </CardContent>
      </Card>

      {/* Update other cards similarly */}
      <Card className="neon-card neon-border">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Active Now</CardTitle>
          <ActivitySquare className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.activeUsers}</div>
        </CardContent>
      </Card>

      {/* Charts remain the same, just use the transformed data */}
      <ResponsiveLine data={revenueData}  />
    </div>
  )
}