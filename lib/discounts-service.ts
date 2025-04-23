import { createNewDiscount } from "@/actions/discounts/create-discount";
import { deleteDiscount } from "@/actions/discounts/delete-discount";
import { getAllDiscounts } from "@/actions/discounts/get-all-discounts";
import { getAllPOSDiscounts } from "@/actions/discounts/get-all-pos-discounts";
import { getDiscountById } from "@/actions/discounts/get-discount-by-id";
import { updateDiscount } from "@/actions/discounts/update-discount";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useDiscounts = () => {
    return useQuery({
      queryKey: ["discounts"],
      queryFn: getAllDiscounts,
    });
  };
  
  export const usePOSDiscounts = () => {
    return useQuery({
      queryKey: ["pos-discounts"],
      queryFn: getAllPOSDiscounts,
    });
  };
  
  export const useDiscount = (id: string) => {
    return useQuery({
      queryKey: ["discounts", id],
      queryFn: () => getDiscountById,
      enabled: !!id,
    });
  };
  
  export const useCreateDiscount = () => {
    const queryClient = useQueryClient();
  
    return useMutation({
      mutationFn: async (newDiscount: any & { productIds: any }) => {
        const discount: any = await createNewDiscount(newDiscount);
        return discount;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["discounts"] });
        toast.success("Discount created successfully");
      },
      onError: (error) => {
        toast.error(
          `Failed to create discount: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      },
    });
  };
  
  export const useUpdateDiscount = () => {
    const queryClient = useQueryClient();
  
    return useMutation({
      mutationFn: async (discount: any & { productIds: any }) => {
        const updatedDiscount = await updateDiscount(discount);
        return updatedDiscount;
      },
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: ["discounts"] });
        queryClient.invalidateQueries({
          queryKey: ["discounts", (data as any).id],
        });
        toast.success("Discount updated successfully");
      },
      onError: (error) => {
        toast.error(
          `Failed to update discount: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      },
    });
  };
  
  export const useDeleteDiscount = () => {
    const queryClient = useQueryClient();
  
    return useMutation({
      mutationFn: deleteDiscount,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["discounts"] });
        toast.success("Discount deleted successfully");
      },
      onError: (error) => {
        toast.error(
          `Failed to delete discount: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      },
    });
  };