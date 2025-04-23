import { activateBranch } from "@/actions/branches/activate-branch";
import { createBranch } from "@/actions/branches/create-branch";
import { deactivateBranch } from "@/actions/branches/deactivate-branch";
import { deleteBranch } from "@/actions/branches/delete-branch";
import { getAllBranches } from "@/actions/branches/get-all-branches";
import { getAllUserBranches } from "@/actions/branches/get-user-all-branches";
import { setUserDefaultBranch } from "@/actions/branches/set-user-default-branch";
import { updateBranch } from "@/actions/branches/update-branch";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useBranches = () => {
    return useQuery({
      queryKey: ["branches"],
      queryFn: getAllBranches,
    });
  };
  export const useUserBranches = () => {
    return useQuery({
      queryKey: ["userBranches"],
      queryFn: getAllUserBranches,
    });
  };
  
  export const useCreateBranch = () => {
    const queryClient = useQueryClient();
  
    return useMutation({
      mutationFn: ({ name, address }: { name: string; address: string }) =>
        createBranch(name, address),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["branches"] });
        toast.success("Branch deleted successfully");
      },
      onError: (error) => {
        toast.error(
          `Failed to delete branch: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      },
    });
  };
  export const useSetUserDefaultBranch = () => {
    const queryClient = useQueryClient();
  
    return useMutation({
      mutationFn: (branchId: string) => setUserDefaultBranch(branchId),
      onSuccess: () => {
        window.location.reload();
      },
      onError: (error) => {
        toast.error(
          `Failed to change branch: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      },
    });
  };
  export const useUpdateBranch = () => {
    const queryClient = useQueryClient();
  
    return useMutation({
      mutationFn: ({
        id,
        address,
        name,
      }: {
        id: string;
        address: string;
        name: string;
      }) => updateBranch(id, name, address),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["branches"] });
        toast.success("Branch deleted successfully");
      },
      onError: (error) => {
        toast.error(
          `Failed to delete branch: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      },
    });
  };
  
  export const useDeleteBranch = () => {
    const queryClient = useQueryClient();
  
    return useMutation({
      mutationFn: deleteBranch,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["branches"] });
        toast.success("Branch deleted successfully");
      },
      onError: (error) => {
        toast.error(
          `Failed to delete branch: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      },
    });
  };
  
  export const useOpenBranch = () => {
    const queryClient = useQueryClient();
  
    return useMutation({
      mutationFn: async ({ id }: { id: string }) => activateBranch(id),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["branches"] });
        toast.success("Branch activated successfully");
      },
      onError: (error) => {
        toast.error(
          `Failed to activated branch: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      },
    });
  };
  
  export const useCloseBranch = () => {
    const queryClient = useQueryClient();
  
    return useMutation({
      mutationFn: async ({ id }: { id: string }) => deactivateBranch(id),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["branches"] });
        toast.success("Branch deactivated successfully");
      },
      onError: (error) => {
        toast.error(
          `Failed to deactivated branch: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      },
    });
  };