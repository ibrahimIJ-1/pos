
import { activateWarehouse } from "@/actions/warehouses/activate-warehouse";
import { createWarehouse } from "@/actions/warehouses/create-warehouse";
import { deactivateWarehouse } from "@/actions/warehouses/deactivate-warehouse";
import { deleteWarehouse } from "@/actions/warehouses/delete-warehouse";
import { getAllSelectableUserWarehouses } from "@/actions/warehouses/get-all-selectable-user-warehouses";
import { getAllWarehouses } from "@/actions/warehouses/get-all-warehouses";
import { getAllUserWarehouses } from "@/actions/warehouses/get-user-all-warehouses";
import { setUserDefaultWarehouse } from "@/actions/warehouses/set-user-default-warehouse";
import { updateWarehouse } from "@/actions/warehouses/update-warehouse";
import { Shelf } from "@prisma/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CreateUpdateShelfType } from "./types/CreateUpdateShelfType";

export const useWarehouses = () => {
    return useQuery({
      queryKey: ["warehouses"],
      queryFn: getAllWarehouses,
    });
  };

export const useSelectableUserWarehouses = () => {
    return useQuery({
      queryKey: ["SelectableUserWarehouses"],
      queryFn: getAllSelectableUserWarehouses,
    });
  };

  export const useUserWarehouses = () => {
    return useQuery({
      queryKey: ["userWarehouses"],
      queryFn: getAllUserWarehouses,
    });
  };
  
  export const useCreateWarehouse = () => {
    const queryClient = useQueryClient();
  
    return useMutation({
      mutationFn: ({ name, address,shelves }: { name: string; address: string; shelves:CreateUpdateShelfType[] }) =>
        createWarehouse(name, address,shelves),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["warehouses"] });
        toast.success("Warehouse created successfully");
      },
      onError: (error) => {
        toast.error(
          `Failed to create warehouse: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      },
    });
  };
  export const useSetUserDefaultWarehouse = () => {
    const queryClient = useQueryClient();
  
    return useMutation({
      mutationFn: (warehouseId: string) => setUserDefaultWarehouse(warehouseId),
      onSuccess: () => {
        window.location.reload();
      },
      onError: (error) => {
        toast.error(
          `Failed to change warehouse: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      },
    });
  };
  export const useUpdateWarehouse = () => {
    const queryClient = useQueryClient();
  
    return useMutation({
      mutationFn: ({
        id,
        address,
        name,
        shelves
      }: {
        id: string;
        address: string;
        name: string;
        shelves: CreateUpdateShelfType[];
      }) => updateWarehouse(id, name, address, shelves),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["warehouses"] });
        toast.success("Warehouse updated successfully");
      },
      onError: (error) => {
        toast.error(
          `Failed to update warehouse: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      },
    });
  };
  
  export const useDeleteWarehouse = () => {
    const queryClient = useQueryClient();
  
    return useMutation({
      mutationFn: deleteWarehouse,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["warehouses"] });
        toast.success("Warehouse deleted successfully");
      },
      onError: (error) => {
        toast.error(
          `Failed to delete warehouse: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      },
    });
  };
  
  export const useOpenWarehouse = () => {
    const queryClient = useQueryClient();
  
    return useMutation({
      mutationFn: async ({ id }: { id: string }) => activateWarehouse(id),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["warehouses"] });
        toast.success("Warehouse activated successfully");
      },
      onError: (error) => {
        toast.error(
          `Failed to activated warehouse: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      },
    });
  };
  
  export const useCloseWarehouse = () => {
    const queryClient = useQueryClient();
  
    return useMutation({
      mutationFn: async ({ id }: { id: string }) => deactivateWarehouse(id),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["warehouses"] });
        toast.success("Warehouse deactivated successfully");
      },
      onError: (error) => {
        toast.error(
          `Failed to deactivated warehouse: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      },
    });
  };