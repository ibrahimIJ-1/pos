import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { WarehouseTransactionItemFormType } from "./types/warehouse-transaction-types";
import { getAllBranchTransfers } from "@/actions/branch-transfer/get-all-branch-transfer";
import { createBranchTransfer } from "@/actions/branch-transfer/create-branch-transfer";
import { updateBranchTransfer } from "@/actions/branch-transfer/update-stock-in";
import { deleteBranchTransfer } from "@/actions/branch-transfer/delete-branch-transfer";

export const useBranchTransfers = () => {
  return useQuery({
    queryKey: ["BranchTransfers"],
    queryFn: getAllBranchTransfers,
  });
};

export const useCreateBranchTransfer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      branchTransferData,
      branchTransferItems,
    }: {
      branchTransferData: {
        date: Date | null;
        warehouseId: string;
      };
      branchTransferItems: WarehouseTransactionItemFormType[];
    }) => createBranchTransfer({ branchTransferData, branchTransferItems }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["BranchTransfers"] });
      toast.success("BranchTransfer created successfully");
    },
    onError: (error) => {
      toast.error(
        `Failed to create branchTransfer: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    },
  });
};

export const useUpdateBranchTransfer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      branchTransferData,
      branchTransferItems,
    }: {
      branchTransferData: {
        date: Date | null;
        warehouseId: string;
        id: string;
      };
      branchTransferItems: WarehouseTransactionItemFormType[];
    }) => updateBranchTransfer({ branchTransferData, branchTransferItems }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["BranchTransfers"] });
      toast.success("BranchTransfer updated successfully");
    },
    onError: (error) => {
      toast.error(
        `Failed to update branchTransfer: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    },
  });
};

export const useDeleteBranchTransfer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: { id: string }) => deleteBranchTransfer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["BranchTransfers"] });
      toast.success("BranchTransfer deleted successfully");
    },
    onError: (error) => {
      toast.error(
        `Failed to delete branchTransfer: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    },
  });
};
