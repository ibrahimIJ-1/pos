import { createNewCustomer } from "@/actions/customers/create-customer";
import { getAllCustomers } from "@/actions/customers/get-all-customers";
import { getCustomerById } from "@/actions/customers/get-customer-by-id";
import { updateCustomer } from "@/actions/customers/update-customer";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useCustomers = () => {
    return useQuery({
      queryKey: ["customers"],
      queryFn: getAllCustomers,
    });
  };
  
  export const useCustomer = (id: string) => {
    return useQuery({
      queryKey: ["customers", id],
      queryFn: () => getCustomerById(id),
      enabled: !!id,
    });
  };
  
  export const useCreateCustomer = () => {
    const queryClient = useQueryClient();
  
    return useMutation({
      mutationFn: createNewCustomer,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["customers"] });
        toast.success("Customer created successfully");
      },
      onError: (error) => {
        toast.error(
          `Failed to create customer: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      },
    });
  };
  
  export const useUpdateCustomer = () => {
    const queryClient = useQueryClient();
  
    return useMutation({
      mutationFn: updateCustomer,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["customers"] });
        toast.success("Customer updated successfully");
      },
      onError: (error) => {
        toast.error(
          `Failed to update customer: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      },
    });
  };