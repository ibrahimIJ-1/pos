import React, { useState } from "react";
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
import { DiscountDialog } from "./DiscountDialog";
import { Branch, Discount, DiscountType } from "@prisma/client";
import { useDeleteDiscount, useDiscounts } from "@/lib/discounts-service";
import { useTranslations } from "next-intl";
import { useSystem } from "@/providers/SystemProvider";

export const DiscountDataTable = ({ branches }: { branches: Branch[] }) => {
  const {storeCurrency} = useSystem();
  const t = useTranslations();
  const { toast } = useToast();
  const { data: discounts = [] } = useDiscounts();
  const deleteDiscount = useDeleteDiscount();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedDiscount, setSelectedDiscount] = useState<Discount | null>(
    null
  );

  const handleEdit = (discount: Discount) => {
    setSelectedDiscount(discount);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (discount: Discount) => {
    setSelectedDiscount(discount);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedDiscount) {
      deleteDiscount.mutate(selectedDiscount.id, {
        onSuccess: () => {
          toast({
            title: t("Discount deleted"),
            description: `${t("Discount")} "${selectedDiscount.name}" ${t(
              "successfully deleted"
            )}`,
          });
          setIsDeleteDialogOpen(false);
          setSelectedDiscount(null);
        },
        onError: (error) => {
          toast({
            title: t("Error"),
            description: `${t("Failed to delete discount")}: ${
              error instanceof Error ? error.message : t("Unknown error")
            }`,
            variant: "destructive",
          });
        },
      });
    }
  };

  const getDiscountTypeDisplay = (type: string, value: number) => {
    switch (type) {
      case "percentage":
        return `${value}% off`;
      case "fixed":
        return `${storeCurrency} ${value.toFixed(2)} off`;
      case "buy_x_get_y":
        return "Buy X Get Y Free";
      default:
        return type;
    }
  };

  const getDiscountStatusBadge = (discount: Discount) => {
    const now = new Date();
    const startDate = new Date(discount.startDate);
    const endDate = discount.endDate ? new Date(discount.endDate) : null;

    if (!discount.isActive) {
      return (
        <Badge variant="outline" className="bg-gray-100">
          {t("Inactive")}
        </Badge>
      );
    }

    if (now < startDate) {
      return (
        <Badge variant="outline" className="bg-blue-100 text-blue-800">
          {t("Scheduled")}
        </Badge>
      );
    }

    if (endDate && now > endDate) {
      return (
        <Badge variant="outline" className="bg-gray-100">
          {t("Expired")}
        </Badge>
      );
    }

    if (discount.maxUses && discount.currentUses >= discount.maxUses) {
      return (
        <Badge variant="outline" className="bg-gray-100">
          {t("Max Uses Reached")}
        </Badge>
      );
    }

    return (
      <Badge variant="outline" className="bg-green-100 text-green-800">
        {t("Active")}
      </Badge>
    );
  };

  const columns: ColumnDef<Discount>[] = [
    {
      accessorKey: "name",
      header: t("Name"),
      cell: ({ row }) => (
        <span className="font-medium">{row.original.name}</span>
      ),
    },
    {
      accessorKey: "code",
      header: t("Code"),
      cell: ({ row }) =>
        row.original.code ? (
          <Badge variant="outline">{row.original.code}</Badge>
        ) : (
          <span className="text-muted-foreground text-sm">{t("No code")}</span>
        ),
    },
    {
      accessorKey: "type",
      header: t("Type"),
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          {row.original.type === DiscountType.PERCENTAGE ? (
            <Percent className="h-4 w-4 text-muted-foreground" />
          ) : (
            <Tag className="h-4 w-4 text-muted-foreground" />
          )}
          <span>
            {getDiscountTypeDisplay(
              row.original.type,
              parseFloat(row.original.value.toString())
            )}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "validity",
      header: t("Validity"),
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">
            {format(new Date(row.original.startDate), "MMM d")}
            {row.original.endDate
              ? ` - ${format(new Date(row.original.endDate), "MMM d")}`
              : " - ∞"}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: t("Status"),
      cell: ({ row }) => getDiscountStatusBadge(row.original),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleEdit(row.original)}
            title={t("Edit discount")}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-destructive"
            onClick={() => handleDelete(row.original)}
            title={t("Delete discount")}
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
        <h2 className="text-lg font-semibold">{t("Discounts")}</h2>
        <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          {t("Add Discount")}
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={discounts as any}
        filterColumn="name"
        filterPlaceholder={t("Filter discounts") + "..."}
      />

      {/* Add Discount Dialog */}
      <DiscountDialog
        branches={branches}
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        mode="create"
      />

      {/* Edit Discount Dialog */}
      {selectedDiscount && (
        <DiscountDialog
          branches={branches}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          mode="edit"
          discount={selectedDiscount}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent dir={t("dir")}>
          <AlertDialogHeader>
            <AlertDialogTitle className="rtl:text-start">{t("Are you sure")}?</AlertDialogTitle>
            <AlertDialogDescription className="rtl:text-start">
              {t("This will permanently delete the discount")}{" "}
              <span className="font-medium">{selectedDiscount?.name}</span>.
              {t("This action cannot be undone")}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("Cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteDiscount.isPending ? t("Deleting") + "..." : t("Delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
