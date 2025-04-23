"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { NumberInput } from "@/components/ui/number-input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Branch } from "@prisma/client";
import { useCreateBranch, useUpdateBranch } from "@/lib/branches-service";

const branchSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters" }),
  address: z
    .string()
    .min(3, { message: "Address must be at least 3 characters" }),
});

type BranchFormValues = z.infer<typeof branchSchema>;

interface BranchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  branch?: Branch;
}

export function BranchDialog({
  open,
  onOpenChange,
  mode,
  branch,
}: BranchDialogProps) {
  const createBranch = useCreateBranch();
  const updateBranch = useUpdateBranch();

  const form = useForm<BranchFormValues>({
    resolver: zodResolver(branchSchema),
    defaultValues: {
      name: undefined,
      address: undefined,
    },
  });

  useEffect(() => {
    if (open && mode === "edit" && branch) {
      form.reset({
        name: branch.name,
        address: branch.address??undefined,
      });
    } else if (open && mode === "create") {
      form.reset({
        name: undefined,
        address: undefined,
      });
    }
  }, [open, mode, branch, form]);

  const onSubmit = (values: BranchFormValues) => {
    
    if (mode === "create") {
      createBranch.mutate(
        {
          address: values.address,
          name: values.name,
        },
        {
          onSuccess: () => {
            onOpenChange(false);
          },
        }
      );
    } else if (mode === "edit" && branch) {
      updateBranch.mutate(
        {
          id: branch.id,
          name: values.name,
          address: values.address,
        },
        {
          onSuccess: () => {
            onOpenChange(false);
          },
        }
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Create Branch" : "Edit Branch"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <ScrollArea className="h-auto p-4">
              <div className="space-y-4">
              <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="px-1">
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter the Branch Name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem className="px-1">
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter the Address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4"></div>
              </div>
            </ScrollArea>

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
                disabled={createBranch.isPending || updateBranch.isPending}
              >
                {mode === "create"
                  ? createBranch.isPending
                    ? "Creating..."
                    : "Create Branch"
                  : updateBranch.isPending
                  ? "Updating..."
                  : "Update Branch"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
