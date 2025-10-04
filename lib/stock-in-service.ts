import { createStockIn } from "@/actions/stock-in/create-stock-in";
import { deleteStockIn } from "@/actions/stock-in/delete-stock-in";
import { getAllStockIns } from "@/actions/stock-in/get-all-stock-ins";
import { updateStockIn } from "@/actions/stock-in/update-stock-in";
import { WarehouseTransactionItemsInterface } from "@/actions/warehouse-transactions/core";
import { StockIn } from "@prisma/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { StockInItemFormType } from "./types/warehouse-transaction-types";

export const useStockIns = () => {
  return useQuery({
    queryKey: ["stockIns"],
    queryFn: getAllStockIns,
  });
};

export const useCreateStockIn = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      stockInData,
      stockInItems,
    }: {
      stockInData: {
        date: Date | null;
        warehouseId: string;
      };
      stockInItems: StockInItemFormType[];
    }) => createStockIn({ stockInData, stockInItems }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stockIns"] });
      toast.success("StockIn created successfully");
    },
    onError: (error) => {
      toast.error(
        `Failed to create stockIn: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    },
  });
};

export const useUpdateStockIn = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      stockInData,
      stockInItems,
    }: {
      stockInData: {
        date: Date | null;
        warehouseId: string;
        id: string;
      };
      stockInItems: StockInItemFormType[];
    }) => updateStockIn({ stockInData, stockInItems }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stockIns"] });
      toast.success("StockIn updated successfully");
    },
    onError: (error) => {
      toast.error(
        `Failed to update stockIn: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    },
  });
};

export const useDeleteStockIn = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: { id: string }) => deleteStockIn(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stockIns"] });
      toast.success("StockIn deleted successfully");
    },
    onError: (error) => {
      toast.error(
        `Failed to delete stockIn: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    },
  });
};
