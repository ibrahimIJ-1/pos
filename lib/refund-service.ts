import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { checkRefund } from "@/actions/refunds/check-refund";
import { createRefund } from "@/actions/refunds/create-refund";
import { Refund, RefundItem, RefundStatus } from "@prisma/client";
import { getRefunds } from "@/actions/refunds/get-refunds";
import { changeRefundStatus } from "@/actions/refunds/change-refund-status";
import { decimalToNumber } from "./utils";

export const useRefunds = () => {
  return useQuery({
    queryKey: ["refunds"],
    queryFn: async () => await getRefunds(),
    staleTime: 1000 * 60 * 5, // Cache refund for 5 minutes
    refetchInterval: 1000 * 60 * 5,
    refetchOnWindowFocus: false, // Avoid unnecessary refetching
    refetchOnReconnect: "always", // Fetch only if the connection is lost & restored
  });
};

export function useRefundOperations() {
  const queryClient = useQueryClient();

  return {
    checkRefund: useMutation({
      mutationFn: async ({ saleNumber }: { saleNumber: string }) => {
        return await checkRefund(saleNumber);
      },
    }),
    createRefund: useMutation({
      mutationFn: async ({
        refund,
        refundItems,
      }: {
        refund: any;
        refundItems: any;
      }) => {
        refund.discountTotal = Number(refund.discountTotal);
        refund.totalAmount = Number(refund.totalAmount);
        refund.taxTotal = Number(refund.taxTotal);
        refund.subtotal = Number(refund.subtotal);

        refundItems.forEach((element: any) => {
          element.discountAmount = Number(element.discountAmount);
          element.unitPrice = Number(element.unitPrice);
          element.discountAmount = Number(element.discountAmount);
          element.subtotal = Number(element.subtotal);
          element.taxAmount = Number(element.taxAmount);
        });
        return createRefund({
          refund: refund,
          refundItems: refundItems,
        });
      },
      onSuccess: (data) => {},
      onError: (error) => {
        throw error;
      },
    }),
    changeStatus: useMutation({
      mutationFn: async ({
        refundId,
        status,
      }: {
        refundId: string;
        status: RefundStatus;
      }) => {
        return changeRefundStatus(refundId, status);
      },
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: ["refunds"] });
      },
    }),
  };
}
