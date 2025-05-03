import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { FileDown, Printer, AlertTriangle } from "lucide-react";
import { reportsApi } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { useInventoryReports } from "@/lib/reports-service";
import { useTranslations } from "next-intl";
import { useSystem } from "@/providers/SystemProvider";

export default function InventoryReports() {
  const { storeCurrency } = useSystem();
  const t = useTranslations();
  const [showLowStock, setShowLowStock] = useState(false);

  // Fetch inventory report data
  const { data, isLoading, isError, error } = useInventoryReports(showLowStock);

  useEffect(() => {
    if (isError) {
      console.error("Error fetching inventory report:", error);
    }
  }, [isError, error]);

  // Handle export
  const handleExport = async () => {
    try {
      const blob = await reportsApi.exportReport("inventory", "csv", {
        lowStockOnly: showLowStock,
      });

      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `inventory-report-${
        new Date().toISOString().split("T")[0]
      }.csv`;
      document.body.appendChild(a);
      a.click();

      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error exporting report:", error);
    }
  };

  const getStockStatus = (current: number, threshold: number) => {
    if (current <= 0)
      return { label: t("Out of Stock"), variant: "destructive" };
    if (current <= threshold)
      return { label: t("Low Stock"), variant: "warning" };
    return { label: t("In Stock"), variant: "success" };
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div>
              <CardTitle>{t("Inventory Report")}</CardTitle>
              <CardDescription>
                {t("Manage and track your inventory")}
              </CardDescription>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                variant={showLowStock ? "default" : "outline"}
                onClick={() => setShowLowStock(!showLowStock)}
                className="gap-2"
              >
                <AlertTriangle className="h-4 w-4" />
                {showLowStock
                  ? t("Showing Low Stock Only")
                  : t("Show Low Stock Only")}
              </Button>

              <div className="flex gap-2">
                <Button variant="outline" size="icon" onClick={handleExport}>
                  <FileDown className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <Printer className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <p>{t("Loading inventory data")}...</p>
            </div>
          ) : data ? (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="text-sm text-muted-foreground">
                      {t("Total Products")}
                    </div>
                    <div className="text-2xl font-bold">
                      {data.totalProducts || 0}
                    </div>
                  </CardContent>
                </Card>

                <Card dir={t("dir") as "rtl" | "ltr"}>
                  <CardContent className="p-6">
                    <div className="text-sm text-muted-foreground">
                      {t("Low Stock Items")}
                    </div>
                    <div className="text-2xl font-bold">
                      {data.lowStockCount || 0}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="text-sm text-muted-foreground">
                      {t("Out of Stock Items")}
                    </div>
                    <div className="text-2xl font-bold">
                      {data.outOfStockCount || 0}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div>
                <h3 className="font-medium mb-4">{t("Inventory Status")}</h3>
                <Table dir={t("dir") as "rtl" | "ltr"}>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="rtl:text-start">
                        {t("Product")}
                      </TableHead>
                      <TableHead className="rtl:text-start">
                        {t("SKU")}
                      </TableHead>
                      <TableHead className="rtl:text-start">
                        {t("Category")}
                      </TableHead>
                      <TableHead className="rtl:text-start">
                        {t("Current Stock")}
                      </TableHead>
                      <TableHead className="rtl:text-start">
                        {t("Status")}
                      </TableHead>
                      <TableHead className="rtl:text-start">
                        {t("Restock Value")}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.products?.map((product) => {
                      const status = getStockStatus(
                        product.stock,
                        product.lowStockThreshold
                      );
                      return (
                        <TableRow key={product.id}>
                          <TableCell className="font-medium">
                            {product.name}
                          </TableCell>
                          <TableCell>{product.sku}</TableCell>
                          <TableCell>{product.category}</TableCell>
                          <TableCell>{product.stock}</TableCell>
                          <TableCell>
                            <Badge variant={status.variant as any}>
                              {status.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {storeCurrency}
                            {(
                              product.cost *
                              Math.max(
                                product.lowStockThreshold - product.stock,
                                0
                              )
                            ).toFixed(2)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              <div>
                <h3 className="font-medium mb-4">{t("Inventory Value")}</h3>
                <Table dir={t("dir") as "rtl" | "ltr"}>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="rtl:text-start">
                        {t("Category")}
                      </TableHead>
                      <TableHead className="rtl:text-start">
                        {t("Product Count")}
                      </TableHead>
                      <TableHead className="rtl:text-start">
                        {t("Total Stock")}
                      </TableHead>
                      <TableHead className="rtl:text-start">
                        {t("Cost Value")}
                      </TableHead>
                      <TableHead className="rtl:text-start">
                        {t("Retail Value")}
                      </TableHead>
                      <TableHead className="rtl:text-start">
                        {t("Potential Profit")}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.inventoryByCategory?.map((category) => (
                      <TableRow key={category.name}>
                        <TableCell className="font-medium">
                          {category.name}
                        </TableCell>
                        <TableCell>{category.productCount}</TableCell>
                        <TableCell>{category.totalStock}</TableCell>
                        <TableCell>
                          {storeCurrency} {category.costValue.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          {storeCurrency} {category.retailValue.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          {storeCurrency} {category.potentialProfit.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          ) : (
            <>
              <pre>{data}</pre>
              <div className="flex justify-center items-center h-40">
                <p>{t("No inventory data available")}</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
