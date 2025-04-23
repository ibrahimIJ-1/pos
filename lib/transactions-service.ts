import { createRegisterTransaction } from "@/actions/accounting/transactions/create-register-transaction";
import { getAllRegisterTransactions } from "@/actions/accounting/transactions/get-all-register-transactions";
import { getRegisterTransactionById } from "@/actions/accounting/transactions/get-registere-transaction-by-id";
import { RegisterTransaction } from "@prisma/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useTransactions = () => {
    return useQuery({
      queryKey: ["transactions"],
      queryFn: async () => {
        const response = await getAllRegisterTransactions();
        return response;
      },
    });
  };
  
  export const useTransaction = (id: string) => {
    return useQuery({
      queryKey: ["transactions", id],
      queryFn: async () => {
        const response = (await getRegisterTransactionById(
          id
        )) as RegisterTransaction;
        return response;
      },
      enabled: !!id,
    });
  };
  
  export const useCreateTransaction = () => {
    const queryClient = useQueryClient();
  
    return useMutation({
      mutationFn: async (transactionData: any) => {
        const response = await createRegisterTransaction(transactionData);
        return response;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["transactions"] });
        queryClient.invalidateQueries({ queryKey: ["registers"] });
      },
    });
  };