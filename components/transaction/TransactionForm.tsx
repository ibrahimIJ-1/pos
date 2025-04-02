import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useCreateTransaction } from "@/lib/pos-service";
import { useAuth } from "@/contexts/AuthContext";

interface TransactionFormProps {
  onSuccess?: () => void;
}

const transactionSchema = z.object({
  type: z.enum(["SALE", "REFUND", "EXPENSE", "CASH_IN", "CASH_OUT"], {
    required_error: "Please select a transaction type",
  }),
  amount: z.coerce
    .number()
    .min(0.01, { message: "Amount must be greater than 0" }),
  paymentMethod: z.enum(
    ["cash", "credit_card", "debit_card", "bank_transfer", "other"],
    {
      required_error: "Please select a payment method",
    }
  ),
  description: z.string().min(3, {
    message: "Description must be at least 3 characters",
  }),
  referenceId: z.string().optional(),
  registerId: z.string(),
  cashierId: z.string(),
});

export default function TransactionForm({ onSuccess }: TransactionFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createTransaction = useCreateTransaction();
  const { getMacAddress, user } = useAuth();

  const form = useForm<z.infer<typeof transactionSchema>>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: "CASH_IN",
      amount: undefined,
      paymentMethod: "cash",
      description: "",
      referenceId: "",
      registerId: "192.168.1.2", // Default register ID
      //TODO SET CASHIER ID
      cashierId: "42089cee-2673-4cc0-bb9d-6250d61e7257", // Default cashier ID (would normally come from auth context)
    },
  });

  const onSubmit = async (values: z.infer<typeof transactionSchema>) => {
    if (!user) return;
    setIsSubmitting(true);
    const mac = await getMacAddress();

    try {
      await createTransaction.mutateAsync({
        description: values.description,
        amount: values.amount,
        type: values.type,
        paymentMethod: values.paymentMethod,
        referenceId: values.referenceId || undefined,
        registerId: mac,
        cashierId: user.id,
      });

      if (onSuccess) onSuccess();
      form.reset();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add transaction. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Transaction Type</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={isSubmitting}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select transaction type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="SALE">Sale</SelectItem>
                  <SelectItem value="REFUND">Refund</SelectItem>
                  <SelectItem value="EXPENSE">Expense</SelectItem>
                  <SelectItem value="CASH_IN">Cash In</SelectItem>
                  <SelectItem value="CASH_OUT">Cash Out</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {...field}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="paymentMethod"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Payment Method</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={isSubmitting}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="credit_card">Credit Card</SelectItem>
                  <SelectItem value="debit_card">Debit Card</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input
                  placeholder="Transaction description"
                  {...field}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="referenceId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reference ID (Optional)</FormLabel>
              <FormControl>
                <Input
                  placeholder="Order or Invoice number"
                  {...field}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Adding Transaction..." : "Add Transaction"}
        </Button>
      </form>
    </Form>
  );
}
