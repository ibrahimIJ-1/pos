import React, { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Plus, UnlockIcon, LockIcon } from "lucide-react";
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
import { RegisterDialog } from "./RegisterDialog";
import { Branch, Register, RegisterStatus } from "@prisma/client";
import OpenCloseModal from "./OpenCloseModal";
import { useDeleteRegister, useRegisters } from "@/lib/registers-service";
import { useTranslations } from "next-intl";

export const RegisterDataTable = () => {
  const t = useTranslations();
  const { toast } = useToast();
  const { data: registers = [] } = useRegisters();
  const deleteRegister = useDeleteRegister();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isToggleDialogOpen, setIsToggleDialogOpen] = useState(false);
  const [selectedRegister, setSelectedRegister] = useState<Register | null>(
    null
  );

  const handleEdit = (register: Register) => {
    setSelectedRegister(register);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (register: Register) => {
    setSelectedRegister(register);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedRegister) {
      deleteRegister.mutate(selectedRegister.id, {
        onSuccess: () => {
          toast({
            title: t("Register deleted"),
            description: `${t("Register")} "${selectedRegister.name}" ${t(
              "successfully deleted"
            )}`,
          });
          setIsDeleteDialogOpen(false);
          setSelectedRegister(null);
        },
        onError: (error) => {
          toast({
            title: t("Error"),
            description: `${t("Failed to delete register")}: ${
              error instanceof Error ? error.message : t("Unknown error")
            }`,
            variant: "destructive",
          });
        },
      });
    }
  };

  const toggleOpenClose = (register: Register) => {
    setSelectedRegister(register);
    setIsToggleDialogOpen(true);
  };

  const getRegisterStatusBadge = (register: Register) => {
    if (register.status === RegisterStatus.CLOSED) {
      return (
        <Badge
          variant="outline"
          className="bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100"
          key={Math.random() * 1000}
        >
          {t("Closed")}
        </Badge>
      );
    } else {
      return (
        <Badge
          variant="outline"
          className="bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
          key={Math.random() * 1000}
        >
          {t("Opened")}
        </Badge>
      );
    }
  };

  const getRegisterStatusToggle = (register: Register) => {
    if (register.status === RegisterStatus.CLOSED) {
      return (
        <Button
          onClick={() => toggleOpenClose(register)}
          key={Math.random() * 1000}
        >
          <UnlockIcon className="w-6 h-6" />
        </Button>
      );
    } else {
      return (
        <Button
          onClick={() => toggleOpenClose(register)}
          variant={"destructive"}
          key={Math.random() * 1000}
        >
          <LockIcon className="w-6 h-6" />
        </Button>
      );
    }
  };

  const columns: ColumnDef<Register & { branch?: Branch }>[] = [
    {
      accessorKey: "id",
      header: t("Serial Number"),
      cell: ({ row }) => <span className="font-medium">{row.original.id}</span>,
    },
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
      accessorKey: "branch",
      header: t("Branch"),
      cell: ({ row }) =>
        row.original.branch ? (
          <Badge variant="outline">{row.original.branch.name}</Badge>
        ) : (
          <span className="text-muted-foreground text-sm">
            {t("No branch")}
          </span>
        ),
    },
    {
      accessorKey: "status",
      header: t("Status"),
      cell: ({ row }) => getRegisterStatusBadge(row.original),
    },
    {
      accessorKey: "lock",
      header: t("Lock/Unlock"),
      cell: ({ row }) => getRegisterStatusToggle(row.original),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleEdit(row.original)}
            title={t("Edit register")}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-destructive"
            onClick={() => handleDelete(row.original)}
            title={t("Delete register")}
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
        <h2 className="text-lg font-semibold">{t("Registers")}</h2>
        <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          {t("Add Register")}
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={registers as any}
        filterColumn="name"
        filterPlaceholder={t("Filter registers") + "..."}
      />

      {/* Add Register Dialog */}
      <RegisterDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        mode="create"
      />

      {/* Edit Register Dialog */}
      {selectedRegister && (
        <RegisterDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          mode="edit"
          register={selectedRegister}
        />
      )}

      {selectedRegister && (
        <OpenCloseModal
          open={isToggleDialogOpen}
          onOpenChange={setIsToggleDialogOpen}
          register={selectedRegister}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="rtl:text-start">
              {t("Are you sure")}?
            </AlertDialogTitle>
            <AlertDialogDescription className="rtl:text-start">
              {t("This will permanently delete the register")}{" "}
              <span className="font-medium">{selectedRegister?.name}</span>.
              {t("This action cannot be undone")}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("Cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteRegister.isPending ? t("Deleting") + "..." : t("Delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
