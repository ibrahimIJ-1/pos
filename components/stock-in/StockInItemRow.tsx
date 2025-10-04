import React from "react";
import {
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface StockInItemRowProps {
  idx: number;
  field: any;
  form: any;
  products: any[];
  shelves: any[];
  remove: (idx: number) => void;
  t: (key: string) => string;
}

export const StockInItemRow: React.FC<StockInItemRowProps> = ({
  idx,
  field,
  form,
  products,
  shelves,
  remove,
  t,
}) => (
  <div className="flex w-full gap-2 items-center">
    {/* Product Dropdown */}
    <FormField
      control={form.control}
      name={`items.${idx}.productId`}
      render={({ field }) => (
        <FormItem className="flex-1">
          <FormControl>
            <Select
              value={field.value}
              onValueChange={field.onChange}
              dir={t("dir") as "rtl" | "ltr"}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("Select Product")} />
              </SelectTrigger>
              <SelectContent>
                {products.map((product: any) => (
                  <SelectItem key={product.id} value={product.id}>
                    {product.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
    {/* Shelf Dropdown */}
    <FormField
      control={form.control}
      name={`items.${idx}.shelfId`}
      render={({ field }) => (
        <FormItem className="flex-1">
          <FormControl>
            <Select
              value={field.value}
              onValueChange={field.onChange}
              dir={t("dir") as "rtl" | "ltr"}
              disabled={!form.watch("warehouseId")}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("Select Shelf")} />
              </SelectTrigger>
              <SelectContent>
                {shelves.map((shelf: any) => (
                  <SelectItem key={shelf.id} value={shelf.id}>
                    {shelf.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
    {/* Quantity Input */}
    <FormField
      control={form.control}
      name={`items.${idx}.quantity`}
      render={({ field }) => (
        <FormItem className="w-24">
          <FormControl>
            <Input
              type="number"
              min={1}
              placeholder={t("Quantity")}
              {...field}
              onChange={(e) =>
                field.onChange(
                  e.target.value === "" ? "" : Number(e.target.value)
                )
              }
            />
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
);
