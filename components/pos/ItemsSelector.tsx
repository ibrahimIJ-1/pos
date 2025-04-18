"use client";

import { Barcode, Search } from "lucide-react";
import React from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { ScrollArea } from "../ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePOS } from "@/providers/POSProvider";

function ItemsSelector() {
  const { searchTerm, setSearchTerm, products, addItemToCart, inputRef } =
    usePOS();

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.barcode && product.barcode.includes(searchTerm))
  );

  return (
    <div className="lg:col-span-2 space-y-4 h-[95%] flex flex-col">
      {/* Search Bar Section */}
      <div className="flex gap-2 flex-col sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search products..."
            className="pl-10 pr-2 h-11 neon-input border-neon-purple/30 text-base"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button
          variant="outline"
          className="neon-border h-11 w-full sm:w-auto px-4"
        >
          <Barcode className="h-5 w-5 sm:mr-2" />
          <span className="hidden sm:inline">Scan</span>
        </Button>
      </div>

      {/* Products Grid */}
      <ScrollArea className="flex-1">
        <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] sm:grid-cols-[repeat(auto-fill,minmax(160px,1fr))] lg:grid-cols-[repeat(auto-fill,minmax(180px,1fr))] xl:grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-2 p-1">
          {filteredProducts.map((product) => (
            <Card
              key={product.id}
              className="group relative overflow-hidden transition-all hover:shadow-md cursor-pointer neon-card neon-border aspect-[0.75]"
              onClick={() => addItemToCart(product)}
            >
              {/* Image Container */}
              <div className="aspect-square relative bg-muted/40">
                <img
                  src={product.image_url || "/placeholder.svg"}
                  alt={product.name}
                  className="object-cover w-full h-full transition-transform group-hover:scale-105"
                />
                {product.stock <= (product.low_stock_threshold || 0) && (
                  <div className="absolute top-1 right-1 bg-destructive/90 text-destructive-foreground text-[0.6rem] px-2 py-1 rounded-sm sm:text-xs sm:top-2 sm:right-2">
                    Low Stock
                  </div>
                )}
              </div>

              {/* Product Info */}
              <CardContent className="p-2 space-y-1 sm:p-3 sm:space-y-2">
                <h3 className="font-medium text-xs sm:text-sm leading-tight line-clamp-2">
                  {product.name}
                </h3>
                <div className="flex justify-between items-center gap-2">
                  <span className="text-sm sm:text-base font-bold truncate">
                    ${product.price.toFixed(2)}
                  </span>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {product.stock} in stock
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
