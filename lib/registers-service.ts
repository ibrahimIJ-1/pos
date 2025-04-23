import { closeRegister } from "@/actions/accounting/registers/close-register";
import { createRegister } from "@/actions/accounting/registers/create-register";
import { deleteRegister } from "@/actions/accounting/registers/delete-register";
import { getAllRegisters } from "@/actions/accounting/registers/get-all-registers";
import { openRegister } from "@/actions/accounting/registers/open-register";
import { updateRegister } from "@/actions/accounting/registers/update-register";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useRegister = () => {
  return useQuery({
    queryKey: ["register"],
    queryFn: getAllRegisters,
  });
};

export const useDeleteRegister = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteRegister,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["registers"] });
      toast.success("Register deleted successfully");
    },
    onError: (error) => {
      toast.error(
        `Failed to delete register: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    },
  });
};
export const useCreateRegister = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      macAddress,
      name,
      openBalance,
      branchId,
    }: {
      macAddress: string;
      name: string;
      openBalance: number;
      branchId: string;
    }) => createRegister(macAddress, name, openBalance, branchId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["registers"] });
      toast.success("Register deleted successfully");
    },
    onError: (error) => {
      toast.error(
        `Failed to delete register: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    },
  });
};
export const useUpdateRegister = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      macAddress,
      name,
      openBalance,
      branchId,
    }: {
      macAddress: string;
      name: string;
      openBalance: number;
      branchId: string;
    }) => updateRegister(macAddress, name, openBalance, branchId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["registers"] });
      toast.success("Register deleted successfully");
    },
    onError: (error) => {
      toast.error(
        `Failed to delete register: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    },
  });
};

export const useOpenRegister = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      openingBalance,
    }: {
      id: string;
      openingBalance: number;
    }) => openRegister(id, openingBalance),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["registers"] });
      toast.success("Register opened successfully");
    },
    onError: (error) => {
      toast.error(
        `Failed to open register: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    },
  });
};

export const useCloseRegister = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      closingBalance,
    }: {
      id: string;
      closingBalance: number;
    }) => closeRegister(id, closingBalance),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["registers"] });
      toast.success("Register closed successfully");
    },
    onError: (error) => {
      toast.error(
        `Failed to close register: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    },
  });
};

export const useRegisters = () => {
  return useQuery({
    queryKey: ["registers"],
    queryFn: getAllRegisters,
  });
};
