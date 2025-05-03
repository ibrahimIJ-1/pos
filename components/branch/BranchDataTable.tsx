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
import { BranchDialog } from "./BranchDialog";
import { Branch } from "@prisma/client";
import ActivateDeactivateModal from "./ActivateDeactivateModal";
import { useBranches, useDeleteBranch } from "@/lib/branches-service";
import { useTranslations } from "next-intl";

export const BranchDataTable = () => {
  const t = useTranslations()
  const { toast } = useToast();
  const { data: branches = [] } = useBranches();
  const deleteBranch = useDeleteBranch();


  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isToggleDialogOpen, setIsToggleDialogOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);

  const handleEdit = (branch: Branch) => {
    setSelectedBranch(branch);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (branch: Branch) => {
    setSelectedBranch(branch);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedBranch) {
      deleteBranch.mutate(selectedBranch.id, {
        onSuccess: () => {
          toast({
            title: t("Branch deleted"),
            description: `${t("Branch")} "${selectedBranch.name}" ${t("successfully deleted")}`,
          });
          setIsDeleteDialogOpen(false);
          setSelectedBranch(null);
        },
        onError: (error) => {
          toast({
            title: t("Error"),
            description: `${t("Failed to delete branch")}: ${
              error instanceof Error ? error.message : t("Unknown error")
            }`,
            variant: "destructive",
          });
        },
      });
    }
  };

  const toggleOpenClose = (branch: Branch) => {
    setSelectedBranch(branch);
    setIsToggleDialogOpen(true);
  };

  const getBranchStatusBadge = (branch: Branch) => {
    if (branch.isActive === false) {
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

  const getBranchStatusToggle = (branch: Branch) => {
    if (branch.isActive === false) {
      return (
        <Button
          onClick={() => toggleOpenClose(branch)}
          key={Math.random() * 1000}
        >
          <UnlockIcon className="w-6 h-6" />
        </Button>
      );
    } else {
      return (
        <Button
          onClick={() => toggleOpenClose(branch)}
          variant={"destructive"}
          key={Math.random() * 1000}
        >
          <LockIcon className="w-6 h-6" />
        </Button>
      );
    }
  };

  const columns: ColumnDef<Branch>[] = [

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
      cell: ({ row }) => getBranchStatusBadge(row.original),
    },
    {
      accessorKey: "lock",
      header: t("Lock/Unlock"),
      cell: ({ row }) => getBranchStatusToggle(row.original),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleEdit(row.original)}
            title={t("Edit branch")}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-destructive"
            onClick={() => handleDelete(row.original)}
            title={t("Delete branch")}
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
        <h2 className="text-lg font-semibold">{t("Branches")}</h2>
        <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          {t("Add Branch")}
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={branches as any}
        filterColumn="name"
        filterPlaceholder={t("Filter branches")+"..."}
      />

      {/* Add Branch Dialog */}
      <BranchDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        mode="create"
      />

      {/* Edit Branch Dialog */}
      {selectedBranch && (
        <BranchDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          mode="edit"
          branch={selectedBranch}
        />
      )}

      {selectedBranch && (
        <ActivateDeactivateModal
          open={isToggleDialogOpen}
          onOpenChange={setIsToggleDialogOpen}
          branch={selectedBranch}
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
              {t("This will permanently delete the branch")}{" "}
              <span className="font-medium">{selectedBranch?.name}</span>. {t("This action cannot be undone")}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("Cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteBranch.isPending ? t("Deleting")+"..." : t("Delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
