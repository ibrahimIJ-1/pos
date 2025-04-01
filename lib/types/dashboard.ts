// types/dashboard.ts
export type DashboardData = {
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