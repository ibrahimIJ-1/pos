import React from "react";
import { useTransaction } from "@/lib/pos-service";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface TransactionDetailsProps {
  id: string;
}

export function TransactionDetails({ id }: TransactionDetailsProps) {
  const { data: transaction, isLoading, error } = useTransaction(id);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-4 w-1/4" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </CardContent>
      </Card>
    );
  }

  if (error || !transaction) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle>Error</CardTitle>
          <CardDescription>
            Could not load transaction details. Please try again.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case "SALE":
        return "bg-green-500 hover:bg-green-600";
      case "refund":
        return "bg-amber-500 hover:bg-amber-600";
      case "expense":
        return "bg-red-500 hover:bg-red-600";
      case "cash_in":
        return "bg-blue-500 hover:bg-blue-600";
      case "cash_out":
        return "bg-purple-500 hover:bg-purple-600";
      default:
        return "bg-gray-500 hover:bg-gray-600";
    }
  };

  const getPaymentMethodColor = (method: string) => {
    switch (method) {
      case "cash":
        return "bg-emerald-500 hover:bg-emerald-600";
      case "credit_card":
        return "bg-indigo-500 hover:bg-indigo-600";
      case "debit_card":
        return "bg-sky-500 hover:bg-sky-600";
      case "bank_transfer":
        return "bg-teal-500 hover:bg-teal-600";
      default:
        return "bg-gray-500 hover:bg-gray-600";
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">Transaction Details</CardTitle>
          <Badge className={getTransactionTypeColor(transaction.type)}>
            {transaction.type}
          </Badge>
        </div>
        <CardDescription>
          Transaction #{transaction.id} - Created on{" "}
          {transaction.created_at.toString()}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Amount</p>
            <p className="text-xl font-semibold">
              ${Math.abs(Number(transaction.amount)).toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Payment Method
            </p>
            <Badge className={getPaymentMethodColor(transaction.paymentMethod)}>
              {transaction.paymentMethod}
            </Badge>
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-muted-foreground">
            Description
          </p>
          <p>{transaction.description}</p>
        </div>

        {transaction.referenceId && (
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Reference ID
            </p>
            <p>{transaction.referenceId}</p>
          </div>
        )}

        <div>
          <p className="text-sm font-medium text-muted-foreground">Cashier</p>
          <p>ID: {transaction.cashierId}</p>
        </div>

        <div>
          <p className="text-sm font-medium text-muted-foreground">Register</p>
          <p>ID: {transaction.registerId}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default TransactionDetails;
