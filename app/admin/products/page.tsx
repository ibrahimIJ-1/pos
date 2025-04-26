"use client";

import { useState } from "react";
import {
  Plus,
  Package,
  Search,
  DownloadIcon,
  UploadIcon,
  DownloadCloudIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { toast } from "sonner";
import { ProductForm } from "@/components/product/ProductForm";
import { ProductDetails } from "@/components/product/ProductDetails";
import { Branch, BranchProduct, Product } from "@prisma/client";
import { ProductTable } from "@/components/product/ProductTable";
import {
  useDeleteProduct,
  useDownloadBarcodePdf,
  useGetProductsTemplate,
  useProducts,
  useUploadProductsTemplate,
} from "@/lib/products-service";
import { useBranches } from "@/lib/branches-service";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

export default function Products() {
  const t = useTranslations();
  const { data: products = [], isLoading } = useProducts();
  const download = useDownloadBarcodePdf();
  const { data: branches = [], isLoading: isBranchLoading } = useBranches();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<
    | (Product & {
        BranchProduct: Array<BranchProduct & { branch: Branch }>;
      })
    | null
  >(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  const deleteProductMutation = useDeleteProduct();
  const downloadTemplate = useGetProductsTemplate();
  const [file, setFile] = useState<File | null>(null);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const uploadProductsMutation = useUploadProductsTemplate();
  const filteredProducts = (
    products as (Product & {
      BranchProduct: Array<BranchProduct & { branch: Branch }>;
    })[]
  ).filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.barcode && product.barcode.includes(searchTerm)) ||
      product.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (product: Product) => {
    setProductToDelete(product);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (productToDelete) {
      deleteProductMutation.mutate(productToDelete.id, {
        onSuccess: () => {
          setIsDeleteDialogOpen(false);
          toast.success(`${productToDelete.name} ${t("deleted successfully")}`);
        },
      });
    }
  };

  const viewProduct = (product: any) => {
    setSelectedProduct(product);
    setIsDetailOpen(true);
  };

  const editProduct = (product: any) => {
    setSelectedProduct(product);
    setIsEditOpen(true);
  };

  const getTemplate = () => {
    downloadTemplate.mutate();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const openUploadTemplate = () => {
    setIsUploadDialogOpen(true);
  };

  const uploadTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error(t("Please select a file"));
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    uploadProductsMutation.mutate(formData, {
      onSuccess: () => {
        setIsUploadDialogOpen(false);
        setFile(null);
      },
    });
  };

  return (
    <div className="container max-w-7xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t("Inventory Management")}</h1>

        <div className="flex gap-2 items-center">
          <Button
            variant={"outline"}
            onClick={() => download.mutate(selectedIds)}
            disabled={download.isPending}
            className="gap-2"
          >
            <DownloadCloudIcon className="h-4 w-4" />
            {t("Get Barcodes")}
          </Button>
          <Button
            variant={"outline"}
            onClick={() => getTemplate()}
            className="gap-2"
          >
            <DownloadIcon className="h-4 w-4" />
            {t("Get Template")}
          </Button>
          <Button
            variant={"default"}
            onClick={() => openUploadTemplate()}
            className="gap-2"
          >
            <UploadIcon className="h-4 w-4" />
            {t("Excel Products")}
          </Button>
          <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            {t("Add Product")}
          </Button>
        </div>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder={t("Search by name, SKU, barcode or category") + "..."}
          className="pl-8 neon-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <p>{t("Loading products")}...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
          <Package className="h-10 w-10 mb-2" />
          <p>{t("No products found")}</p>
        </div>
      ) : (
        <ProductTable
          data={filteredProducts}
          onView={viewProduct}
          onEdit={editProduct}
          onDelete={handleDelete}
          selectedIds={selectedIds}
          setSelectedIds={setSelectedIds}
        />
      )}

      {/* Product Details Sheet */}
      <Sheet open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle className={cn("", t("dir") == "rtl" && "text-start")}>
              {t("Product Details")}
            </SheetTitle>
          </SheetHeader>
          {selectedProduct && (
            <ProductDetails
              product={selectedProduct}
              onEdit={() => {
                setIsDetailOpen(false);
                setIsEditOpen(true);
              }}
            />
          )}
        </SheetContent>
      </Sheet>

      {/* Edit Product Sheet */}
      <Sheet open={isEditOpen} onOpenChange={setIsEditOpen}>
        <SheetContent className="sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="rtl:text-start">{t("Edit Product")}</SheetTitle>
          </SheetHeader>
          {selectedProduct && (
            <ProductForm
              branches={branches}
              product={selectedProduct}
              onSuccess={() => setIsEditOpen(false)}
              mode="edit"
            />
          )}
        </SheetContent>
      </Sheet>

      {/* Create Product Sheet */}
      <Sheet open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <SheetContent className="sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{t("Add New Product")}</SheetTitle>
          </SheetHeader>
          <ProductForm
            branches={branches}
            onSuccess={() => setIsCreateOpen(false)}
            mode="create"
          />
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="rtl:text-start">{t("Are you sure")}?</AlertDialogTitle>
            <AlertDialogDescription className="rtl:text-start">
              {t("This action cannot be undone")}.{" "}
              {t("This will permanently delete the product")} &quot;
              {productToDelete?.name}&quot; {t("from the inventory")}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("Cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t("Delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog
        open={isUploadDialogOpen}
        onOpenChange={setIsUploadDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="rtl:text-start">
              {t("Upload Products from Excel")}
            </AlertDialogTitle>
            <AlertDialogDescription className="rtl:text-start">
              {t(
                "Select an Excel file to import products, Make sure the file follows the template format"
              )}
              .
            </AlertDialogDescription>
          </AlertDialogHeader>
          <form onSubmit={uploadTemplate}>
            <div className="grid gap-4 py-4">
              <Input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                disabled={uploadProductsMutation.isPending}
              />
              {file && (
                <div className="text-sm text-muted-foreground">
                  {t("Selected file")}: {file.name}
                </div>
              )}
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel
                type="button"
                disabled={uploadProductsMutation.isPending}
              >
                {t("Cancel")}
              </AlertDialogCancel>
              <AlertDialogAction
                type="submit"
                disabled={!file || uploadProductsMutation.isPending}
              >
                {uploadProductsMutation.isPending
                  ? t("Importing") + "..."
                  : t("Import")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </form>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
