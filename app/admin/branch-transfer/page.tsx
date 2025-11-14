"use client";

import React, { useEffect, useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  XCircle,
  UserPlus,
  Users,
  Edit,
  Trash2,
} from "lucide-react";
import { UserRole, Permission } from "@/lib/permissions";
import { PermissionGuard } from "@/hooks/usePermissions";
import { useTranslations } from "next-intl";
import { useDeleteBranchTransfer, useBranchTransfers } from "@/lib/branch-transfer-service";
import { WarehouseTransactionRow } from "@/lib/types/warehouse-transaction-types";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { BranchTransferDialog } from "@/components/branch-transfer/BranchtransferDialog";

export default function BranchTransfer() {
  const t = useTranslations();
  const { data: branchTransfers, isLoading, refetch } = useBranchTransfers();
  const deleleteMutation = useDeleteBranchTransfer();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedBranchTransfer, setSelectedBranchTransfer] = useState<
    WarehouseTransactionRow | undefined
  >(undefined);
  const [viewMode, setViewMode] = useState<"list" | "details">("list");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [branchTransferToDelete, setBranchTransferToDelete] = useState<string | null>(null);

  // Table column definitions
  const columns: ColumnDef<WarehouseTransactionRow>[] = [
    {
      accessorKey: "code",
      header: t("Code"),
      cell: ({ row }) => <div className="font-medium">{row.original.code}</div>,
    },
    {
      accessorKey: "date",
      header: t("Date"),
      cell: ({ row }) => (
        <div>{row.original.date?.toISOString().split("T")[0] || "-"}</div>
      ),
    },
    {
      accessorKey: "warehouse",
      header: t("Warehouse"),
      cell: ({ row }) => <div>{row.original?.warehouse?.name || "-"}</div>,
    },
    {
      accessorKey: "status",
      header: t("Status"),
      cell: ({ row }) => (
        <div>
          {row.original.status === "PENDING" ? (
            <Badge variant="outline" className="flex items-center gap-1 w-max">
              <CheckCircle className="h-3.5 w-3.5 text-blue-500" />
              {t("PENDING")}
            </Badge>
          ) : row.original.status === "DECLINED" ? (
            <Badge variant="outline" className="flex items-center gap-1 w-max">
              <XCircle className="h-3.5 w-3.5 text-red-400" />
              {t("DECLINED")}
            </Badge>
          ) : (
            <Badge variant="outline" className="flex items-center gap-1 w-max">
              <XCircle className="h-3.5 w-3.5 text-green-400" />
              {t("COMPLETED")}
            </Badge>
          )}
        </div>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex justify-end space-x-2">
          <PermissionGuard
            userRole={[UserRole.ADMIN, UserRole.MANAGER, UserRole.CASHIER]}
            permission={Permission.EDIT_CUSTOMERS}
          >
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                editBranchTransfer(row.original);
              }}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(row.original.id);
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </PermissionGuard>
        </div>
      ),
    },
  ];

  const viewBranchTransferDetails = (branchTransfer: WarehouseTransactionRow) => {
    setSelectedBranchTransfer(branchTransfer);
    setViewMode("details");
  };

  const editBranchTransfer = (branchTransfer: WarehouseTransactionRow) => {
    setSelectedBranchTransfer(branchTransfer);
    setIsEditOpen(true);
  };

  const handleAddNewClick = () => {
    setIsAddOpen(true);
  };

  const handleBackToList = () => {
    setViewMode("list");
    setSelectedBranchTransfer(undefined);
  };

  const handleBranchTransferSuccess = () => {
    refetch();
  };

  const handleDelete = (id: string) => {
    setBranchTransferToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (branchTransferToDelete) {
      deleleteMutation.mutate(
        { id: branchTransferToDelete },
        {
          onSuccess: () => {
            setIsDeleteDialogOpen(false);
            toast.success(
              `${t("deleted successfully")}`
            );
          },
        }
      );
    }
  };

  useEffect(() => {});

  return (
    <div className="container mx-auto p-6 space-y-6">
      <>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users className="h-6 w-6" />
            <h1 className="text-2xl font-bold">{t("BranchTransfers")}</h1>
          </div>
          <PermissionGuard
            userRole={[UserRole.ADMIN, UserRole.MANAGER, UserRole.CASHIER]}
            permission={Permission.CREATE_CUSTOMER}
          >
            <Button onClick={handleAddNewClick}>
              <UserPlus className="h-4 w-4 mr-2" />
              {t("Add New BranchTransfer")}
            </Button>
          </PermissionGuard>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <p>{t("Loading branchTransfers")}...</p>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={branchTransfers as any[] || []}
            filterColumn="code"
            filterPlaceholder={t("Search branchTransfers") + "..."}
            className="neon-border"
          />
        )}
      </>
      {/* Add New BranchTransfer Dialog */}
      <BranchTransferDialog
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        onSuccess={handleBranchTransferSuccess}
      />
      {/* Edit BranchTransfer Dialog */}
      <BranchTransferDialog
        branchTransfer={selectedBranchTransfer}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        onSuccess={handleBranchTransferSuccess}
      />
      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="rtl:text-start">{t("Are you sure")}?</AlertDialogTitle>
            <AlertDialogDescription className="rtl:text-start">
              {t("This action cannot be undone")}.{" "}
              {t("This will permanently delete the Stock-in")} &quot; {t("from the warehouse")}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("Cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t("Delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
