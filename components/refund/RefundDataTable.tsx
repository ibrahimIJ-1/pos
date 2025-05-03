import React, { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { CheckIcon, Edit, EyeIcon, ViewIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ColumnDef } from "@tanstack/react-table";
import {
  Customer,
  Refund,
  RefundItem,
  RefundStatus,
  Sale,
} from "@prisma/client";
import { useTranslations } from "next-intl";
import { useRefunds } from "@/lib/refund-service";
import { RefundManagerDialog } from "./RefundManagerDialog";

export const RefundDataTable = () => {
  const t = useTranslations();
  const { data: refunds = [] } = useRefunds();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isToggleDialogOpen, setIsToggleDialogOpen] = useState(false);
  const [selectedRefund, setselectedRefund] = useState<
    (Refund & { sale: Sale; customer: Customer; items: RefundItem[] }) | null
  >(null);

  const handleEdit = (
    refund: Refund & { sale: Sale; customer: Customer; items: RefundItem[] }
  ) => {
    setselectedRefund(refund);
    setIsEditDialogOpen(true);
  };

  const toggleOpenClose = (
    refund: Refund & { sale: Sale; customer: Customer; items: RefundItem[] }
  ) => {
    setselectedRefund(refund);
    setIsToggleDialogOpen(true);
  };

  const getRefundStatusBadge = (refund: Refund) => {
    if (refund.status === RefundStatus.DECLINED) {
      return (
        <Badge
          variant="outline"
          className="bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100"
          key={Math.random() * 1000}
        >
          {t("Rejected")}
        </Badge>
      );
    } else if (refund.status === RefundStatus.COMPLETED) {
      return (
        <Badge
          variant="outline"
          className="bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
          key={Math.random() * 1000}
        >
          {t("Approved")}
        </Badge>
      );
    } else if (refund.status === RefundStatus.PENDING) {
      return (
        <Badge
          variant="outline"
          className="bg-orange-100 text-orange-800 dark:bg-orange-800 dark:text-orange-100"
          key={Math.random() * 1000}
        >
          {t("Pending")}
        </Badge>
      );
    } else if (refund.status === RefundStatus.CANCELLED) {
      return (
        <Badge
          variant="outline"
          className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100"
          key={Math.random() * 1000}
        >
          {t("Canceled")}
        </Badge>
      );
    }
  };

  const columns: ColumnDef<
    Refund & { sale: Sale; customer: Customer; items: RefundItem[] }
  >[] = [
    {
      accessorKey: "id",
      header: t("Sale Serial Number"),
      cell: ({ row }) => (
        <span className="font-medium">{row.original.sale?.saleNumber}</span>
      ),
    },
    {
      accessorKey: "date",
      header: t("Date"),
      cell: ({ row }) => (
        <span className="font-medium">
          {row.original.created_at?.toDateString()}
        </span>
      ),
    },
    {
      accessorKey: "customer",
      header: t("Customer"),
      cell: ({ row }) => (
        <span className="font-medium">
          {row.original.customerId ? row.original.customer.name : t("Guest")}
        </span>
      ),
    },
    {
      accessorKey: "totalRefund",
      header: t("Total Refund"),
      cell: ({ row }) => (
        <span className="font-medium">
          ${Number(row.original.totalAmount).toFixed(2)}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: t("Status"),
      cell: ({ row }) => getRefundStatusBadge(row.original),
    },

    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleEdit(row.original)}
            title={t("Check Refund")}
          >
            <EyeIcon className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">{t("Refunds")}</h2>
      </div>

      <DataTable
        columns={columns}
        data={
          (refunds ?? []) as (Refund & {
            sale: Sale;
            customer: Customer;
            items: RefundItem[];
          })[]
        }
        filterColumn="id"
        filterPlaceholder={t("Filter refunds") + "..."}
      />

      {selectedRefund && (
        <RefundManagerDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          mode="edit"
          refund={selectedRefund}
        />
      )}
    </>
  );
};
