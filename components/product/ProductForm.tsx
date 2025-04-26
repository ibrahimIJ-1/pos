import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { ImagePlus, Upload, Plus } from "lucide-react";
import { Product, BranchProduct, Branch } from "@prisma/client";
import Decimal from "decimal.js";
import { useCreateProduct, useUpdateProduct } from "@/lib/products-service";
import { useTranslations } from "next-intl";

interface ProductFormProps {
  product?: Product & {
    BranchProduct?: Array<BranchProduct>;
  };
  onSuccess: () => void;
  mode: "create" | "edit";
  branches: any[];
}

export function ProductForm({
  product,
  onSuccess,
  mode,
  branches,
}: ProductFormProps) {
  const t = useTranslations();
  const productFormSchema = z.object({
    name: z.string().min(2, t("Name must be at least 2 characters") + "."),
    description: z.string().optional(),
    sku: z.string().min(1, t("SKU is required") + "."),
    barcode: z.string().optional(),
    category: z.string().optional(),
    image_url: z.string().optional(),
    image_file: z
      .instanceof(File)
      .optional()
      .refine(
        (file) => file?.size ?? 0 < 0.15 * 1024 * 1024,
        t("File size must be under 150KB")
      ),
    branches: z
      .array(
        z.object({
          branchId: z.string().min(1, t("Branch is required")),
          price: z.number().min(0, t("Price cannot be negative") + "."),
          cost: z.number().min(0, t("Cost cannot be negative") + "."),
          taxRate: z
            .number()
            .min(0, t("Tax rate cannot be negative") + ".")
            .max(999.99, t("Tax rate cannot exceed") + " 999.99%"),
          stock: z
            .number()
            .int()
            .min(0, t("Stock cannot be negative") + "."),
          low_stock_threshold: z
            .number()
            .int()
            .min(0, t("Threshold cannot be negative") + "."),
          isActive: z.boolean().default(true),
        })
      )
      .min(1, t("At least one branch product is required") + ""),
  });

  type ProductFormValues = z.infer<typeof productFormSchema>;
  const [imagePreview, setImagePreview] = useState<string | null>(
    product?.image_url || null
  );

  const createProductMutation = useCreateProduct();
  const updateProductMutation = useUpdateProduct();

  const { control, handleSubmit, formState, watch, ...form } =
    useForm<ProductFormValues>({
      resolver: zodResolver(productFormSchema),
      defaultValues: product
        ? {
            name: product.name,
            description: product.description || "",
            sku: product.sku,
            barcode: product.barcode || "",
            category: product.category || "",
            image_url: product.image_url || "",
            branches: product.BranchProduct?.map((bp) => ({
              branchId: bp.branchId,
              price: Number(bp.price),
              cost: Number(bp.cost),
              taxRate: Number(bp.taxRate),
              stock: bp.stock,
              low_stock_threshold: bp.low_stock_threshold,
              isActive: bp.isActive,
            })),
          }
        : {
            name: "",
            description: "",
            sku: "",
            barcode: "",
            category: "",
            image_url: "",
            branches: [],
          },
    });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "branches",
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue("image_file", file);
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
    const formattedData = {
      ...data,
      branches: data.branches.map((bp) => ({
        ...bp,
        price: bp.price,
        cost: bp.cost,
        taxRate: bp.taxRate,
      })),
    };

    if (mode === "create") {
      createProductMutation.mutate(formattedData, { onSuccess });
    } else if (mode === "edit" && product) {
      updateProductMutation.mutate(
        { id: product.id, ...formattedData },
        { onSuccess }
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
    <Form {...{ control, handleSubmit, formState, watch, ...form }}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">
        {/* Image Upload Section (Same as before) */}
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
              {t("Upload Image")}
            </Button>
          </div>
        </div>

        <Separator />

        {/* Product Core Fields */}
        <FormField
          control={control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("Name")}</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("Description")}</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={control}
            name="sku"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("SKU")}</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="barcode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t("Barcode")} ({t("optional")})
                </FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Branch Products Section */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold">
              {t("Branch Availability")}
            </h3>
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                append({
                  branchId: "",
                  price: 0,
                  cost: 0,
                  taxRate: 0,
                  stock: 0,
                  low_stock_threshold: 0,
                  isActive: true,
                })
              }
            >
              <Plus className="h-4 w-4 mr-2" />
              {t("Add Branch")}
            </Button>
          </div>

          {fields.map((field, index) => {
            const currentBranchId = watch(`branches.${index}.branchId`);
            const selectedBranches = watch("branches").map((bp) => bp.branchId);
            const availableBranches = branches.filter(
              (branch) =>
                branch.id === currentBranchId ||
                !selectedBranches.includes(branch.id)
            );

            return (
              <div key={field.id} className="space-y-4 p-4 border rounded-lg">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">{t("Branch Details")}</h4>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => remove(index)}
                    disabled={fields.length === 1}
                  >
                    {t("Remove")}
                  </Button>
                </div>

                <FormField
                  control={control}
                  name={`branches.${index}.branchId`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("Branch")}</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        dir={t("dir") as "rtl" | "ltr"}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t("Select branch")} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {availableBranches.map((branch) => (
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

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={control}
                    name={`branches.${index}.price`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("Price")} ($)</FormLabel>
                        <FormControl>
                          <NumberInput
                            min={0}
                            step={0.01}
                            value={field.value}
                            onValueChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name={`branches.${index}.cost`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("Cost")} ($)</FormLabel>
                        <FormControl>
                          <NumberInput
                            min={0}
                            step={0.01}
                            value={field.value}
                            onValueChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name={`branches.${index}.taxRate`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("Tax Rate")} (%)</FormLabel>
                        <FormControl>
                          <NumberInput
                            min={0}
                            step={0.01}
                            max={999.99}
                            value={field.value}
                            onValueChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name={`branches.${index}.stock`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("Current Stock")}</FormLabel>
                        <FormControl>
                          <NumberInput
                            min={0}
                            step={1}
                            value={field.value}
                            onValueChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name={`branches.${index}.low_stock_threshold`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("Low Stock Threshold")}</FormLabel>
                        <FormControl>
                          <NumberInput
                            min={0}
                            step={1}
                            value={field.value}
                            onValueChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name={`branches.${index}.isActive`}
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between px-3">
                        {/* <div className="space-y-0.5"> */}
                        <FormLabel>{t("Active")}</FormLabel>
                        {/* <div className="text-sm text-muted-foreground">
                            Available at this branch
                          </div> */}
                        {/* </div> */}
                        <FormControl>
                          <Switch
                            dir={t("dir") as "rtl" | "ltr"}
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <FormField
          control={control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("Category")}</FormLabel>
              <Select onValueChange={field.onChange} value={field.value} dir={t("dir") as "rtl" | "ltr"}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t("Select category")} />
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

        {/* <FormField
          control={control}
          name="active"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <FormLabel>Active</FormLabel>
                <div className="text-sm text-muted-foreground">
                  Product will be visible in system
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
        /> */}

        <Button
          type="submit"
          className="w-full"
          disabled={
            createProductMutation.isPending || updateProductMutation.isPending
          }
        >
          {mode === "create" ? t("Create Product") : t("Update Product")}
        </Button>
      </form>
    </Form>
  );
}
