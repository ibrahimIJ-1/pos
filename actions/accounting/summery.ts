"use server";

import { prisma } from "@/lib/prisma";

export const accountingSummary = async (period = "day") => {
  try {
    // Set date range based on period
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let startDate: Date;

    switch (period) {
      case "week":
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 7);
        break;
      case "month":
        startDate = new Date(today);
        startDate.setMonth(today.getMonth() - 1);
        break;
      case "day":
      default:
        startDate = today;
        break;
    }

    // Get all transactions within the date range
    const transactions = await prisma.registerTransaction.findMany({
      where: {
        created_at: {
          gte: startDate,
        },
      },
    });

    // Calculate totals
    let sales = 0;
    let expenses = 0;
    let transactionCount = 0;
    const byPaymentMethod: Record<string, number> = {};

    transactions.forEach((transaction) => {
      const amount = Number(transaction.amount);

      // Track payment methods
      if (!byPaymentMethod[transaction.paymentMethod]) {
        byPaymentMethod[transaction.paymentMethod] = 0;
      }

      switch (transaction.type) {
        case "SALE":
          sales += amount;
          byPaymentMethod[transaction.paymentMethod] += amount;
          transactionCount++;
          break;
        case "REFUND":
          sales -= amount;
          byPaymentMethod[transaction.paymentMethod] -= amount;
          transactionCount++;
          break;
        case "EXPENSE":
          expenses += amount;
          break;
        case "CASH_IN":
          byPaymentMethod[transaction.paymentMethod] += amount;
          break;
        case "CASH_OUT":
          byPaymentMethod[transaction.paymentMethod] -= amount;
          break;
      }
    });

    // Calculate net income and cash flow
    const netIncome = sales - expenses;
    const cashFlow = Object.values(byPaymentMethod).reduce(
      (total, amount) => total + amount,
      0
    );

    return {
      sales,
      expenses,
      netIncome,
      cashFlow,
      transactionCount,
      byPaymentMethod,
    };
  } catch (error) {
    console.error("Error fetching accounting summary:", error);
    throw new Error("Failed to fetch accounting summary");
  }
};
