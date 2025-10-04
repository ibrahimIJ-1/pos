import React, { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import {
  Edit,
  Trash2,
  Plus,

  UnlockIcon,
  LockIcon,
} from "lucide-react";
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
import { Branch as Warehouse, Shelf } from "@prisma/client";
import ActivateDeactivateModal from "./ActivateDeactivateModal";
import { useWarehouses, useDeleteWarehouse } from "@/lib/warehouses-service";
import { useTranslations } from "next-intl";
import { WarehouseDialog } from "./WarehouseDialog";

export const WarehouseDataTable = () => {
  const t = useTranslations()
  const { toast } = useToast();
  const { data: warehouses = [] } = useWarehouses();
  const deleteWarehouse = useDeleteWarehouse();


  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isToggleDialogOpen, setIsToggleDialogOpen] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState<(Warehouse & { Shelf: Shelf[] }) | null>(null);

  const handleEdit = (warehouse: Warehouse) => {
    setSelectedWarehouse({ ...warehouse, Shelf: (warehouse as any).Shelf || [] });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (warehouse: Warehouse) => {
    setSelectedWarehouse({ ...warehouse, Shelf: (warehouse as any).Shelf || [] });
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedWarehouse) {
      deleteWarehouse.mutate(selectedWarehouse.id, {
        onSuccess: () => {
          toast({
            title: t("Warehouse deleted"),
            description: `${t("Warehouse")} "${selectedWarehouse.name}" ${t("successfully deleted")}`,
          });
          setIsDeleteDialogOpen(false);
          setSelectedWarehouse(null);
        },
        onError: (error) => {
          toast({
            title: t("Error"),
            description: `${t("Failed to delete warehouse")}: ${
              error instanceof Error ? error.message : t("Unknown error")
            }`,
            variant: "destructive",
          });
        },
      });
    }
  };

  const toggleOpenClose = (warehouse: Warehouse) => {
    setSelectedWarehouse({ ...warehouse, Shelf: (warehouse as any).Shelf || [] });
    setIsToggleDialogOpen(true);
  };

  const getWarehouseStatusBadge = (warehouse: Warehouse) => {
    if (warehouse.isActive === false) {
      return (
        <Badge
          variant="outline"
          className="bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100"
          key={Math.random() * 1000}
        >
          {t("Deactivate")}
        </Badge>
      );
    } else {
      return (
        <Badge
          variant="outline"
          className="bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
          key={Math.random() * 1000}
        >
          {t("Activate")}
        </Badge>
      );
    }
  };

  const getWarehouseStatusToggle = (warehouse: Warehouse) => {
    if (warehouse.isActive === false) {
      return (
        <Button
          onClick={() => toggleOpenClose(warehouse)}
          key={Math.random() * 1000}
        >
          <UnlockIcon className="w-6 h-6" />
        </Button>
      );
    } else {
      return (
        <Button
          onClick={() => toggleOpenClose(warehouse)}
          variant={"destructive"}
          key={Math.random() * 1000}
        >
          <LockIcon className="w-6 h-6" />
        </Button>
      );
    }
  };

  const columns: ColumnDef<Warehouse>[] = [

    {
      accessorKey: "name",
      header: t("Name"),
      cell: ({ row }) =>
        row.original.name ? (
          <Badge variant="outline">{row.original.name}</Badge>
        ) : (
          <span className="text-muted-foreground text-sm">{t("No name")}</span>
        ),
    },
    {
      accessorKey: "address",
      header: t("Address"),
      cell: ({ row }) =>
        row.original.name ? (
          <Badge variant="outline">{row.original.address}</Badge>
        ) : (
          <span className="text-muted-foreground text-sm">{t("No Address")}</span>
        ),
    },
    {
      accessorKey: "status",
      header: t("Status"),
      cell: ({ row }) => getWarehouseStatusBadge(row.original),
    },
    {
      accessorKey: "lock",
      header: t("Lock/Unlock"),
      cell: ({ row }) => getWarehouseStatusToggle(row.original),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleEdit(row.original)}
            title={t("Edit warehouse")}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-destructive"
            onClick={() => handleDelete(row.original)}
            title={t("Delete warehouse")}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">{t("Warehouses")}</h2>
        <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          {t("Add Warehouse")}
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={warehouses as any}
        filterColumn="name"
        filterPlaceholder={t("Filter warehouses")+"..."}
      />

      {/* Add Warehouse Dialog */}
      <WarehouseDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        mode="create"
      />

      {/* Edit Warehouse Dialog */}
      {selectedWarehouse && (
        <WarehouseDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          mode="edit"
          warehouse={selectedWarehouse}
        />
      )}

      {selectedWarehouse && (
        <ActivateDeactivateModal
          open={isToggleDialogOpen}
          onOpenChange={setIsToggleDialogOpen}
          warehouse={selectedWarehouse}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="rtl:text-start">{t("Are you sure")}?</AlertDialogTitle>
            <AlertDialogDescription className="rtl:text-start">
              {t("This will permanently delete the warehouse")}{" "}
              <span className="font-medium">{selectedWarehouse?.name}</span>. {t("This action cannot be undone")}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("Cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteWarehouse.isPending ? t("Deleting")+"..." : t("Delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
