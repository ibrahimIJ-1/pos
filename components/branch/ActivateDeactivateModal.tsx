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

const branchSchema = z.object({
  id: z.string().min(3, { message: "Name must be at least 3 characters" }),
});

type ToggleFormValues = z.infer<typeof branchSchema>;

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
              title: "Branch Switched",
              description: `Branch "${branch.name}" successfully Switched`,
            });
            onOpenChange(false);
          },
          onError: (error: any) => {
            toast({
              title: "Error",
              description: `Failed to Switch branch: ${
                error instanceof Error ? error.message : "Unknown error"
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
              title: "Branch Switched",
              description: `Branch "${branch.name}" successfully Switched`,
            });
            onOpenChange(false);
          },
          onError: (error: any) => {
            toast({
              title: "Error",
              description: `Failed to Switch branch: ${
                error instanceof Error ? error.message : "Unknown error"
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
          <DialogTitle>
            {branch.isActive === true ? "Close Branch" : "Open Branch"}
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
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={openBranch.isPending || closeBranch.isPending}
              >
                {branch?.isActive === true
                  ? openBranch.isPending
                    ? "Closing..."
                    : "Close Register"
                  : closeBranch.isPending
                  ? "Opening..."
                  : "Open Register"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default ActivateDeactivateModal;
