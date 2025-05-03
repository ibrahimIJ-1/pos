import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useTransaction } from "@/lib/transactions-service";
import { useTranslations } from "next-intl";
import { useSystem } from "@/providers/SystemProvider";

interface TransactionDetailsProps {
  id: string;
}

export function TransactionDetails({ id }: TransactionDetailsProps) {
  const { storeCurrency } = useSystem();
  const t = useTranslations();
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
      <Card className="border-destructive" dir={t("dir")}>
        <CardHeader>
          <CardTitle>{t("Error")}</CardTitle>
          <CardDescription>
            {t("Could not load transaction details, Please try again")}.
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
    <Card dir={t("dir")}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">{t("Transaction Details")}</CardTitle>
          <Badge className={getTransactionTypeColor(transaction.type)}>
            {t(transaction.type)}
          </Badge>
        </div>
        <CardDescription>
          {t("Transaction")} #{transaction.id} - {t("Created on")}{" "}
          {transaction.created_at.toString()}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              {t("Amount")}
            </p>
            <p className="text-xl font-semibold">
              {storeCurrency} {Math.abs(Number(transaction.amount)).toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              {t("Payment Method")}
            </p>
            <Badge className={getPaymentMethodColor(transaction.paymentMethod)}>
              {t(transaction.paymentMethod)}
            </Badge>
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-muted-foreground">
            {t("Description")}
          </p>
          <p>{transaction.description}</p>
        </div>

        {transaction.referenceId && (
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              {t("Reference ID")}
            </p>
            <p>{transaction.referenceId}</p>
          </div>
        )}

        <div>
          <p className="text-sm font-medium text-muted-foreground">
            {t("Cashier")}
          </p>
          <p>
            {t("ID")}: {transaction.cashierId}
          </p>
        </div>

        <div>
          <p className="text-sm font-medium text-muted-foreground">
            {t("Register")}
          </p>
          <p>
            {t("ID")}: {transaction.registerId}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default TransactionDetails;
