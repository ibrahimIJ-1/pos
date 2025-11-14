import { getWarehouseItemsWithAvailableShelves } from "@/actions/warehouse-transactions/core";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useItemsByWarehouse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id }: { id: string }) =>
      getWarehouseItemsWithAvailableShelves(id),
    onError: (error) => {
      toast.error(
        `Failed to fetch warehouse items: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    },
  });
};
