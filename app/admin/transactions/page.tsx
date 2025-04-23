"use client";

import React, { useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { PlusIcon, SearchIcon } from "lucide-react";
import TransactionDialog from "@/components/transaction/TransactionDialog";
import TransactionDetails from "@/components/transaction/TransactionDetails";
import AccountingSummary from "@/components/accounting/AccountingSummary";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RegisterTransaction } from "@prisma/client";
import { useTransactions } from "@/lib/transactions-service";

export default function Transactions() {
  const { data: transactions, isLoading, error } = useTransactions();
  const [selectedTransaction, setSelectedTransaction] = useState<string | null>(
    null
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

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

  const columns: ColumnDef<RegisterTransaction>[] = [
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => {
        const id: string = row.getValue("id");
        return <div className="font-medium">{id}</div>;
      },
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => {
        const type: string = row.getValue("type");
        return (
          <Badge className={getTransactionTypeColor(type)}>
            {type.replace("_", " ").toUpperCase()}
          </Badge>
        );
      },
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("amount"));
        // Format as currency
        const formatted = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(Math.abs(amount));

        return (
          <div className={amount < 0 ? "text-red-500" : "text-green-500"}>
            {formatted}
          </div>
        );
      },
    },
    {
      accessorKey: "paymentMethod",
      header: "Payment Method",
      cell: ({ row }) => {
        const method: string = row.getValue("paymentMethod");
        return (
          <Badge className={getPaymentMethodColor(method)}>{method}</Badge>
        );
      },
    },
    {
      accessorKey: "description",
      header: "Description",
    },
    {
      accessorKey: "created_at",
      header: "Date",
      cell: ({ row }) => {
        const date: string = row.getValue("created_at");
        return <div>{date}</div>;
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const transaction = row.original;
        return (
          <Button
            variant="ghost"
            onClick={() => setSelectedTransaction(transaction.id)}
          >
            View
          </Button>
        );
      },
    },
  ];

  const filteredTransactions = React.useMemo(() => {
    if (!transactions) return [];
    if (!searchQuery.trim()) return transactions;

    const query = searchQuery.toLowerCase();
    return (transactions as any[]).filter(
      (transaction) =>
        transaction.id.toLowerCase().includes(query) ||
        transaction.name.toLowerCase().includes(query) ||
        transaction.status.toLowerCase().includes(query)
    );
  }, [transactions, searchQuery]);

  if (error) {
    return <div>Error loading transactions: {error.message}</div>;
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Financial Management</h1>
        <Button onClick={() => setDialogOpen(true)}>
          <PlusIcon className="mr-2 h-4 w-4" /> Add Transaction
        </Button>
      </div>

      <Tabs defaultValue="summary">
        <TabsList>
          <TabsTrigger value="summary">Financial Summary</TabsTrigger>
          <TabsTrigger value="transactions">Transactions List</TabsTrigger>
          {selectedTransaction && (
            <TabsTrigger value="details">Transaction Details</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="summary" className="pt-4">
          <AccountingSummary />
        </TabsContent>

        <TabsContent value="transactions" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Transactions History</CardTitle>
              <div className="flex items-center">
                <SearchIcon className="h-4 w-4 mr-2" />
                <Input
                  placeholder="Search transactions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="max-w-sm neon-input transition-shadow duration-300"
                />
              </div>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={columns}
                data={(filteredTransactions as any)}
                filterColumn="description"
                filterPlaceholder="Filter by description..."
              />
              {isLoading && (
                <div className="mt-4 text-center">Loading transactions...</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {selectedTransaction && (
          <TabsContent value="details" className="pt-4">
            <TransactionDetails id={selectedTransaction} />
          </TabsContent>
        )}
      </Tabs>

      <TransactionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={() => {
          // Refresh the transactions list
        }}
      />
    </div>
  );
}
