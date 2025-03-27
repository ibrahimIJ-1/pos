"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useCreateDiscount,
  useUpdateDiscount,
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
import {
  Discount,
  DiscountAppliesTo,
  DiscountType,
  Product,
} from "@prisma/client";
import Decimal from "decimal.js";

const discountSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters" }),
  code: z.string().optional(),
  type: z.enum(["PERCENTAGE", "FIXED", "BUY_X_GET_Y"]),
  value: z.coerce
    .number()
    .min(0, { message: "Value must be positive" })
    .refine((val) => val <= 100 || val === 0, {
      message: "Percentage cannot exceed 100%",
      path: ["value"],
    }),
  minPurchaseAmount: z.coerce.number().optional(),
  appliesTo: z.enum([
    "ENTIRE_ORDER",
    "SPECIFIC_PRODUCTS",
    "SPECIFIC_CATEGORIES",
  ]),
  productIds: z.array(z.string()).optional(),
  categoryIds: z.array(z.string()).optional(),
  buyXQuantity: z.coerce.number().optional(),
  getYQuantity: z.coerce.number().optional(),
  startDate: z.date(),
  endDate: z.date().optional(),
  maxUses: z.coerce.number().optional(),
  isActive: z.boolean(),
});

type DiscountFormValues = z.infer<typeof discountSchema>;

interface DiscountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  discount?: Discount;
}

export function DiscountDialog({
  open,
  onOpenChange,
  mode,
  discount,
}: DiscountDialogProps) {
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
    },
  });

  useEffect(() => {
    if (open && mode === "edit" && discount) {
      console.log(discount);

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
          (discount as any).products?.map((product: Partial<Product>) => product.id) ||
          [],
        categoryIds: discount.categoryIds?.split(",") || [],
        buyXQuantity: discount.buyXQuantity ?? undefined,
        getYQuantity: discount.getYQuantity ?? undefined,
        startDate: new Date(discount.startDate),
        endDate: discount.endDate ? new Date(discount.endDate) : undefined,
        maxUses: discount.maxUses ?? undefined,
        isActive: discount.isActive,
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
          productIds: values.appliesTo === "SPECIFIC_PRODUCTS"
            ? values.productIds ? values.productIds : null
            : null,
          categoryIds: values.appliesTo === "SPECIFIC_CATEGORIES"
            ? (values.categoryIds ? values.categoryIds.join(",") : null)
            : null,
          buyXQuantity: values.type === "BUY_X_GET_Y" ? values.buyXQuantity ?? null : null,
          getYQuantity: values.type === "BUY_X_GET_Y" ? values.getYQuantity ?? null : null,
          startDate: values.startDate,
          endDate: values.endDate ?? null,
          maxUses: values.maxUses ?? null,
          isActive: values.isActive,
          id: "",
          currentUses: 0,
          created_at: new Date(),
          updated_at: new Date()
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
      products.map((product) => product.category ?? "").filter(Boolean)
    ),
  ];
  const uniqueCategories = [...new Set(categories)];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Create Discount" : "Edit Discount"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <ScrollArea className="h-[60vh] pr-4">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Summer Sale 20% Off" {...field} />
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
                      <FormLabel>Code (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="SUMMER20" {...field} />
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
                        <FormLabel>Discount Type</FormLabel>
                        <Select
                          onValueChange={handleTypeChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="PERCENTAGE">
                              Percentage
                            </SelectItem>
                            <SelectItem value="FIXED">Fixed Amount</SelectItem>
                            <SelectItem value="BUY_X_GET_Y">
                              Buy X Get Y Free
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
                            ? "Percentage (%)"
                            : form.watch("type") === "FIXED"
                            ? "Amount ($)"
                            : "Discount % on Y items"}
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
                          <FormLabel>Buy Quantity (X)</FormLabel>
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
                          <FormLabel>Get Free Quantity (Y)</FormLabel>
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
                      <FormLabel>Minimum Purchase Amount (Optional)</FormLabel>
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
                  name="appliesTo"
                  render={() => (
                    <FormItem>
                      <FormLabel>Applies To</FormLabel>
                      <Tabs
                        value={selectedAppliesTo}
                        onValueChange={handleAppliesChange}
                        className="w-full"
                      >
                        <TabsList className="grid grid-cols-3 w-full">
                          <TabsTrigger value="ENTIRE_ORDER">
                            Entire Order
                          </TabsTrigger>
                          <TabsTrigger
                            value="SPECIFIC_PRODUCTS"
                            disabled={form.watch("type") === "BUY_X_GET_Y"}
                          >
                            Products
                          </TabsTrigger>
                          <TabsTrigger
                            value="SPECIFIC_CATEGORIES"
                            disabled={form.watch("type") === "BUY_X_GET_Y"}
                          >
                            Categories
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
                        <FormLabel>Select Products</FormLabel>
                        <div className="border rounded-md p-2 max-h-40 overflow-y-auto space-y-2">
                          {products.map((product) => (
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
                                {product.name} - ${product.price.toFixed(2)}
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
                        <FormLabel>Categories</FormLabel>
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
                        <FormLabel>Start Date</FormLabel>
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
                        <FormLabel>End Date (Optional)</FormLabel>
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
                      <FormLabel>Maximum Uses (Optional)</FormLabel>
                      <FormControl>
                        <NumberInput
                          min={0}
                          step={1}
                          placeholder="No limit"
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
                        <FormLabel className="text-base">Active</FormLabel>
                        <p className="text-sm text-muted-foreground">
                          Make this discount active and available for use
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
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createDiscount.isPending || updateDiscount.isPending}
              >
                {mode === "create"
                  ? createDiscount.isPending
                    ? "Creating..."
                    : "Create Discount"
                  : updateDiscount.isPending
                  ? "Updating..."
                  : "Update Discount"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
