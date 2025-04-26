import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Edit,
  Barcode,
  DollarSign,
  ShoppingCart,
  AlertTriangle,
  Store,
} from "lucide-react";
import { Product, BranchProduct, Branch } from "@prisma/client";
import { useTranslations } from "next-intl";

interface ProductDetailsProps {
  product: Product & {
    BranchProduct: Array<BranchProduct & { branch: Branch }>;
  };
  onEdit: () => void;
}

export function ProductDetails({ product, onEdit }: ProductDetailsProps) {
  const t = useTranslations();
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const calculateProfitMargin = (price: number, cost: number) => {
    if (!cost || cost === 0) return "N/A";
    const margin = ((price - cost) / price) * 100;
    return `${margin.toFixed(1)}%`;
  };

  return (
    <ScrollArea className="h-[calc(100vh-10rem)] ltr:pr-4 rtl:pl-4">
      <div className="space-y-6 py-4 rtl:flex-row-reverse rtl:text-end">
        <div className="flex justify-between items-start rtl:flex-row-reverse rtl:text-start">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold">{product.name}</h2>
            <p className="text-sm text-muted-foreground rtl:text-end">SKU: {product.sku}</p>
          </div>
          <Button onClick={onEdit} size="sm" className="gap-2">
            <Edit className="h-4 w-4" />
            {t("Edit")}
          </Button>
        </div>

        <div className="aspect-video bg-muted rounded-md overflow-hidden">
          <img
            src={product.image_url || "/placeholder.svg"}
            alt={product.name}
            className="object-contain w-full h-full"
          />
        </div>

        {product.description && (
          <div>
            <h3 className="font-medium mb-1">{t("Description")}</h3>
            <p className="text-sm text-muted-foreground">
              {product.description}
            </p>
          </div>
        )}

        <Separator />

        {/* Branch Products Section */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">{t("Branch Availability")}</h3>

          {product.BranchProduct.map((branchProduct) => {
            const price = Number(branchProduct.price);
            const cost = Number(branchProduct.cost);
            const isLowStock =
              branchProduct.stock <= branchProduct.low_stock_threshold;

            return (
              <div
                key={branchProduct.id}
                className="space-y-4 p-4 border rounded-lg"
              >
                <div className="flex items-center gap-2 rtl:flex-row-reverse">
                  <Store className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <h4 className="font-medium">{branchProduct.branch.name}</h4>
                    {branchProduct.branch.address && (
                      <p className="text-sm text-muted-foreground">
                        {branchProduct.branch.address}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium">{t("Price")}</h3>
                    <p className="flex items-center gap-1 text-base font-semibold rtl:flex-row-reverse">
                      <DollarSign className="h-4 w-4 text-green-500" />
                      {price.toFixed(2)}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-sm font-medium">{t("Cost")}</h3>
                    <p className="flex items-center gap-1 text-base rtl:flex-row-reverse">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      {cost.toFixed(2)}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-sm font-medium">
                      {t("Profit Margin")}
                    </h3>
                    <p className="text-base">
                      {calculateProfitMargin(price, cost)}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-sm font-medium">{t("Tax Rate")}</h3>
                    <p className="text-base">
                      {(Number(branchProduct.taxRate) * 100).toFixed(1)}%
                    </p>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-sm font-medium">
                      {t("Current Stock")}
                    </h3>
                    <p className="flex items-center gap-1 text-base rtl:flex-row-reverse">
                      {/* <ShoppingCart className="h-4 w-4 text-muted-foreground" /> */}
                      {branchProduct.stock} {t("units")}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-sm font-medium">
                      {t("Low Stock Threshold")}
                    </h3>
                    <p className="text-base">
                      {branchProduct.low_stock_threshold} {t("units")}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium">{t("Status")}</h3>
                    <div
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        branchProduct.isActive
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                          : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                      }`}
                    >
                      {branchProduct.isActive ? "Active" : "Inactive"}
                    </div>
                  </div>

                  {isLowStock && (
                    <div className="flex items-center gap-1 text-destructive text-sm rtl:flex-row-reverse">
                      <AlertTriangle className="h-4 w-4" />
                      {t("Low Stock")}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <Separator />

        {/* Product Metadata */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1 rtl:text-end">
            <h3 className="text-sm font-medium">{t("Category")}</h3>
            <p className="text-base">{product.category || "Uncategorized"}</p>
          </div>

          {product.barcode && (
            <div className="space-y-1 rtl:text-end">
              <h3 className="text-sm font-medium">{t("Barcode")}</h3>
              <p className="flex items-center gap-1 text-base rtl:flex-row-reverse">
                <Barcode className="h-4 w-4 text-muted-foreground" />
                {product.barcode}
              </p>
            </div>
          )}
        </div>

        {/* <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <h3 className="text-sm font-medium">Created</h3>
            <p className="text-sm text-muted-foreground">
              {product.created_at.toString()}
            </p>
          </div>

          <div className="space-y-1">
            <h3 className="text-sm font-medium">Last Updated</h3>
            <p className="text-sm text-muted-foreground">
              {product.updated_at.toString()}
            </p>
          </div>
        </div> */}

        {/* <div className="space-y-1">
          <h3 className="text-sm font-medium">Global Status</h3>
          <div
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              product.active
                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
            }`}
          >
            {product.active ? "Active" : "Inactive"}
          </div>
        </div> */}
      </div>
    </ScrollArea>
  );
}
