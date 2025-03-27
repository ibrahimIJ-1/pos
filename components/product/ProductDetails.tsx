
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Edit, Barcode, DollarSign, ShoppingCart, AlertTriangle } from "lucide-react";
import { Product } from "@prisma/client";

interface ProductDetailsProps {
  product: Product;
  onEdit: () => void;
}

export function ProductDetails({ product, onEdit }: ProductDetailsProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  const isLowStock = product.stock <= (product.low_stock_threshold || 0);
  
  // Calculate profit margin percentage
  const calculateProfitMargin = () => {
    if (!product.cost || Number(product.cost) === 0) return "N/A";
    const margin = ((Number(product.price) - Number(product.cost)) / Number(product.price)) * 100;
    return `${margin.toFixed(1)}%`;
  };

  return (
    <ScrollArea className="h-[calc(100vh-10rem)] pr-4">
      <div className="space-y-6 py-4">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold">{product.name}</h2>
            <p className="text-sm text-muted-foreground">SKU: {product.sku}</p>
          </div>
          <Button onClick={onEdit} size="sm" className="gap-2">
            <Edit className="h-4 w-4" />
            Edit
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
            <h3 className="font-medium mb-1">Description</h3>
            <p className="text-sm text-muted-foreground">{product.description}</p>
          </div>
        )}
        
        <Separator />
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <h3 className="text-sm font-medium">Price</h3>
            <p className="flex items-center gap-1 text-base font-semibold">
              <DollarSign className="h-4 w-4 text-green-500" />
              ${product.price.toFixed(2)}
            </p>
          </div>
          
          <div className="space-y-1">
            <h3 className="text-sm font-medium">Cost</h3>
            <p className="flex items-center gap-1 text-base">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              ${product.cost.toFixed(2)}
            </p>
          </div>
          
          <div className="space-y-1">
            <h3 className="text-sm font-medium">Profit Margin</h3>
            <p className="text-base">{calculateProfitMargin()}</p>
          </div>
          
          <div className="space-y-1">
            <h3 className="text-sm font-medium">Tax Rate</h3>
            <p className="text-base">{(Number(product.taxRate) * 100).toFixed(1)}%</p>
          </div>
        </div>
        
        <Separator />
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-medium">Inventory Status</h3>
            {isLowStock && (
              <div className="flex items-center gap-1 text-destructive text-sm">
                <AlertTriangle className="h-4 w-4" />
                Low Stock
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <h3 className="text-sm font-medium">Current Stock</h3>
              <p className="flex items-center gap-1 text-base">
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                {product.stock} units
              </p>
            </div>
            
            <div className="space-y-1">
              <h3 className="text-sm font-medium">Low Stock Threshold</h3>
              <p className="text-base">{product.low_stock_threshold || 0} units</p>
            </div>
          </div>
        </div>
        
        <Separator />
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <h3 className="text-sm font-medium">Category</h3>
            <p className="text-base">{product.category || "Uncategorized"}</p>
          </div>
          
          {product.barcode && (
            <div className="space-y-1">
              <h3 className="text-sm font-medium">Barcode</h3>
              <p className="flex items-center gap-1 text-base">
                <Barcode className="h-4 w-4 text-muted-foreground" />
                {product.barcode}
              </p>
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <h3 className="text-sm font-medium">Created</h3>
            <p className="text-sm text-muted-foreground">{formatDate(product.created_at.toISOString())}</p>
          </div>
          
          <div className="space-y-1">
            <h3 className="text-sm font-medium">Last Updated</h3>
            <p className="text-sm text-muted-foreground">{formatDate(product.updated_at.toISOString())}</p>
          </div>
        </div>
        
        <div className="space-y-1">
          <h3 className="text-sm font-medium">Status</h3>
          <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            product.active 
              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" 
              : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
          }`}>
            {product.active ? "Active" : "Inactive"}
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}
