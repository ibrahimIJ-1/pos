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
import { useAuth } from "@/contexts/AuthContext";
import { useCreateTransaction } from "@/lib/transactions-service";
import { useTranslations } from "next-intl";

interface TransactionFormProps {
  onSuccess?: () => void;
}

export default function TransactionForm({ onSuccess }: TransactionFormProps) {
  const t = useTranslations();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createTransaction = useCreateTransaction();
  const { getMacAddress, user } = useAuth();
  const transactionSchema = z.object({
    type: z.enum(["SALE", "REFUND", "EXPENSE", "CASH_IN", "CASH_OUT"], {
      required_error: t("Please select a transaction type"),
    }),
    amount: z.coerce
      .number()
      .min(0.01, { message: t("Amount must be greater than 0") }),
    paymentMethod: z.enum(
      ["cash", "credit_card", "debit_card", "bank_transfer", "other"],
      {
        required_error: t("Please select a payment method"),
      }
    ),
    description: z.string().min(3, {
      message: t("Description must be at least 3 characters"),
    }),
    referenceId: z.string().optional(),
    registerId: z.string(),
    cashierId: z.string(),
  });
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
        description: t("Failed to add transaction, Please try again"),
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
              <FormLabel>{t("Transaction Type")}</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={isSubmitting}
                dir={t("dir") as "rtl" | "ltr"}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t("Select transaction type")} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="SALE">{t("Sale")}</SelectItem>
                  <SelectItem value="REFUND">{t("Refund")}</SelectItem>
                  <SelectItem value="EXPENSE">{t("Expense")}</SelectItem>
                  <SelectItem value="CASH_IN">{t("Cash In")}</SelectItem>
                  <SelectItem value="CASH_OUT">{t("Cash Out")}</SelectItem>
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
              <FormLabel>{t("Amount")}</FormLabel>
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
              <FormLabel>{t("Payment Method")}</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={isSubmitting}
                dir={t("dir") as "rtl" | "ltr"}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t("Select payment method")} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="cash">{t("Cash")}</SelectItem>
                  <SelectItem value="credit_card">
                    {t("Credit Card")}
                  </SelectItem>
                  <SelectItem value="debit_card">{t("Debit Card")}</SelectItem>
                  <SelectItem value="bank_transfer">
                    {t("Bank Transfer")}
                  </SelectItem>
                  <SelectItem value="other">{t("Other")}</SelectItem>
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
              <FormLabel>{t("Description")}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t("Transaction description")}
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
              <FormLabel>
                {t("Reference ID")} ({t("Optional")})
              </FormLabel>
              <FormControl>
                <Input
                  placeholder={t("Order or Invoice number")}
                  {...field}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? t("Adding Transaction")+"..." : t("Add Transaction")}
        </Button>
      </form>
    </Form>
  );
}
