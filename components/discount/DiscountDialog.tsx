"use client";

import React, { useState, useEffect } from "react";
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
import {
  Branch,
  Discount,
  DiscountAppliesTo,
  DiscountType,
  Product,
} from "@prisma/client";
import { useProducts } from "@/lib/products-service";
import { useCreateDiscount, useUpdateDiscount } from "@/lib/discounts-service";
import { useTranslations } from "next-intl";
import { discountFormSchema } from "./DiscountForm";
import { useSystem } from "@/providers/SystemProvider";

type DiscountFormValues = z.infer<ReturnType<typeof discountFormSchema>>;

interface DiscountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  discount?: Discount & { branches?: Branch[] };
  branches: Branch[];
}

export function DiscountDialog({
  open,
  onOpenChange,
  mode,
  discount,
  branches,
}: DiscountDialogProps) {
  const { storeCurrency } = useSystem();
  const t = useTranslations();
  const discountSchema = discountFormSchema();
  const [selectedAppliesTo, setSelectedAppliesTo] =
    useState<DiscountAppliesTo>("ENTIRE_ORDER");
  const { data: products = [] } = useProducts();
  const createDiscount = useCreateDiscount();
  const updateDiscount = useUpdateDiscount();

  const form = useForm<DiscountFormValues>({
    resolver: zodResolver(discountSchema),
    defaultValues: {
      name: "",
      code: "",
      type: DiscountType.PERCENTAGE,
      value: 0,
      minPurchaseAmount: undefined,
      appliesTo: "ENTIRE_ORDER",
      productIds: [],
      categoryIds: [],
      buyXQuantity: undefined,
      getYQuantity: undefined,
      startDate: new Date(),
      endDate: undefined,
      maxUses: undefined,
      isActive: true,
      branches: [],
    },
  });

  useEffect(() => {
    if (open && mode === "edit" && discount) {
      form.reset({
        name: discount.name,
        code: discount.code || "",
        type: discount.type,
        value: parseFloat(discount.value.toString()),
        minPurchaseAmount: discount.minPurchaseAmount
          ? parseFloat(discount.minPurchaseAmount.toString())
          : 0,
        appliesTo: discount.appliesTo,
        productIds:
          (discount as any).products?.map(
            (product: Partial<Product>) => product.id
          ) || [],
        categoryIds: discount.categoryIds?.split(",") || [],
        buyXQuantity: discount.buyXQuantity ?? undefined,
        getYQuantity: discount.getYQuantity ?? undefined,
        startDate: new Date(discount.startDate),
        endDate: discount.endDate ? new Date(discount.endDate) : undefined,
        maxUses: discount.maxUses ?? undefined,
        isActive: discount.isActive,
        branches: discount.branches?.map((b) => b.id) || [],
      });
      setSelectedAppliesTo(discount.appliesTo);
    } else if (open && mode === "create") {
      form.reset({
        name: "",
        code: "",
        type: "PERCENTAGE",
        value: 0,
        minPurchaseAmount: undefined,
        appliesTo: "ENTIRE_ORDER",
        productIds: [],
        categoryIds: [],
        buyXQuantity: undefined,
        getYQuantity: undefined,
        startDate: new Date(),
        endDate: undefined,
        maxUses: undefined,
        isActive: true,
        branches: [],
      });
      setSelectedAppliesTo("ENTIRE_ORDER");
    }
  }, [open, mode, discount, form]);

  const handleAppliesChange = (value: string) => {
    setSelectedAppliesTo(value as DiscountAppliesTo);
    form.setValue("appliesTo", value as DiscountAppliesTo);
  };

  const handleTypeChange = (value: string) => {
    form.setValue("type", value as DiscountType);
    if (value === "BUY_X_GET_Y") {
      form.setValue("buyXQuantity", 2);
      form.setValue("getYQuantity", 1);
      form.setValue("value", 100); // 100% off for the free items
      form.setValue("appliesTo", "SPECIFIC_PRODUCTS");
      setSelectedAppliesTo("SPECIFIC_PRODUCTS");
    }
  };

  const onSubmit = (values: DiscountFormValues) => {
    if (mode === "create") {
      createDiscount.mutate(
        {
          name: values.name,
          code: values.code ?? "",
          type: DiscountType.FIXED,
          value: values.value as any,
          minPurchaseAmount: values.minPurchaseAmount || 0,
          appliesTo: values.appliesTo,
          productIds:
            values.appliesTo === "SPECIFIC_PRODUCTS"
              ? values.productIds
                ? values.productIds
                : null
              : null,
          categoryIds:
            values.appliesTo === "SPECIFIC_CATEGORIES"
              ? values.categoryIds
                ? values.categoryIds.join(",")
                : null
              : null,
          buyXQuantity:
            values.type === "BUY_X_GET_Y" ? values.buyXQuantity ?? null : null,
          getYQuantity:
            values.type === "BUY_X_GET_Y" ? values.getYQuantity ?? null : null,
          startDate: values.startDate,
          endDate: values.endDate ?? null,
          maxUses: values.maxUses ?? null,
          isActive: values.isActive,
          id: "",
          currentUses: 0,
          created_at: new Date(),
          updated_at: new Date(),
          branches: values.branches,
        },
        {
          onSuccess: () => {
            onOpenChange(false);
          },
        }
      );
    } else if (mode === "edit" && discount) {
      updateDiscount.mutate(
        {
          id: discount.id,
          name: values.name,
          code: values.code,
          type: values.type,
          value: values.value as any,
          minPurchaseAmount: values.minPurchaseAmount || 0,
          appliesTo: values.appliesTo,
          productIds:
            values.appliesTo === "SPECIFIC_PRODUCTS" ? values.productIds : null,
          categoryIds:
            values.appliesTo === "SPECIFIC_CATEGORIES"
              ? values.categoryIds?.join(",")
              : null,
          buyXQuantity:
            values.type === "BUY_X_GET_Y" ? values.buyXQuantity : undefined,
          getYQuantity:
            values.type === "BUY_X_GET_Y" ? values.getYQuantity : undefined,
          startDate: values.startDate,
          endDate: values.endDate,
          maxUses: values.maxUses,
          isActive: values.isActive,
          branches: values.branches,
        },
        {
          onSuccess: () => {
            onOpenChange(false);
          },
        }
      );
    }
  };

  const categories = [
    ...new Set(
      (products as Product[])
        .map((product) => product.category ?? "")
        .filter(Boolean)
    ),
  ];
  const uniqueCategories = [...new Set(categories)];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="rtl:text-start">
            {mode === "create" ? t("Create Discount") : t("Edit Discount")}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <ScrollArea
              className="h-[60vh] ltr:pr-4 rtl:pl-4"
              dir={t("dir") as "rtl" | "ltr"}
            >
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("Name")}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t("Summer Sale 20% Off")}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t("Code")} ({t("Optional")})
                      </FormLabel>
                      <FormControl>
                        <Input placeholder={t("SUMMER20")} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("Discount Type")}</FormLabel>
                        <Select
                          onValueChange={handleTypeChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t("Select type")} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="PERCENTAGE">
                              {t("Percentage")}
                            </SelectItem>
                            <SelectItem value="FIXED">
                              {t("Fixed Amount")}
                            </SelectItem>
                            <SelectItem value="BUY_X_GET_Y">
                              {t("Buy X Get Y Free")}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="value"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {form.watch("type") === "PERCENTAGE"
                            ? t("Percentage") + " (%)"
                            : form.watch("type") === "FIXED"
                            ? t("Amount") + " (" + storeCurrency + ")"
                            : t("Discount % on Y items")}
                        </FormLabel>
                        <FormControl>
                          <NumberInput
                            min={0}
                            max={
                              form.watch("type") === "PERCENTAGE"
                                ? 100
                                : undefined
                            }
                            step={
                              form.watch("type") === "PERCENTAGE" ? 1 : 0.01
                            }
                            {...field}
                            disabled={form.watch("type") === "BUY_X_GET_Y"}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {form.watch("type") === "BUY_X_GET_Y" && (
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="buyXQuantity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("Buy Quantity")} (X)</FormLabel>
                          <FormControl>
                            <NumberInput min={1} step={1} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="getYQuantity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("Get Free Quantity")} (Y)</FormLabel>
                          <FormControl>
                            <NumberInput min={1} step={1} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                <FormField
                  control={form.control}
                  name="minPurchaseAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t("Minimum Purchase Amount")} ({t("Optional")})
                      </FormLabel>
                      <FormControl>
                        <NumberInput
                          min={0}
                          step={0.01}
                          placeholder="0.00"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="branches"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("Select Branches")}</FormLabel>
                      <div className="border rounded-md p-2 max-h-40 overflow-y-auto space-y-2">
                        {branches.map((branch) => (
                          <div
                            key={branch.id}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              id={`branch-${branch.id}`}
                              checked={field.value?.includes(branch.id)}
                              onCheckedChange={(checked) => {
                                const newValue = checked
                                  ? [...(field.value || []), branch.id]
                                  : (field.value || []).filter(
                                      (id) => id !== branch.id
                                    );
                                field.onChange(newValue);
                              }}
                            />
                            <label
                              htmlFor={`branch-${branch.id}`}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {branch.name}
                            </label>
                          </div>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="appliesTo"
                  render={() => (
                    <FormItem>
                      <FormLabel>{t("Applies To")}</FormLabel>
                      <Tabs
                        value={selectedAppliesTo}
                        onValueChange={handleAppliesChange}
                        className="w-full"
                      >
                        <TabsList className="grid grid-cols-3 w-full">
                          <TabsTrigger value="ENTIRE_ORDER">
                            {t("Entire Order")}
                          </TabsTrigger>
                          <TabsTrigger
                            value="SPECIFIC_PRODUCTS"
                            disabled={form.watch("type") === "BUY_X_GET_Y"}
                          >
                            {t("Products")}
                          </TabsTrigger>
                          <TabsTrigger
                            value="SPECIFIC_CATEGORIES"
                            disabled={form.watch("type") === "BUY_X_GET_Y"}
                          >
                            {t("Categories")}
                          </TabsTrigger>
                        </TabsList>
                      </Tabs>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {selectedAppliesTo === "SPECIFIC_PRODUCTS" && (
                  <FormField
                    control={form.control}
                    name="productIds"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("Select Products")}</FormLabel>
                        <div className="border rounded-md p-2 max-h-40 overflow-y-auto space-y-2">
                          {(products as Product[]).map((product) => (
                            <div
                              key={product.id}
                              className="flex items-center space-x-2"
                            >
                              <Checkbox
                                id={`product-${product.id}`}
                                checked={field.value?.includes(product.id)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    field.onChange([
                                      ...(field.value || []),
                                      product.id,
                                    ]);
                                  } else {
                                    field.onChange(
                                      field.value?.filter(
                                        (id) => id !== product.id
                                      ) || []
                                    );
                                  }
                                }}
                              />
                              <label
                                htmlFor={`product-${product.id}`}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                {product.name}
                                {/* {product.name} - ${product.price.toFixed(2)} */}
                              </label>
                            </div>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {selectedAppliesTo === "SPECIFIC_CATEGORIES" && (
                  <FormField
                    control={form.control}
                    name="categoryIds"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("Categories")}</FormLabel>
                        <FormControl>
                          <div className="space-y-2">
                            {uniqueCategories
                              .filter(Boolean)
                              .map((category, index) => (
                                <div
                                  key={`category-${index}`}
                                  className="flex items-center space-x-2"
                                >
                                  <Checkbox
                                    id={`category-${index}`}
                                    checked={field.value?.includes(
                                      category as string
                                    )}
                                    onCheckedChange={(checked) => {
                                      if (checked) {
                                        field.onChange([
                                          ...(field.value || []),
                                          category as string,
                                        ]);
                                      } else {
                                        field.onChange(
                                          field.value?.filter(
                                            (id) => id !== category
                                          ) || []
                                        );
                                      }
                                    }}
                                  />
                                  <label
                                    htmlFor={`category-${index}`}
                                    className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                  >
                                    {category as React.ReactNode}
                                  </label>
                                </div>
                              ))}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("Start Date")}</FormLabel>
                        <FormControl>
                          <DateInput
                            date={field.value}
                            onDateChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t("End Date")} ({t("Optional")})
                        </FormLabel>
                        <FormControl>
                          <DateInput
                            date={field.value}
                            onDateChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="maxUses"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t("Maximum Uses")} ({t("Optional")})
                      </FormLabel>
                      <FormControl>
                        <NumberInput
                          min={0}
                          step={1}
                          placeholder={t("No limit")}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          {t("Active")}
                        </FormLabel>
                        <p className="text-sm text-muted-foreground">
                          {t("Make this discount active and available for use")}
                        </p>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
                disabled={createDiscount.isPending || updateDiscount.isPending}
              >
                {mode === "create"
                  ? createDiscount.isPending
                    ? t("Creating") + "..."
                    : t("Create Discount")
                  : updateDiscount.isPending
                  ? t("Updating") + "..."
                  : t("Update Discount")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
