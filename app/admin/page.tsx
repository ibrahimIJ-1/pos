"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  CreditCard,
  TrendingUp,
  PieChart,
  BarChart2,
  Calendar,
  RefreshCw,
  ChevronDown,
  Filter,
  MoreHorizontal,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { getDashboardData } from "@/actions/dashboard/get-dashboard-data";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

const COLORS = ["#6366F1", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];



export default function Dashboard() {
  const t = useTranslations();
  const DATE_RANGES = [
    { value: "last7", label: t("Last 7 days") },
    { value: "last30", label: t("Last 30 days") },
    { value: "last90", label: t("Last 90 days") },
    { value: "last365", label: t("Last 365 days") },
    { value: "all", label: t("All time") },
  ];

  const [dateRange, setDateRange] = useState("last30");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["dashboard", dateRange],
    queryFn: () => getDashboardData(),
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  const selectedRangeLabel =
    DATE_RANGES.find((range) => range.value === dateRange)?.label ||
    t("Select range");

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center h-screen gap-4"
      >
        <div className="text-2xl font-bold text-destructive">
          {t("Error loading dashboard data")}
        </div>
        <Button onClick={handleRefresh} disabled={isRefreshing}>
          <RefreshCw
            className={cn("mr-2 h-4 w-4", isRefreshing && "animate-spin")}
          />
          {isRefreshing ? t("Refreshing")+"..." : t("Retry")}
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 space-y-6 bg-gray-50/50"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {t("Dashboard Overview")}
          </h1>
          <p className="text-gray-500 flex items-center gap-1">
            {format(new Date(), "MMMM d, yyyy")}
            <span className="h-1 w-1 bg-gray-400 rounded-full"></span>
            {t("Real-time data")}
          </p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
            >
              <Calendar className="h-4 w-4" />
              {selectedRangeLabel}
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform",
                  isDatePickerOpen && "rotate-180"
                )}
              />
            </Button>

            <AnimatePresence>
              {isDatePickerOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200"
                >
                  {DATE_RANGES.map((range) => (
                    <button
                      key={range.value}
                      className={cn(
                        "w-full text-left px-4 py-2 hover:bg-gray-100",
                        dateRange === range.value && "bg-gray-100 font-medium"
                      )}
                      onClick={() => {
                        setDateRange(range.value);
                        setIsDatePickerOpen(false);
                      }}
                    >
                      {range.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Button
            variant="outline"
            className="gap-2"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw
              className={cn("h-4 w-4", isRefreshing && "animate-spin")}
            />
            {t("Refresh")}
          </Button>
          <Button className="gap-2 bg-gradient-to-r from-indigo-600 to-indigo-400 hover:from-indigo-700 hover:to-indigo-500 shadow-indigo-200 hover:shadow-indigo-300 shadow-sm">
            {t("Export Report")}
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title={t("Total Revenue")}
          value={data?.totalRevenue}
          change={12.5}
          icon={<DollarSign className="h-5 w-5" />}
          isLoading={isLoading}
          isCurrency
          color="indigo"
        />
        <StatCard
          title={t("Total Sales")}
          value={data?.salesCount}
          change={8.2}
          icon={<ShoppingCart className="h-5 w-5" />}
          isLoading={isLoading}
          color="green"
        />
        <StatCard
          title={t("Active Customers")}
          value={data?.activeCustomers}
          change={5.7}
          icon={<Users className="h-5 w-5" />}
          isLoading={isLoading}
          color="blue"
        />
        <StatCard
          title={t("Low Stock Items")}
          value={data?.productsLowStock}
          change={-3.1}
          icon={<Package className="h-5 w-5" />}
          isLoading={isLoading}
          color="orange"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Trend */}
        <Card className="p-6 shadow-sm border-0 bg-white rounded-xl overflow-hidden">
          <CardHeader className="p-0 pb-6">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-indigo-500" />
                {t("Revenue Trend")}
              </CardTitle>
              <div className="text-sm text-gray-500">{selectedRangeLabel}</div>
            </div>
          </CardHeader>
          <CardContent className="p-0 h-[300px]">
            {isLoading ? (
              <Skeleton className="h-full w-full rounded-lg" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data?.monthlyRevenue || []}>
                  <defs>
                    <linearGradient
                      id="colorRevenue"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#6366F1" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f3f4f6"
                  />
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#6b7280", fontSize: 12 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#6b7280", fontSize: 12 }}
                    tickFormatter={(value) => `$${value / 1000}k`}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white p-3 rounded-lg shadow-lg border border-gray-200"
                          >
                            <p className="font-medium text-gray-900">
                              {payload[0].payload.month}
                            </p>
                            <p className="text-indigo-600 font-semibold">
                              ${payload[0]?.value?.toLocaleString()}
                            </p>
                          </motion.div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#6366F1"
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                    strokeWidth={2}
                    activeDot={{
                      r: 6,
                      stroke: "#6366F1",
                      strokeWidth: 2,
                      fill: "#fff",
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Sales by Category */}
        <Card className="p-6 shadow-sm border-0 bg-white rounded-xl overflow-hidden">
          <CardHeader className="p-0 pb-6">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <BarChart2 className="h-5 w-5 text-green-500" />
              {t("Sales by Category")}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 h-[300px]">
            {isLoading ? (
              <Skeleton className="h-full w-full rounded-lg" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.salesByCategory || []}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f3f4f6"
                  />
                  <XAxis
                    dataKey="id"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#6b7280", fontSize: 12 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#6b7280", fontSize: 12 }}
                    tickFormatter={(value) => `$${value / 1000}k`}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white p-3 rounded-lg shadow-lg border border-gray-200"
                          >
                            <p className="font-medium text-gray-900">
                              {payload[0].payload.id}
                            </p>
                            <p className="text-green-600 font-semibold">
                              ${payload[0]?.value?.toLocaleString()}
                            </p>
                          </motion.div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar
                    dataKey="value"
                    fill="#10B981"
                    radius={[4, 4, 0, 0]}
                    animationDuration={2000}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <Card className="p-6 shadow-sm border-0 bg-white rounded-xl overflow-hidden">
          <CardHeader className="p-0 pb-6">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <PieChart className="h-5 w-5 text-purple-500" />
              {t("Payment Methods")}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 h-[300px]">
            {isLoading ? (
              <Skeleton className="h-full w-full rounded-lg" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={data?.paymentMethods || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    labelLine={false}
                  >
                    {data?.paymentMethods?.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white p-3 rounded-lg shadow-lg border border-gray-200 flex flex-col gap-1"
                          >
                            <p className="font-medium text-gray-900">
                              {payload[0].name}
                            </p>
                            <p className="text-purple-600 font-semibold">
                              ${payload[0]?.value?.toLocaleString()}
                            </p>
                            <p className="text-gray-500 text-sm">
                              {(payload[0].payload.percent * 100).toFixed(1)}%
                              {t("of total")}
                            </p>
                          </motion.div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend
                    layout="horizontal"
                    verticalAlign="bottom"
                    align="center"
                    wrapperStyle={{ paddingTop: "20px" }}
                    formatter={(value) => (
                      <span className="text-gray-600 text-sm">{value}</span>
                    )}
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card className="p-6 shadow-sm border-0 bg-white rounded-xl overflow-hidden">
        <CardHeader className="p-0 pb-6">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-orange-500" />
              {t("Recent Transactions")}
            </CardTitle>
            <Button variant="ghost" size="sm" className="text-gray-500">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-lg" />
              ))}
            </div>
          ) : (
            <motion.div layout className="space-y-3">
              <AnimatePresence>
                {data?.recentTransactions?.map((tx) => (
                  <motion.div
                    key={tx.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`p-3 rounded-lg ${
                          tx.type === "SALE"
                            ? "bg-indigo-100 text-indigo-600"
                            : tx.type === "REFUND"
                            ? "bg-red-100 text-red-600"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        <CreditCard className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">
                          {tx.type === "SALE"
                            ? t("Sale")
                            : tx.type === "REFUND"
                            ? t("Refund")
                            : tx.type}
                        </p>
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                          {format(new Date(tx.createdAt), "MMM d, h:mm a")}
                          <span className="h-1 w-1 bg-gray-400 rounded-full"></span>
                          {tx.paymentMethod}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div
                        className={`font-semibold ${
                          tx.type === "REFUND" ||
                          tx.type === "EXPENSE" ||
                          tx.type === "CASH_OUT"
                            ? "text-red-600"
                            : "text-green-600"
                        }`}
                      >
                        {tx.type === "REFUND" ||
                        tx.type === "EXPENSE" ||
                        tx.type === "CASH_OUT"
                          ? "-"
                          : "+"}
                        ${tx.amount.toFixed(2)}
                      </div>
                      {tx.type === "SALE" ? (
                        <ArrowUpRight className="h-4 w-4 text-green-500" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

function StatCard({
  title,
  value,
  change,
  icon,
  isLoading,
  isCurrency = false,
  color = "indigo",
}: {
  title: string;
  value?: number;
  change?: number;
  icon: React.ReactNode;
  isLoading: boolean;
  isCurrency?: boolean;
  color?: "indigo" | "green" | "blue" | "orange" | "red";
}) {
  const t = useTranslations();
  const colorClasses = {
    indigo: {
      bg: "bg-indigo-100",
      text: "text-indigo-600",
      changeText: "text-indigo-600",
    },
    green: {
      bg: "bg-green-100",
      text: "text-green-600",
      changeText: "text-green-600",
    },
    blue: {
      bg: "bg-blue-100",
      text: "text-blue-600",
      changeText: "text-blue-600",
    },
    orange: {
      bg: "bg-orange-100",
      text: "text-orange-600",
      changeText: "text-orange-600",
    },
    red: {
      bg: "bg-red-100",
      text: "text-red-600",
      changeText: "text-red-600",
    },
  };

  return (
    <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.1 }}>
      <Card className="p-6 shadow-sm border-0 bg-white rounded-xl overflow-hidden">
        <CardHeader className="p-0 pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-gray-500">
              {title}
            </CardTitle>
            <div
              className={`p-2 rounded-lg ${colorClasses[color].bg} ${colorClasses[color].text}`}
            >
              {icon}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <>
              <Skeleton className="h-8 w-3/4 mb-1" />
              <Skeleton className="h-4 w-1/2" />
            </>
          ) : (
            <>
              <div className="text-2xl font-bold text-gray-900">
                {isCurrency ? "$" : ""}
                {value?.toLocaleString() || "0"}
                {isCurrency ? "" : "+"}
              </div>
              <div className="flex items-center gap-1 mt-1">
                {change && change >= 0 ? (
                  <ArrowUpRight
                    className={`h-4 w-4 ${colorClasses[color].changeText}`}
                  />
                ) : (
                  <ArrowDownRight className="h-4 w-4 text-red-600" />
                )}
                <p
                  className={`text-sm ${
                    change && change >= 0
                      ? colorClasses[color].changeText
                      : "text-red-600"
                  }`}
                >
                  {change && change >= 0 ? "+" : ""}
                  {change}% {t("from last month")}
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
