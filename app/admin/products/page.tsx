"use client";

import { useState } from "react";
import { useProducts, useDeleteProduct, useBranches } from "@/lib/pos-service";
import { Plus, Package, Search } from "lucide-react";
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

export default function Products() {
  const { data: products = [], isLoading } = useProducts();
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
          toast.success(`${productToDelete.name} deleted successfully`);
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

  return (
    <div className="container max-w-7xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Inventory Management</h1>

        <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Product
        </Button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search by name, SKU, barcode or category..."
          className="pl-8 neon-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <p>Loading products...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
          <Package className="h-10 w-10 mb-2" />
          <p>No products found</p>
        </div>
      ) : (
        <ProductTable
          data={filteredProducts}
          onView={viewProduct}
          onEdit={editProduct}
          onDelete={handleDelete}
        />
      )}

      {/* Product Details Sheet */}
      <Sheet open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Product Details</SheetTitle>
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
            <SheetTitle>Edit Product</SheetTitle>
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
            <SheetTitle>Add New Product</SheetTitle>
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
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              product &quot;{productToDelete?.name}&quot; from the inventory.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
