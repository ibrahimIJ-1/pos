"use client";

import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdvancedReports } from "@/components/reports/AdvancedReports";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BarChart3,
  LineChart,
  PieChart,
  Users,
  Package,
  CreditCard,
  TrendingUp,
  TrendingDown,
  FileSpreadsheet,
} from "lucide-react";
import SalesReports from "@/components/reports/SalesReports";
import InventoryReports from "@/components/reports/InventoryReports";
import CustomerReports from "@/components/reports/CustomerReports";
import ProfitReports from "@/components/reports/ProfitReports";
import { formatCurrency } from "@/lib/utils";
import { usePageReports } from "@/lib/reports-service";

export default function Reports() {
  const [activeTab, setActiveTab] = useState("sales");
  const { data: branchData } = usePageReports();
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Reports & Analytics
        </h1>
        <p className="text-muted-foreground">
          Deep insights and business intelligence to drive better decision
          making.
        </p>
      </div>

      {/* Reports Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <h3 className="text-muted-foreground">Total Revenue</h3>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </div>
            <p className="text-2xl font-bold">
              {formatCurrency(Number(branchData?.totalRevenue))}
            </p>
            <p className="text-xs text-green-500">
              +{branchData?.revenueChangePercent}% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <h3 className="text-muted-foreground">Average Order</h3>
              <CreditCard className="h-4 w-4 text-blue-500" />
            </div>
            <p className="text-2xl font-bold">
              {formatCurrency(Number(branchData?.averageOrder))}
            </p>
            <p className="text-xs text-green-500">
              +{branchData?.averageOrderChange}% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <h3 className="text-muted-foreground">Low Stock</h3>
              <Package className="h-4 w-4 text-amber-500" />
            </div>
            <p className="text-2xl font-bold">
              {branchData?.lowStockCount} items
            </p>
            <p className="text-xs text-amber-500">
              {branchData?.criticalStockCount} critical items
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <h3 className="text-muted-foreground">Customer Growth</h3>
              <Users className="h-4 w-4 text-indigo-500" />
            </div>
            <p className="text-2xl font-bold">+{branchData?.newCustomers}</p>
            <p className="text-xs text-green-500">New customers this month</p>
          </CardContent>
        </Card>
      </div>

      <Tabs
        defaultValue="sales"
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid grid-cols-5 w-full max-w-4xl">
          <TabsTrigger value="sales" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span>Sales</span>
          </TabsTrigger>
          <TabsTrigger value="inventory" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            <span>Inventory</span>
          </TabsTrigger>
          <TabsTrigger value="customers" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>Customers</span>
          </TabsTrigger>
          <TabsTrigger value="profit" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            <span>Profit</span>
          </TabsTrigger>
          <TabsTrigger value="advanced" className="flex items-center gap-2">
            <LineChart className="h-4 w-4" />
            <span>Advanced</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sales" className="space-y-6">
          <SalesReports />
        </TabsContent>

        <TabsContent value="inventory" className="space-y-6">
          <InventoryReports />
        </TabsContent>

        <TabsContent value="customers" className="space-y-6">
          <CustomerReports />
        </TabsContent>

        <TabsContent value="profit" className="space-y-6">
          <ProfitReports />
        </TabsContent>

        <TabsContent value="advanced" className="space-y-6">
          <AdvancedReports />
        </TabsContent>
      </Tabs>
    </div>
  );
}
