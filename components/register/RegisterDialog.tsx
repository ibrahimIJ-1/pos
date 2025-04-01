"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useCreateRegister,
  useUpdateRegister,
  useProducts,
} from "@/lib/pos-service";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DateInput } from "@/components/ui/date-input";
import { NumberInput } from "@/components/ui/number-input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Register } from "@prisma/client";
import Decimal from "decimal.js";

const registerSchema = z.object({
  id: z.string().min(3, { message: "Name must be at least 3 characters" }),
  name: z.string().min(3, { message: "Name must be at least 3 characters" }),
  openBalance: z.number().min(0, { message: "Value must be 0 or more" }),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

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
  const { data: products = [] } = useProducts();
  const createRegister = useCreateRegister();
  const updateRegister = useUpdateRegister();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      id: undefined,
      name: undefined,
      openBalance: 0,
    },
  });

  useEffect(() => {
    if (open && mode === "edit" && register) {
      form.reset({
        id: register.id,
        name: register.name,
        openBalance: Number(register.openingBalance),
      });
    } else if (open && mode === "create") {
      form.reset({
        id: undefined,
        name: undefined,
        openBalance: 0,
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
            {mode === "create" ? "Create Register" : "Edit Register"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <ScrollArea className="h-auto p-4">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="id"
                  render={({ field }) => (
                    <FormItem className="px-1">
                      <FormLabel>MacAddress</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter the Mac-Address" {...field} />
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
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter the Register Name"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="openBalance"
                  render={({ field }) => (
                    <FormItem className="px-1">
                      <FormLabel>Open Balance</FormLabel>
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
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createRegister.isPending || updateRegister.isPending}
              >
                {mode === "create"
                  ? createRegister.isPending
                    ? "Creating..."
                    : "Create Register"
                  : updateRegister.isPending
                  ? "Updating..."
                  : "Update Register"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
