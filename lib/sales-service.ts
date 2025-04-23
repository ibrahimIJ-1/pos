import { createNewSale } from "@/actions/sales/create-sale";
import { getAllSales } from "@/actions/sales/get-all-sales";
import { getSaleById } from "@/actions/sales/get-sale-by-id";
import { Sale, SaleItem } from "@prisma/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useSales = (page = 1, limit = 20, customerId?: string) => {
    return useQuery({
      queryKey: ["sales", page, limit, customerId],
      queryFn: () => getAllSales({ page, limit, customerId }),
    });
  };
  
  export const useSale = (id: string) => {
    return useQuery({
      queryKey: ["sales", id],
      queryFn: () => getSaleById(id),
      enabled: !!id,
    });
  };
  
  export const useCreateSale = () => {
    const queryClient = useQueryClient();
  
    return useMutation({
      mutationFn: ({ newSale, items }: { newSale: Sale; items: SaleItem[] }) =>
        createNewSale(newSale, items),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["sales"] });
        toast.success("Sale completed successfully");
      },
      onError: (error) => {
        toast.error(
          `Failed to complete sale: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      },
    });
  };