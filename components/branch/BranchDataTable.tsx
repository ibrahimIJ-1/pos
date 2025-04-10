import React, { useState } from "react";
import {
  useBranches,
  useDeleteBranch,
} from "@/lib/pos-service";
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

export const BranchDataTable = () => {
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
            title: "Branch deleted",
            description: `Branch "${selectedBranch.name}" successfully deleted`,
          });
          setIsDeleteDialogOpen(false);
          setSelectedBranch(null);
        },
        onError: (error) => {
          toast({
            title: "Error",
            description: `Failed to delete branch: ${
              error instanceof Error ? error.message : "Unknown error"
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
          className="bg-gray-100"
          key={Math.random() * 1000}
        >
          Deactivate
        </Badge>
      );
    } else {
      return (
        <Badge
          variant="outline"
          className="bg-green-100 text-green-800"
          key={Math.random() * 1000}
        >
          Activate
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
      header: "Name",
      cell: ({ row }) =>
        row.original.name ? (
          <Badge variant="outline">{row.original.name}</Badge>
        ) : (
          <span className="text-muted-foreground text-sm">No name</span>
        ),
    },
    {
      accessorKey: "address",
      header: "Address",
      cell: ({ row }) =>
        row.original.name ? (
          <Badge variant="outline">{row.original.address}</Badge>
        ) : (
          <span className="text-muted-foreground text-sm">No Address</span>
        ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => getBranchStatusBadge(row.original),
    },
    {
      accessorKey: "lock",
      header: "Lock/Unlock",
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
            title="Edit branch"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-destructive"
            onClick={() => handleDelete(row.original)}
            title="Delete branch"
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
        <h2 className="text-lg font-semibold">Branches</h2>
        <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Branch
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={branches as any}
        filterColumn="name"
        filterPlaceholder="Filter branches..."
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
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the branch{" "}
              <span className="font-medium">{selectedBranch?.name}</span>. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteBranch.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
