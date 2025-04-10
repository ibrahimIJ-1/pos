"use client"

import { Barcode, Search } from "lucide-react";
import React from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { ScrollArea } from "../ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePOS } from "@/providers/POSProvider";

function ItemsSelector() {
  const { searchTerm, setSearchTerm, products, addItemToCart,inputRef } = usePOS();
  

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.barcode && product.barcode.includes(searchTerm))
  );

  return (
    <div className="lg:col-span-2 space-y-4">
      <div className="flex items-center gap-2">
        <div className="">
          <Input
            type="hidden"
            onChange={(e) => setSearchTerm(e.target.value)}
            ref={inputRef}
          />
        </div>
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search products by name, SKU, or barcode..."
            className="pl-8 neon-input border-neon-purple/30"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {/* <PermissionGuard
              userRole={UserRole.CASHIER}
              permission={Permission.VIEW_REGISTER}
            > */}
        <Button variant="outline" size="icon" className="neon-border">
          <Barcode className="h-4 w-4" />
        </Button>
        {/* </PermissionGuard> */}
      </div>

      <ScrollArea className="h-[calc(100vh-10rem)]">
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-8 gap-1 lg:gap-4">
          {filteredProducts.map((product) => (
            <Card
              key={product.id}
              className="overflow-hidden transition-all hover:shadow-md cursor-pointer neon-card neon-border w-[100px] lg:w-[135px] xl:w-[170px] 2xl:w-[200px]"
              onClick={() => addItemToCart(product)}
            >
              <div className="aspect-square relative bg-muted/40">
                <img
                  src={product.image_url || "/placeholder.svg"}
                  alt={product.name}
                  className="object-cover w-full h-full"
                />
                {product.stock <= (product.low_stock_threshold || 0) && (
                  <div className="absolute top-2 right-2 bg-destructive text-destructive-foreground text-[0.5rem] lg:text-xs px-2 py-1 rounded-sm">
                    Low Stock
                  </div>
                )}
              </div>
              <CardContent className="p-3">
                <h3 className="font-medium text-xs lg:text-sm truncate">{product.name}</h3>
                <div className="lg:flex justify-between items-center mt-1">
                  <span className="text-sm lg:text-base font-bold">
                    ${product.price.toFixed(2)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    <div>Stock: {product.stock}</div>
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
          {filteredProducts.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center h-40 text-muted-foreground">
              <Search className="h-10 w-10 mb-2" />
              <p>No products found</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

export default ItemsSelector;
