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
import { Register } from "@prisma/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useBranches } from "@/lib/branches-service";
import { useCreateRegister, useUpdateRegister } from "@/lib/registers-service";
import { useTranslations } from "next-intl";

interface RegisterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  register?: Register;
}

export function RegisterDialog({
  open,
  onOpenChange,
  mode,
  register,
}: RegisterDialogProps) {
  const t = useTranslations();
  const registerSchema = z.object({
    id: z
      .string()
      .min(3, { message: t("Serial Number must be at least 3 characters") }),
    name: z
      .string()
      .min(3, { message: t("Name must be at least 3 characters") }),
    openBalance: z.number().min(0, { message: t("Value must be 0 or more") }),
    branchId: z
      .string()
      .min(3, { message: t("Branch must be at least 3 characters") }),
  });

  type RegisterFormValues = z.infer<typeof registerSchema>;
  const { data: branches } = useBranches();
  const createRegister = useCreateRegister();
  const updateRegister = useUpdateRegister();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      id: undefined,
      name: undefined,
      openBalance: 0,
      branchId: undefined,
    },
  });

  useEffect(() => {
    if (open && mode === "edit" && register) {
      form.reset({
        id: register.id,
        name: register.name,
        openBalance: Number(register.openingBalance),
        branchId: register.branchId,
      });
    } else if (open && mode === "create") {
      form.reset({
        id: undefined,
        name: undefined,
        openBalance: 0,
        branchId: undefined,
      });
    }
  }, [open, mode, register, form]);

  const onSubmit = (values: RegisterFormValues) => {
    if (mode === "create") {
      createRegister.mutate(
        {
          macAddress: values.id,
          name: values.name,
          openBalance: values.openBalance,
          branchId: values.branchId,
        },
        {
          onSuccess: () => {
            onOpenChange(false);
          },
        }
      );
    } else if (mode === "edit" && register) {
      updateRegister.mutate(
        {
          macAddress: values.id,
          name: values.name,
          openBalance: values.openBalance,
          branchId: values.branchId,
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
          <DialogTitle className="rtl:text-start">
            {mode === "create" ? t("Create Register") : t("Edit Register")}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <ScrollArea className="h-auto p-4" dir={t("dir") as "rtl" | "ltr"}>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="id"
                  render={({ field }) => (
                    <FormItem className="px-1">
                      <FormLabel>{t("Serial Number")}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t("Enter the SN")}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="px-1">
                      <FormLabel>{t("Name")}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t("Enter the Register Name")}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="branchId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("Branch")}</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        dir={t("dir") as "rtl" | "ltr"}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t("Select a branch")} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {branches?.map((branch) => (
                            <SelectItem key={branch.id} value={branch.id}>
                              {branch.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="openBalance"
                  render={({ field }) => (
                    <FormItem className="px-1">
                      <FormLabel>{t("Open Balance")}</FormLabel>
                      <FormControl>
                        <NumberInput min={0} step={0.01} {...field} />
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
                {t("Cancel")}
              </Button>
              <Button
                type="submit"
                disabled={createRegister.isPending || updateRegister.isPending}
              >
                {mode === "create"
                  ? createRegister.isPending
                    ? t("Creating") + "..."
                    : t("Create Register")
                  : updateRegister.isPending
                  ? t("Updating") + "..."
                  : t("Update Register")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
