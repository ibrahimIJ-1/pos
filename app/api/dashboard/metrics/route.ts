// app/api/dashboard/metrics/route.ts
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
    try {
      const [
        totalRevenue,
        totalSales,
        activeUsers,
        salesTrend,
        paymentMethods,
        monthlySales
      ] = await Promise.all([
        prisma.sale.aggregate({ _sum: { totalAmount: true } }),
        prisma.sale.count(),
        prisma.user.count({ where: { active: true } }),
        prisma.$queryRaw`
          SELECT 
            DATE_FORMAT(MIN(created_at), '%b') as month,
            SUM(total_amount) as revenue
          FROM Sale
          WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
          GROUP BY YEAR(created_at), MONTH(created_at)
          ORDER BY MIN(created_at) ASC
        `,
        prisma.sale.groupBy({
          by: ['paymentMethod'],
          _count: { _all: true },
          where: { created_at: { gte: new Date(new Date().setMonth(new Date().getMonth() - 1)) }}
        }),
        prisma.$queryRaw`
          SELECT 
            DATE_FORMAT(MIN(created_at), '%b') as month,
            COUNT(*) as sales
          FROM Sale
          GROUP BY YEAR(created_at), MONTH(created_at)
          ORDER BY MIN(created_at) ASC
        `
      ])
  
      return NextResponse.json({
        totalRevenue: totalRevenue._sum.totalAmount || 0,
        totalSales,
        activeUsers,
        revenueData: salesTrend,
        paymentMethods: paymentMethods.map(m => ({ 
          id: m.paymentMethod, 
          value: m._count._all 
        })),
        monthlySales
      })
    } catch (error) {
      console.error(error)
      return NextResponse.json(
        { error: 'Failed to fetch dashboard data' },
        { status: 500 }
      )
    }
  }