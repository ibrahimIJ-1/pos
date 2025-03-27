
import { useQuery } from "@tanstack/react-query";
import { reportsApi } from "@/lib/api";

export function useAdvancedReports(
  reportType: "sales" | "inventory" | "customers" | "profit",
  dateRange: "day" | "week" | "month" | "quarter" | "year",
  fromDate: Date,
  toDate: Date
) {
  return useQuery({
    queryKey: ["reports", reportType, dateRange, fromDate.toISOString(), toDate.toISOString()],
    queryFn: async () => {
      // Format the dates for the API
      const from = fromDate.toISOString().split('T')[0];
      const to = toDate.toISOString().split('T')[0];
      
      // Determine which API endpoint to use based on report type
      switch (reportType) {
        case "sales":
          return await reportsApi.getSalesReport({ 
            dateRange, 
            from, 
            to 
          });
        case "inventory":
          return await reportsApi.getInventoryReport({ 
            dateRange, 
            from, 
            to 
          });
        case "customers":
          return await reportsApi.getCustomerReport({ 
            dateRange, 
            from, 
            to 
          });
        case "profit":
          return await reportsApi.getProfitReport({ 
            dateRange, 
            from, 
            to 
          });
        default:
          throw new Error(`Unknown report type: ${reportType}`);
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export default useAdvancedReports;
