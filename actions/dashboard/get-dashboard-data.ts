// app/actions/dashboard/get-dashboard-data.ts
"use server";

import {prisma} from "@/lib/prisma";
import {DashboardData} from "@/lib/types/dashboard";
import {checkUser} from "../Authorization";
import {TransactionType} from "@prisma/client";

type DateRange = "last7" | "last30" | "last90" | "last365" | "all";

export async function getDashboardData(
    dateRange: DateRange = "last30"
): Promise<DashboardData> {
    // Get authenticated user with branch ID
    const user = await checkUser();

    const mainBranchId = await prisma.user.findUnique({
        where: {
            id: user.id,
        },
        select: {
            branchId: true,
        },
    });
    if (!mainBranchId || !mainBranchId?.branchId)
        throw new Error("No branch Found");
    const userBranchId = mainBranchId?.branchId;

    // Date calculations
    const now = new Date();
    let startDate: Date;

    switch (dateRange) {
        case "last7":
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
        case "last30":
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
        case "last90":
            startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
            break;
        case "last365":
            startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
            break;
        case "all":
        default:
            startDate = new Date(0);
            break;
    }

    // Fetch all data in parallel with branch filtering
    const [
        totalRevenueResult,
        salesCount,
        activeCustomers,
        productsLowStock,
        monthlyRevenueRaw,
        salesByCategoryRaw,
        paymentMethodsRaw,
        recentTransactions,
    ] = await Promise.all([
        // Total Revenue
        prisma.registerTransaction.groupBy({
            by: ['type'],
            _sum: {amount: true},
            where: {
                branchId: userBranchId,
                created_at: {gte: startDate},
                type: {
                    in: [TransactionType.SALE, TransactionType.REFUND]
                }
            },
        }),

        // Sales Count
        prisma.$queryRaw<{ count: number }[]>`
            SELECT
                COUNT(DISTINCT s.id) AS count
            FROM sales s
                JOIN sale_items si ON si.sale_id = s.id
            WHERE s.branch_id    = ${userBranchId}
              AND s.created_at  >= ${startDate}
              AND (si.quantity - si.refundedQuantity) > 0
        `,

        // Active Customers
        prisma.customer.count({
            where: {
                sales: {
                    some: {
                        branchId: userBranchId,
                        created_at: {gte: startDate},
                    },
                },
            },
        }),

        // Low Stock Items
        prisma.branchProduct.count({
            where: {
                branchId: userBranchId,
                stock: {lt: prisma.branchProduct.fields.low_stock_threshold},
            },
        }),

        // Monthly Revenue
        prisma.$queryRaw<{ month: string; revenue: number }[]>`
            SELECT DATE_FORMAT(created_at, '%Y-%m') as month,
             COALESCE(SUM(CASE WHEN type = ${TransactionType.SALE}   THEN amount ELSE 0 END),0)
            - COALESCE(SUM(CASE WHEN type = ${TransactionType.REFUND} THEN amount ELSE 0 END),0)
                AS revenue
            FROM register_transactions
            WHERE branch_id = ${userBranchId}
              AND created_at >= ${startDate}
              AND type in (${TransactionType.SALE},${TransactionType.REFUND})
            GROUP BY DATE_FORMAT(created_at, '%Y-%m')
            ORDER BY month ASC
        `,

        // Sales by Category
        prisma.$queryRaw<{ id: string; value: number }[]>`
            SELECT p.category as id,
                   SUM((si.quantity - si.refundedQuantity) * si.unit_price) as value
            FROM sale_items si
                JOIN products p
            ON si.product_id = p.id
                JOIN sales s ON si.sale_id = s.id
            WHERE s.branch_id = ${userBranchId}
              AND s.created_at >= ${startDate}
              AND si.quantity - si.refundedQuantity >0
            GROUP BY p.category
        `,

        // Payment Methods
        prisma.$queryRaw<{ id: string; value: number }[]>`
            SELECT payment_method as id,
                   SUM(total_amount) as value
            FROM sales
            WHERE branch_id = ${userBranchId}
              AND created_at >= ${startDate}
            GROUP BY payment_method
        `,

        // Recent Transactions
        prisma.registerTransaction.findMany({
            where: {branchId: userBranchId},
            take: 5,
            orderBy: {created_at: "desc"},
            select: {
                id: true,
                amount: true,
                type: true,
                paymentMethod: true,
                created_at: true,
            },
        }),
    ]);

    // Transform data
    const monthlyRevenue = monthlyRevenueRaw.map((i) => ({
        month: i.month,
        revenue: Number(i.revenue),
    }));

    const salesByCategory = salesByCategoryRaw.map((i) => ({
        id: i.id,
        value: Number(i.value),
    }));

    const paymentMethods = paymentMethodsRaw.map((i) => ({
        id: i.id,
        value: Number(i.value),
    }));

    const saleSum = totalRevenueResult.find(r => r.type === TransactionType.SALE)?._sum.amount || 0;
    const refundSum = totalRevenueResult.find(r => r.type === TransactionType.REFUND)?._sum.amount || 0;
    const netTotal = Number(saleSum) - Number(refundSum);
    const [{ count }] =salesCount
    return {
        totalRevenue: netTotal || 0,
        salesCount:count,
        activeCustomers,
        productsLowStock,
        monthlyRevenue,
        salesByCategory,
        paymentMethods,
        recentTransactions: recentTransactions.map((tx) => ({
            ...tx,
            amount: Number(tx.amount),
            createdAt: tx.created_at,
        })),
    };
}
