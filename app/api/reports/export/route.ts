// app/api/reports/export/route.ts
import { NextResponse } from 'next/server'
import { format } from 'date-fns'
import { prisma } from '@/lib/prisma'

export async function POST() {
  try {
    const sales = await prisma.sale.findMany({
      select: {
        totalAmount: true,
        paymentMethod: true,
        created_at: true,
        customer: { select: { name: true }},
        items: { select: { productName: true, quantity: true }}
      },
      orderBy: { created_at: 'desc' }
    })

    const csvData = [
      ['Date', 'Customer', 'Amount', 'Payment Method', 'Products'],
      ...sales.map((sale:any) => [
        format(sale.created_at, 'yyyy-MM-dd'),
        sale.customer?.name || 'Anonymous',
        sale.totalAmount,
        sale.paymentMethod,
        sale.items.map((i:any) => `${i.productName} (x${i.quantity})`).join(', ')
      ])
    ].map(row => row.join(',')).join('\n')

    return new Response(csvData, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename=sales-report.csv'
      }
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    )
  }
}