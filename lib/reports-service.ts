import { getAdvancedReport } from "@/actions/dashboard/advance-reports";
import { getCustomerReport } from "@/actions/dashboard/customer-report";
import { getInventoryReport } from "@/actions/dashboard/inventory-report";
import { getProfitReport } from "@/actions/dashboard/profit-reports";
import { getPageReports } from "@/actions/dashboard/reports";
import { getSalesReport } from "@/actions/dashboard/sales-report";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

export const usePageReports = () => {
  return useQuery({
    queryKey: ["pageReports"],
    queryFn: getPageReports,
  });
};

export const useSalesReports = (fromDate: Date, toDate: Date) => {
  return useQuery({
    queryKey: [
      "reports",
      "sales",
      fromDate.toISOString(),
      toDate.toISOString(),
    ],
    queryFn: async () => {
      return getSalesReport(fromDate, toDate);
    },
    enabled: !!fromDate && !!toDate,
  });
};

export const useInventoryReports = (lowStockOnly: boolean) => {
  return useQuery({
    queryKey: ["reports", "inventory", lowStockOnly],
    queryFn: async () => {
      return getInventoryReport({ lowStockOnly });
    },
    enabled: true,
  });
};

export const useCustomerReports = (fromDate: Date, toDate: Date) => {
  return useQuery({
    queryKey: [
      "reports",
      "customers",
      fromDate.toISOString(),
      toDate.toISOString(),
    ],
    queryFn: async () => {
      return getCustomerReport({
        from: fromDate.toISOString(),
        to: toDate.toISOString(),
      });
    },
    enabled: !!fromDate && !!toDate,
  });
};

export const useProfitReports = (fromDate: Date, toDate: Date) => {
  return useQuery({
    queryKey: [
      "reports",
      "profit",
      fromDate.toISOString(),
      toDate.toISOString(),
    ],
    queryFn: async () => {
      return getProfitReport({
        from: fromDate.toISOString(),
        to: toDate.toISOString(),
      });
    },
    enabled: !!fromDate && !!toDate,
  });
};

const useAdvancedReports = (
  reportType: "sales" | "inventory" | "customers" | "profit",
  dateRange: "day" | "week" | "month" | "quarter" | "year" | "custom",
  fromDate?: Date,
  toDate?: Date
) => {
  return useQuery({
    queryKey: [
      "reports",
      "advanced",
      reportType,
      dateRange,
      fromDate?.toISOString(),
      toDate?.toISOString(),
    ],
    queryFn: async () => {
      return getAdvancedReport(reportType,dateRange,fromDate,toDate);
    },
    enabled: !!fromDate && !!toDate && !!reportType && !!dateRange,
  });
};

export default useAdvancedReports;
