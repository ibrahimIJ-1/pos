import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCreateProduct, useUpdateProduct } from "@/lib/pos-service";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { NumberInput } from "@/components/ui/number-input";
import { ImagePlus, Upload } from "lucide-react";
import { Product } from "@prisma/client";
import Decimal from "decimal.js";

const productFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  description: z.string().optional(),
  sku: z.string().min(1, "SKU is required."),
  barcode: z.string().optional(),
  price: z.number().min(0, "Price cannot be negative."),
  cost: z.number().min(0, "Cost cannot be negative."),
  category: z.string().optional(),
  taxRate: z.number().min(0, "Tax rate cannot be negative."),
  stock: z.number().int().min(0, "Stock cannot be negative."),
  low_stock_threshold: z.number().int().min(0, "Threshold cannot be negative."),
  image_url: z.string().optional(),
  active: z.boolean().default(true),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

interface ProductFormProps {
  product?: Product;
  onSuccess: () => void;
  mode: "create" | "edit";
}

export function ProductForm({ product, onSuccess, mode }: ProductFormProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(
    product?.image_url || null
  );

  const createProductMutation = useCreateProduct();
  const updateProductMutation = useUpdateProduct();

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: product
      ? {
          name: product.name,
          description: product.description || "",
          sku: product.sku,
          barcode: product.barcode || "",
          price: Number(product.price),
          cost: Number(product.cost || 0),
          category: product.category || "",
          taxRate: Number(product.taxRate),
          stock: product.stock,
          low_stock_threshold: product.low_stock_threshold || 0,
          image_url: product.image_url || "",
          active: product.active,
        }
      : {
          name: "",
          description: "",
          sku: "",
          barcode: "",
          price: 0,
          cost: 0,
          category: "",
          taxRate: 0,
          stock: 0,
          low_stock_threshold: 0,
          image_url: "",
          active: true,
        },
  });

  // In a real application, this would upload to a server
  // For now, we'll just use a placeholder or the provided URL
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app, this would upload to a server
      // Here we'll just create a local data URL as a demo
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setImagePreview(result);
        form.setValue("image_url", result);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = (data: ProductFormValues) => {

    if (mode === "create") {
      createProductMutation.mutate(
        {
          name: data.name,
          description: data.description ?? "",
          sku: data.sku,
          barcode: data.barcode ?? "",
          price: data.price ?? 0,
          cost: data.cost ?? 0,
          category: data.category || "",
          taxRate: data.taxRate ?? 0,
          stock: data.stock,
          low_stock_threshold: data.low_stock_threshold,
          image_url: data.image_url ?? "",
          active: data.active,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          onSuccess: onSuccess,
        }
      );
    } else if (mode === "edit" && product) {
      
      updateProductMutation.mutate(
        {
          id: product.id,
          ...data,
        },
        {
          onSuccess: onSuccess,
        }
      );
    }
  };

  const categoryOptions = [
    "Beverages",
    "Bakery",
    "Meat & Seafood",
    "Produce",
    "Dairy & Alternatives",
    "Snacks",
    "Canned Goods",
    "Frozen Foods",
    "Electronics",
    "Clothing",
    "Health & Beauty",
    "Home & Kitchen",
    "Other",
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
        <div className="flex flex-col items-center justify-center">
          <div className="relative h-32 w-32 mb-4 bg-muted rounded-md overflow-hidden">
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Product preview"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                <ImagePlus className="h-10 w-10" />
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Input
              id="image-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById("image-upload")?.click()}
              className="gap-2"
            >
              <Upload className="h-4 w-4" />
              Upload Image
            </Button>
          </div>
        </div>

        <Separator />

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="sku"
            render={({ field }) => (
              <FormItem>
                <FormLabel>SKU</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="barcode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Barcode (optional)</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="price"
            render={({ field: { onChange, ...rest } }) => (
              <FormItem>
                <FormLabel>Price ($)</FormLabel>
                <FormControl>
                  <NumberInput
                    min={0}
                    step={0.01}
                    max={1000000}
                    onChange={onChange}
                    {...rest}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="cost"
            render={({ field: { onChange, ...rest } }) => (
              <FormItem>
                <FormLabel>Cost ($)</FormLabel>
                <FormControl>
                  <NumberInput
                    min={0}
                    step={0.01}
                    max={1000000}
                    onChange={onChange}
                    {...rest}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categoryOptions.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
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
          name="taxRate"
          render={({ field: { onChange, ...rest } }) => (
            <FormItem>
              <FormLabel>Tax Rate</FormLabel>
              <FormControl>
                <NumberInput
                  min={0}
                  step={0.01}
                  max={1}
                  onChange={onChange}
                  {...rest}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="stock"
            render={({ field: { onChange, ...rest } }) => (
              <FormItem>
                <FormLabel>Current Stock</FormLabel>
                <FormControl>
                  <NumberInput min={0} step={1} onChange={onChange} {...rest} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="low_stock_threshold"
            render={({ field: { onChange, ...rest } }) => (
              <FormItem>
                <FormLabel>Low Stock Threshold</FormLabel>
                <FormControl>
                  <NumberInput min={0} step={1} onChange={onChange} {...rest} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="active"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <FormLabel>Active</FormLabel>
                <div className="text-sm text-muted-foreground">
                  Product will be available for sale
                </div>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full"
          disabled={
            createProductMutation.isPending || updateProductMutation.isPending
          }
        >
          {mode === "create" ? "Create Product" : "Update Product"}
        </Button>
      </form>
    </Form>
  );
}
