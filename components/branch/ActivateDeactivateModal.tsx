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
import { useCloseBranch, useOpenBranch } from "@/lib/branches-service";
import { useTranslations } from "next-intl";

interface BranchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  branch: Branch;
}
function ActivateDeactivateModal({
  open,
  onOpenChange,
  branch,
}: BranchDialogProps) {
  const t = useTranslations();
  const branchSchema = z.object({
    id: z.string().min(3, { message: t("Name must be at least 3 characters") }),
  });

  type ToggleFormValues = z.infer<typeof branchSchema>;
  const openBranch = useOpenBranch();
  const closeBranch = useCloseBranch();

  const form = useForm<ToggleFormValues>({
    resolver: zodResolver(branchSchema),
    defaultValues: {
      id: branch?.id,
    },
  });
  const onSubmit = (values: ToggleFormValues) => {
    if (branch.isActive == false) {
      openBranch.mutate(
        {
          id: values.id,
        },
        {
          onSuccess: () => {
            toast({
              title: t("Branch Switched"),
              description: `${t("Branch")} "${branch.name}" ${t(
                "successfully Switched"
              )}`,
            });
            onOpenChange(false);
          },
          onError: (error: any) => {
            toast({
              title: t("Error"),
              description: `${t("Failed to Switch branch")}: ${
                error instanceof Error ? error.message : t("Unknown error")
              }`,
              variant: "destructive",
            });
          },
        }
      );
    } else {
      closeBranch.mutate(
        {
          id: branch.id,
        },
        {
          onSuccess: () => {
            toast({
              title: t("Branch Switched"),
              description: `${t("Branch")} "${branch.name}" ${t(
                "successfully Switched"
              )}`,
            });
            onOpenChange(false);
          },
          onError: (error: any) => {
            toast({
              title: t("Error"),
              description: `${t("Failed to Switch branch")}: ${
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
            {branch.isActive === true ? t("Close Branch") : t("Open Branch")}
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
                disabled={openBranch.isPending || closeBranch.isPending}
              >
                {branch?.isActive === true
                  ? openBranch.isPending
                    ? t("Closing") + "..."
                    : t("Close Register")
                  : closeBranch.isPending
                  ? t("Opening") + "..."
                  : t("Open Register")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default ActivateDeactivateModal;
