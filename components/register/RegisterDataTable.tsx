import React, { useState } from "react";
import { useRegisters, useDeleteRegister } from "@/lib/pos-service";
import { useToast } from "@/hooks/use-toast";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Plus, Percent, Tag, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
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
import { Register, RegisterStatus } from "@prisma/client";

export const RegisterDataTable = () => {
  const { toast } = useToast();
  const { data: registers = [] } = useRegisters();
  const deleteRegister = useDeleteRegister();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
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
            title: "Register deleted",
            description: `Register "${selectedRegister.name}" successfully deleted`,
          });
          setIsDeleteDialogOpen(false);
          setSelectedRegister(null);
        },
        onError: (error) => {
          toast({
            title: "Error",
            description: `Failed to delete register: ${
              error instanceof Error ? error.message : "Unknown error"
            }`,
            variant: "destructive",
          });
        },
      });
    }
  };

  const getRegisterStatusBadge = (register: Register) => {
    if (register.status === RegisterStatus.CLOSED) {
      return (
        <Badge variant="outline" className="bg-gray-100">
          Closed
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline" className="bg-green-100 text-green-800">
          Opened
        </Badge>
      );
    }
  };

  const columns: ColumnDef<Register>[] = [
    {
      accessorKey: "id",
      header: "MAC-ADDRESS",
      cell: ({ row }) => <span className="font-medium">{row.original.id}</span>,
    },
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
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => getRegisterStatusBadge(row.original),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleEdit(row.original)}
            title="Edit register"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-destructive"
            onClick={() => handleDelete(row.original)}
            title="Delete register"
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
        <h2 className="text-lg font-semibold">Registers</h2>
        <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Register
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={registers as any}
        filterColumn="name"
        filterPlaceholder="Filter registers..."
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the register{" "}
              <span className="font-medium">{selectedRegister?.name}</span>.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteRegister.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
