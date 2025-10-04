import { Branch } from "@prisma/client";
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Form } from "../ui/form";
import { Button } from "../ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "@/hooks/use-toast";
import { useCloseWarehouse, useOpenWarehouse } from "@/lib/warehouses-service";
import { useTranslations } from "next-intl";

interface WarehouseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  warehouse: Branch;
}
function ActivateDeactivateModal({
  open,
  onOpenChange,
  warehouse,
}: WarehouseDialogProps) {
  const t = useTranslations();
  const warehouseSchema = z.object({
    id: z.string().min(3, { message: t("Name must be at least 3 characters") }),
  });

  type ToggleFormValues = z.infer<typeof warehouseSchema>;
  const openWarehouse = useOpenWarehouse();
  const closeWarehouse = useCloseWarehouse();

  const form = useForm<ToggleFormValues>({
    resolver: zodResolver(warehouseSchema),
    defaultValues: {
      id: warehouse?.id,
    },
  });
  const onSubmit = (values: ToggleFormValues) => {
    if (warehouse.isActive == false) {
      openWarehouse.mutate(
        {
          id: values.id,
        },
        {
          onSuccess: () => {
            toast({
              title: t("Warehouse Switched"),
              description: `${t("Warehouse")} "${warehouse.name}" ${t(
                "successfully Switched"
              )}`,
            });
            onOpenChange(false);
          },
          onError: (error: any) => {
            toast({
              title: t("Error"),
              description: `${t("Failed to Switch warehouse")}: ${
                error instanceof Error ? error.message : t("Unknown error")
              }`,
              variant: "destructive",
            });
          },
        }
      );
    } else {
      closeWarehouse.mutate(
        {
          id: warehouse.id,
        },
        {
          onSuccess: () => {
            toast({
              title: t("Warehouse Switched"),
              description: `${t("Warehouse")} "${warehouse.name}" ${t(
                "successfully Switched"
              )}`,
            });
            onOpenChange(false);
          },
          onError: (error: any) => {
            toast({
              title: t("Error"),
              description: `${t("Failed to Switch warehouse")}: ${
                error instanceof Error ? error.message : t("Unknown error")
              }`,
              variant: "destructive",
            });
          },
        }
      );
    }
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle className="rtl:text-start">
            {warehouse.isActive === true ? t("Close Warehouse") : t("Open Warehouse")}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                {t("Cancel")}
              </Button>
              <Button
                type="submit"
                disabled={openWarehouse.isPending || closeWarehouse.isPending}
              >
                {warehouse?.isActive === true
                  ? openWarehouse.isPending
                    ? t("Closing") + "..."
                    : t("Close Warehouse")
                  : closeWarehouse.isPending
                  ? t("Opening") + "..."
                  : t("Open Warehouse")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default ActivateDeactivateModal;
