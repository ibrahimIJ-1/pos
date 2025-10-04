"use client";

import React, { useEffect, useRef } from "react";
import { useFieldArray, useForm } from "react-hook-form";
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
import { Shelf, Branch as Warehouse } from "@prisma/client";
import {
  useCreateWarehouse,
  useUpdateWarehouse,
} from "@/lib/warehouses-service";
import { useTranslations } from "next-intl";
import * as XLSX from "xlsx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

interface WarehouseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  warehouse?: Warehouse & { Shelf: Shelf[] };
}

export function WarehouseDialog({
  open,
  onOpenChange,
  mode,
  warehouse,
}: WarehouseDialogProps) {
  const t = useTranslations();
  const warehouseSchema = z.object({
    name: z
      .string()
      .min(3, { message: t("Name must be at least 3 characters") }),
    address: z
      .string()
      .min(3, { message: t("Address must be at least 3 characters") }),
    shelves: z
      .array(
        z.object({
          id: z.string().optional(),
          name: z.string().min(1, { message: t("Shelf name required") }),
        })
      )
      .optional(),
  });

  type WarehouseFormValues = z.infer<typeof warehouseSchema>;
  const createWarehouse = useCreateWarehouse();
  const updateWarehouse = useUpdateWarehouse();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<WarehouseFormValues>({
    resolver: zodResolver(warehouseSchema),
    defaultValues: {
      name: undefined,
      address: undefined,
      shelves: [],
    },
  });
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "shelves",
  });

  useEffect(() => {
    if (open && mode === "edit" && warehouse) {
      form.reset({
        name: warehouse.name,
        address: warehouse.address ?? undefined,
        shelves: warehouse.Shelf ?? [],
      });
    } else if (open && mode === "create") {
      form.reset({
        name: undefined,
        address: undefined,
        shelves: [],
      });
    }
  }, [open, mode, warehouse, form]);

  const onSubmit = (values: WarehouseFormValues) => {
    if (mode === "create") {
      createWarehouse.mutate(
        {
          address: values.address,
          name: values.name,
          shelves: values.shelves ?? [],
        },
        {
          onSuccess: () => {
            onOpenChange(false);
          },
        }
      );
    } else if (mode === "edit" && warehouse) {
      updateWarehouse.mutate(
        {
          id: warehouse.id,
          name: values.name,
          address: values.address,
          shelves: values.shelves ?? [],
        },
        {
          onSuccess: () => {
            onOpenChange(false);
          },
        }
      );
    }
  };

  const handleExcelImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<{ name: string }>(sheet);

    // Remove duplicates by name (case-insensitive)
    const existingNames = new Set(fields.map((f) => f.name.toLowerCase()));
    const uniqueRows = rows.filter(
      (row) => row.name && !existingNames.has(row.name.toLowerCase())
    );
    // Remove duplicates within the Excel file itself
    const seen = new Set<string>();
    const finalRows = uniqueRows.filter((row) => {
      const name = row.name.toLowerCase();
      if (seen.has(name)) return false;
      seen.add(name);
      return true;
    });

    finalRows.forEach((row) => append({ name: row.name }));
  };

  const handleDownloadTemplate = () => {
    // Create a simple Excel file with a "name" column
    const worksheet = XLSX.utils.aoa_to_sheet([["name"]]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Shelves");
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "shelves-template.xlsx";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="rtl:text-start">
            {mode === "create" ? t("Create Warehouse") : t("Edit Warehouse")}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <ScrollArea className="h-auto p-4" dir={t("dir") as "rtl" | "ltr"}>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="px-1">
                      <FormLabel>{t("Name")}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t("Enter the Warehouse Name")}
                          {...field}
                        />
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
                      <FormLabel>{t("Address")}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t("Enter the Address")}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4"></div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold">{t("Shelves")}</span>
                  <div className="flex gap-2">
                    {/* Split Button: Add Shelf */}
                    <div className="relative flex">
                      <Button
                        type="button"
                        size="sm"
                        className="rounded-r-none bg-green-600 text-white hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 dark:text-white"
                        onClick={() => append({ name: "" })}
                      >
                        <span className="flex items-center gap-1">
                          <span>{t("Add Shelf")}</span>
                          <span className="text-xs">+</span>
                        </span>
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            type="button"
                            size="sm"
                            variant="secondary"
                            className="rounded-l-none border-l-0 bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700"
                          >
                            <span className="flex items-center gap-1">
                              <span>{t("Excel")}</span>
                              <svg
                                width="12"
                                height="12"
                                className="inline-block"
                              >
                                <path
                                  d="M2 4l4 4 4-4"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  fill="none"
                                />
                              </svg>
                            </span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                          <DropdownMenuItem
                            onClick={handleDownloadTemplate}
                            className="hover:bg-green-50 dark:hover:bg-green-900 text-green-700 dark:text-green-400"
                          >
                            <span className="flex items-center gap-2">
                              <svg
                                width="16"
                                height="16"
                                className="inline-block"
                              >
                                <path
                                  d="M8 2v8m0 0l-4-4m4 4l4-4"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  fill="none"
                                />
                              </svg>
                              {t("Download Template")}
                            </span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => fileInputRef.current?.click()}
                            className="hover:bg-blue-50 dark:hover:bg-blue-900 text-blue-700 dark:text-blue-400"
                          >
                            <span className="flex items-center gap-2">
                              <svg
                                width="16"
                                height="16"
                                className="inline-block"
                              >
                                <rect
                                  x="2"
                                  y="2"
                                  width="12"
                                  height="12"
                                  rx="2"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  fill="none"
                                />
                                <path
                                  d="M4 8h8"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                />
                              </svg>
                              {t("Import Excel")}
                            </span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".xlsx,.xls"
                        style={{ display: "none" }}
                        onChange={handleExcelImport}
                      />
                    </div>
                  </div>
                </div>
                {fields.map((field, idx) => (
                  <div key={field.id} className="flex gap-2 items-center">
                    {/* Hidden input for id if editing */}
                    {field.id && (
                      <input
                        type="hidden"
                        {...form.register(`shelves.${idx}.id`)}
                      />
                    )}
                    <FormField
                      control={form.control}
                      name={`shelves.${idx}.name`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input placeholder={t("Shelf Name")} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={() => remove(idx)}
                    >
                      ✕
                    </Button>
                  </div>
                ))}
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
                disabled={
                  createWarehouse.isPending || updateWarehouse.isPending
                }
              >
                {mode === "create"
                  ? createWarehouse.isPending
                    ? t("Creating") + "..."
                    : t("Create Warehouse")
                  : updateWarehouse.isPending
                  ? t("Updating") + "..."
                  : t("Update Warehouse")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
