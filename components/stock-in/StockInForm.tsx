"use client";

import React, { useEffect, useRef } from "react";
import { z } from "zod";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { StockIn, WarehouseTransactions } from "@prisma/client";
import { useTranslations } from "next-intl";
import { useCreateStockIn, useUpdateStockIn } from "@/lib/stock-in-service";
import { useUserWarehouses, useWarehouses } from "@/lib/warehouses-service";
import {
  parseStockInExcel,
  generateStockInTemplate,
} from "./stock-in-excel-utils";
import { StockInItemRow } from "./StockInItemRow";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { useProducts } from "@/lib/products-service";

// Form schema validation

interface StockInFormProps {
  initialData?: StockIn & { warehouseTransactions: WarehouseTransactions[] };
  onSuccess?: () => void;
  onCancel?: () => void;
  id?: string;
}

export function StockInForm({
  initialData,
  onSuccess,
  onCancel,
  id,
}: StockInFormProps) {
  // Place this after the function parameter destructuring
  const [forceRerender, setForceRerender] = React.useState<number>(0);

  const t = useTranslations();
  const navigate = useRouter();
  // Reset shelves when warehouse changes
  const prevWarehouseId = useRef<string | undefined>(undefined);

  const { mutate: createStockIn, isPending } = useCreateStockIn();
  const { mutate: updateStockIn, isPending: isUpdatePending } =
    useUpdateStockIn();
  const { data: warehouses, isPending: isWarehousesPending } =
    useUserWarehouses();
  const { data: products, isPending: isProductsPending } = useProducts();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formSchema = z.object({
    date: z.date().optional().default(new Date()),
    warehouseId: z.string().nonempty(t("Warehouse is required")),
    items: z
      .array(
        z.object({
          productId: z.string().nonempty(t("Product is required")),
          shelfId: z.string().nonempty(t("Shelf is required")),
          quantity: z.number().min(1, t("Quantity must be at least 1")),
        })
      )
      .min(0, t("At least one item is required")),
  });

  type StockInFormValues = z.infer<typeof formSchema>;
  const form = useForm<StockInFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData
      ? {
          date: initialData.date || new Date(),
          warehouseId: initialData.warehouseId || "",
          items: (initialData.warehouseTransactions || []).map((item) => ({
            productId: item.productId,
            shelfId: item.shelfId ?? "",
            quantity:
              typeof item.quantity === "object" && "toNumber" in item.quantity
                ? (item.quantity as any).toNumber()
                : Number(item.quantity),
          })),
        }
      : {
          date: new Date(),
          warehouseId: "",
          items: [],
        },
  });
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const onSubmit = (data: StockInFormValues) => {
    if (id) {
      updateStockIn(
        {
          stockInData: {
            id: id,
            warehouseId: data.warehouseId || "",
            date: data.date,
          },
          stockInItems: data.items,
        },
        {
          onSuccess: () => {
            toast.success(t("StockIn saved successfully"));
            if (onSuccess) {
              onSuccess();
            } else {
              navigate.push("/admin/stockIns");
            }
          },
        }
      );
    } else {
      createStockIn(
        {
          stockInData: {
            warehouseId: data.warehouseId || "",
            date: data.date,
          },
          stockInItems: data.items,
        },
        {
          onSuccess: () => {
            toast.success(t("StockIn saved successfully"));
            if (onSuccess) {
              onSuccess();
            } else {
              navigate.push("/admin/stockIns");
            }
          },
        }
      );
    }
  };

  // Excel import for StockIn items: expects columns 'product', 'shelf', 'quantity'
  const handleExcelImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const data = await file.arrayBuffer();
    const { rows, sheetName } = parseStockInExcel(data);
    // Find warehouse by sheet name (case-insensitive)
    const warehouse = warehouses?.find(
      (w) => w.name?.toLowerCase() === sheetName.toLowerCase()
    );
    let selectedWarehouseId = form.getValues().warehouseId;
    let warehouseChanged = false;
    if (warehouse && selectedWarehouseId !== warehouse.id) {
      selectedWarehouseId = warehouse.id;
      warehouseChanged = true;
      form.setValue("warehouseId", warehouse.id, {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true,
      });
      form.setValue("items", []);
      setForceRerender((v: number) => v + 1);
    }
    const mapAndAppendItems = () => {
      const productMap = new Map<string, string>();
      (Array.isArray(products) ? products : []).forEach((p: any) => {
        if (p.name) productMap.set(p.name.toLowerCase(), p.id);
      });
      const shelfMap = new Map<string, string>();
      warehouses
        ?.find((w) => w.id === selectedWarehouseId)
        ?.Shelf?.forEach((s: any) => {
          if (s.name) shelfMap.set(s.name.toLowerCase(), s.id);
        });
      const existingKeys = new Set(
        fields.map(
          (f) => `${f.productId.toLowerCase()}-${f.shelfId.toLowerCase()}`
        )
      );
      const uniqueRows = rows.filter(
        (row) =>
          row.product &&
          row.shelf &&
          !existingKeys.has(
            `${row.product.toLowerCase()}-${row.shelf.toLowerCase()}`
          )
      );
      const seen = new Set<string>();
      const finalRows = uniqueRows.filter((row) => {
        const key = `${row.product.toLowerCase()}-${row.shelf.toLowerCase()}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      finalRows.forEach((row) => {
        const productId = productMap.get(row.product.toLowerCase());
        const shelfId = shelfMap.get(row.shelf.toLowerCase());
        if (productId && shelfId) {
          append({ productId, shelfId, quantity: Number(row.quantity) || 1 });
        }
      });
    };
    if (warehouseChanged) {
      setTimeout(mapAndAppendItems, 100);
    } else {
      mapAndAppendItems();
    }
  };
  const selectedWarehouse = warehouses?.find(
    (w) => w.id === form.watch("warehouseId")
  );
  const selectedWarehouseName = selectedWarehouse?.name || "Items";

  // Download Excel template for StockIn items
  const handleDownloadTemplate = () => {
    if (!selectedWarehouse) return;
    const excelBuffer = generateStockInTemplate(
      selectedWarehouseName,
      Array.isArray(products) ? products : [],
      selectedWarehouse.Shelf || []
    );
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `stockin-items-template-${selectedWarehouseName}.xlsx`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  useEffect(() => {
    const currentWarehouseId = form.watch("warehouseId");
    if (
      prevWarehouseId.current !== undefined && // skip on first render
      prevWarehouseId.current !== currentWarehouseId
    ) {
      form.setValue(
        "items",
        form.getValues("items").map((item) => ({ ...item, shelfId: "" }))
      );
    }
    prevWarehouseId.current = currentWarehouseId;
  }, [form.watch("warehouseId")]);

  return (
    <Form {...form} key={forceRerender}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* StockIn Name */}
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Date")}*</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    className="neon-input transition-shadow duration-300"
                    value={
                      field.value
                        ? new Date(field.value).toISOString().split("T")[0]
                        : ""
                    }
                    onChange={(e) => {
                      const value = e.target.value;
                      field.onChange(value ? new Date(value) : undefined);
                    }}
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Country - Updated to use Select component */}
          <FormField
            control={form.control}
            name="warehouseId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Warehouse")}</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  dir={t("dir") as "rtl" | "ltr"}
                >
                  <FormControl>
                    <SelectTrigger className="neon-input transition-shadow duration-300">
                      <SelectValue placeholder={t("Select a warehouse")} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {warehouses?.map((warehouse) => (
                      <SelectItem key={warehouse.id} value={warehouse.id}>
                        {warehouse.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <div>
            <div className="space-y-2">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold">{t("StockIn Items")}</span>
                <div className="flex gap-2">
                  {/* Split Button: Add StockIn Item */}
                  <div className="relative flex">
                    <Button
                      type="button"
                      size="sm"
                      className="rounded-r-none bg-green-600 text-white hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 dark:text-white"
                      onClick={() =>
                        append({ productId: "", shelfId: "", quantity: 0 })
                      }
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
                          disabled={!selectedWarehouse}
                          className={`hover:bg-green-50 dark:hover:bg-green-900 text-green-700 dark:text-green-400 ${
                            !selectedWarehouse
                              ? "opacity-50 cursor-not-allowed"
                              : ""
                          }`}
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
            </div>
          </div>
        </div>
        <div className="w-full">
          {fields.map((itemField, idx) => (
            <StockInItemRow
              key={itemField.id}
              idx={idx}
              field={itemField}
              form={form}
              products={Array.isArray(products) ? products : []}
              shelves={
                warehouses?.find((w) => w.id === form.watch("warehouseId"))
                  ?.Shelf || []
              }
              remove={remove}
              t={t}
            />
          ))}
        </div>
        <div className="flex justify-end space-x-2 pt-4">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              {t("Cancel")}
            </Button>
          )}
          <Button type="submit" disabled={isPending || isUpdatePending}>
            {isPending || isUpdatePending
              ? t("Saving") + "..."
              : t("Save StockIn")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
