"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { NumberInput } from "@/components/ui/number-input";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { UserRole, Permission } from "@/lib/permissions";
// import { PermissionGuard } from "@/hooks/usePermissions";
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  User,
  Search,
  Receipt,
  CreditCard,
  DollarSign,
  Wallet,
  X,
  Barcode,
  Copy,
  List,
  Tag,
  Percent,
  Trash,
} from "lucide-react";
import {
  useProducts,
  useCustomers,
  useCreateSale,
  useCart,
  useCartOperations,
  useMultiCart,
  useMultiCartOperations,
} from "@/lib/pos-service";
import { toast } from "sonner";
import { DiscountSelector } from "@/components/discount/DiscountSelector";
import { InvoicePrint } from "@/components/invoice/InvoicePrint";
import {
  Cart,
  CartItem,
  Customer,
  Discount,
  Sale,
  SaleItem,
} from "@prisma/client";
import { useAuth } from "@/contexts/AuthContext";
import Loading from "@/app/loading";
import MacNotFound from "@/app/mac-not-found";

function POS() {
  const { macAddress, macLoading } = useAuth();

  if (macLoading) {
    return Loading();
  }

  if (!macAddress) {
    return MacNotFound();
  }
  const { data: products = [] } = useProducts();
  const { data: customers = [] } = useCustomers();
  const { data: cart } = useCart();
  const { data: multiCart } = useMultiCart();
  const cartOps = useCartOperations();
  const multiCartOps = useMultiCartOperations();
  const createSaleMutation = useCreateSale();

  const [searchTerm, setSearchTerm] = useState("");
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isCustomerDialogOpen, setIsCustomerDialogOpen] = useState(false);
  const [isDiscountDialogOpen, setIsDiscountDialogOpen] = useState(false);
  const [isCartsPopoverOpen, setIsCartsPopoverOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string>("credit_card");
  const [cashReceived, setCashReceived] = useState<number>(0);
  const [lastCompletedSale, setLastCompletedSale] = useState<any>(null);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);

  const inputRef = useRef(null);
  const scannedData = useRef("");

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.barcode && product.barcode.includes(searchTerm))
  );

  const handleCheckout = () => {
    if ((cart?.items as CartItem[]).length === 0) {
      toast.error("Cart is empty");
      return;
    }

    setCashReceived(cart ? cart.totalAmount : 0);
    setIsPaymentDialogOpen(true);
  };

  const handleCompleteSale = () => {
    const saleDate = new Date().toISOString();

    const saleItems: SaleItem[] = (cart?.items as CartItem[]).map(
      (item: CartItem) =>
        ({
          id: `item-${Date.now()}-${item.productId}`,
          saleId: "", // This will be assigned by the backend
          productId: item.productId,
          productName: item.name,
          quantity: item.quantity,
          unitPrice: item.price,
          discountAmount: cart?.discountTotal
            ? cart.discountTotal / (cart?.items as CartItem[]).length
            : 0, // Simple proration of discount
          taxAmount:
            (item.price ? Number(item.price) : 0) *
            (item.quantity ?? 0) *
            (item.taxRate ? Number(item.taxRate) : 0),
          subtotal: (item.price ? Number(item.price) : 0) * item.quantity,
        } as unknown as SaleItem)
    );

    const newSale: any = {
      //   id: invoiceId,
      date: saleDate,
      customerId: cart ? cart.customer?.id ?? null : null,
      subtotal: cart ? cart.subtotal : 0,
      taxTotal: cart ? cart.taxTotal : 0,
      discountTotal: cart ? cart.discountTotal : 0,
      totalAmount: cart ? cart.totalAmount : 0,
      paymentMethod: paymentMethod,
      paymentStatus: "paid" as const,
      notes: "",
      // created_at: Date.now(),
      // updated_at: Date.now(),
      // saleNumber: "1",
    };
    createSaleMutation.mutate(
      { newSale, items: saleItems },
      {
        onSuccess: (data: any) => {
          setIsPaymentDialogOpen(false);
          setLastCompletedSale({ ...newSale, ...data });
          setIsInvoiceOpen(true);
          if (cart) cartOps.clearCart.mutate({ cartId: cart.id });
        },
      }
    );
  };

  const handleCustomerSelect = (customer: Customer) => {
    if (cart) {
      cartOps.setCustomer.mutate({
        customerId: customer.id,
        customerName: customer.name,
        cartId: cart.id,
      });
      setIsCustomerDialogOpen(false);
      toast.success(`Customer: ${customer.name}`);
    }
  };

  const handleApplyDiscount = (discount: Discount) => {
    if (cart)
      cartOps.applyDiscount.mutate({
        discountId: discount.id,
        cartId: cart.id,
      });
  };

  const handleRemoveDiscount = () => {
    if (cart) cartOps.removeDiscount.mutate(cart.id);
  };

  const changeToAnotherCustomer = () => {
    setIsCustomerDialogOpen(true);
  };

  const removeCustomer = () => {
    if (cart) {
      cartOps.setCustomer.mutate({
        customerId: undefined,
        customerName: undefined,
        cartId: cart.id,
      });
      toast.success("Customer removed");
    }
  };

  const calculateChange = () => {
    return cashReceived - (cart ? cart?.totalAmount : 0);
  };

  const handleAddCart = () => {
    multiCartOps.addCart.mutate();
    setIsCartsPopoverOpen(false);
  };

  const handleSwitchCart = (cartId: string) => {
    const cart = multiCart?.carts[parseInt(cartId)] as Partial<Cart>;
    if (cart && cart.id) {
      multiCartOps.switchCart.mutate(cart.id);
      setIsCartsPopoverOpen(false);
    }
  };

  const handleRemoveCart = (cartId: string) => {
    const cart = multiCart?.carts[parseInt(cartId)] as Partial<Cart>;
    if (cart && cart.id) multiCartOps.removeCart.mutate(cart.id);
  };

  const handleDuplicateCart = (cartId: string) => {
    const cart = multiCart?.carts[parseInt(cartId)] as Partial<Cart>;
    if (cart && cart.id) {
      multiCartOps.duplicateCart.mutate(cart.id);
      setIsCartsPopoverOpen(false);
    }
  };

  const getShortCartId = (cartId: string) => {
    // return cartId.split("-")[2] || cartId.slice(-4);
    return cartId;
  };

  const getCartItemCount = (cartId: any) => {
    if (!multiCart || !multiCart.carts[cartId]) return 0;
    return (multiCart.carts[cartId] as any).items.reduce(
      (sum: number, item: CartItem) => sum + item.quantity,
      0
    );
  };

  const addItemToCart = useCallback(
    (product: any) => {
      console.log("asdasdasd");

      if (cart)
        cartOps.addItem.mutate(
          { product, cartId: cart.id },
          {
            onSettled: (data: any) => {},
          }
        );
    },
    [cart, cartOps.addItem] // Dependencies for useCallback
  );

  const clearCart = () => {
    if (cart) cartOps.clearCart.mutate({ cartId: cart.id });
  };

  const updateCartItemQuantity = (itemId: string, quantity: number) => {
    if (cart)
      cartOps.updateQuantity.mutate({
        cartId: cart.id,
        itemId,
        quantity: quantity,
      });
  };

  useEffect(() => {
    const handleKeyDown = (event: any) => {
      if (event.key.length === 1 && event.key !== "Enter") {
        scannedData.current += event.key; // Append the character to the scanned data
      }
      if (event.key === "Enter") {
        const prod = products.find((p) => p.barcode == scannedData.current);
        if (prod) addItemToCart(prod);
        if (inputRef.current) (inputRef.current as HTMLInputElement)?.focus();
        scannedData.current = "";
        setSearchTerm(scannedData.current);
      }
    };

    // Add the event listener to the document
    document.addEventListener("keydown", handleKeyDown);

    // Clean up the event listener on component unmount
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [addItemToCart, products]);

  return (
    <div className="container mx-auto p-4 bg-gradient-to-br from-background to-background/95">
      <div className="grid grid-cols-1 lg:flex gap-4">
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

          <ScrollArea className="h-[calc(100vh-16rem)]">
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredProducts.map((product) => (
                <Card
                  key={product.id}
                  className="overflow-hidden transition-all hover:shadow-md cursor-pointer neon-card neon-border"
                  onClick={() => addItemToCart(product)}
                >
                  <div className="aspect-square relative bg-muted/40">
                    <img
                      src={product.image_url || "/placeholder.svg"}
                      alt={product.name}
                      className="object-cover w-full h-full"
                    />
                    {product.stock <= (product.low_stock_threshold || 0) && (
                      <div className="absolute top-2 right-2 bg-destructive text-destructive-foreground text-xs px-2 py-1 rounded-sm">
                        Low Stock
                      </div>
                    )}
                  </div>
                  <CardContent className="p-3">
                    <h3 className="font-medium text-sm truncate">
                      {product.name}
                    </h3>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-base font-bold">
                        ${product.price.toFixed(2)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Stock: {product.stock}
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

        <div>
          <Card className="neon-card border-neon-purple/30 dark:border-neon-purple/20 shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl flex justify-between items-center">
                <div className="flex flex-col justify-center items-center gap-2">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5" />
                    <span>Current Sale</span>
                  </div>
                  <div className="flex gap-1 items-center">
                    <Popover
                      open={isCartsPopoverOpen}
                      onOpenChange={setIsCartsPopoverOpen}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 px-2"
                        >
                          <List className="h-4 w-4 mr-1" />
                          {multiCart && (
                            <span>
                              Cart #
                              {getShortCartId(multiCart.activeCartId ?? "")}
                            </span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="p-0 w-64" align="start">
                        <div className="p-3 border-b">
                          <h3 className="font-medium">Manage Carts</h3>
                          <p className="text-sm text-muted-foreground">
                            Switch between or create new carts
                          </p>
                        </div>

                        {multiCart && (
                          <ScrollArea className="max-h-64">
                            <div className="p-1">
                              {Object.keys(multiCart.carts).map((cartId) => (
                                <div
                                  key={cartId}
                                  className={`flex items-center justify-between p-2 rounded-md ${
                                    cartId === multiCart.activeCartId
                                      ? "bg-muted"
                                      : "hover:bg-muted/50"
                                  }`}
                                >
                                  <button
                                    className="flex items-center gap-2 text-left flex-1"
                                    onClick={() => handleSwitchCart(cartId)}
                                  >
                                    <ShoppingCart className="h-4 w-4" />
                                    <div>
                                      <div className="font-medium">
                                        Cart #{getShortCartId(cartId)}
                                      </div>
                                      <div className="text-xs text-muted-foreground">
                                        {getCartItemCount(cartId)} items | $
                                        {/* {multiCart?.carts[cartId]?.items.toFixed(
                                          2
                                        )} */}
                                      </div>
                                    </div>
                                  </button>

                                  <div className="flex items-center">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7"
                                      onClick={() =>
                                        handleDuplicateCart(cartId)
                                      }
                                      title="Duplicate cart"
                                    >
                                      <Copy className="h-3.5 w-3.5" />
                                    </Button>

                                    {Object.keys(multiCart.carts).length >
                                      1 && (
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                        onClick={() => handleRemoveCart(cartId)}
                                        title="Remove cart"
                                      >
                                        <Trash2 className="h-3.5 w-3.5" />
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </ScrollArea>
                        )}

                        <div className="p-2 border-t">
                          <Button
                            variant="outline"
                            className="w-full justify-start"
                            onClick={handleAddCart}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            New Cart
                          </Button>
                        </div>
                      </PopoverContent>
                    </Popover>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 text-muted-foreground hover:text-destructive"
                      onClick={() => clearCart()}
                      disabled={(cart?.items as CartItem[])?.length === 0}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Clear
                    </Button>
                  </div>
                </div>
              </CardTitle>

              <div className="flex items-center gap-2">
                {cart?.customer ? (
                  <div className="flex-1 flex items-center justify-between bg-muted p-2 rounded-md">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium truncate">
                        {cart.customer.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={changeToAnotherCustomer}
                      >
                        <User className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground hover:text-destructive"
                        onClick={removeCustomer}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 justify-start"
                    onClick={() => setIsCustomerDialogOpen(true)}
                  >
                    <User className="h-4 w-4 mr-2" />
                    Add Customer
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-2 mt-1">
                {cart?.discount ? (
                  <div className="flex-1 flex items-center justify-between bg-muted p-2 rounded-md">
                    <div className="flex items-center gap-2">
                      <Percent className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium truncate">
                        {cart.discount.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => setIsDiscountDialogOpen(true)}
                      >
                        <Tag className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground hover:text-destructive"
                        onClick={handleRemoveDiscount}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 justify-start"
                    onClick={() => setIsDiscountDialogOpen(true)}
                    disabled={(cart?.items as CartItem[])?.length === 0}
                  >
                    <Tag className="h-4 w-4 mr-2" />
                    Apply Discount
                  </Button>
                )}
              </div>
            </CardHeader>

            <CardContent className="pb-0">
              <ScrollArea className="h-[calc(100vh-26rem)]">
                {((cart?.items as CartItem[])?.length
                  ? (cart?.items as CartItem[]).length
                  : 0) > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                        <TableHead className="text-center">Qty</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead className="text-right">Clear</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(cart?.items as CartItem[]).map((item) => (
                        <TableRow key={item.productId}>
                          <TableCell className="font-medium">
                            {item.name}
                          </TableCell>
                          <TableCell className="text-right">
                            ${item?.price.toString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                disabled={cartOps.updateQuantity.isPending}
                                onClick={() =>
                                  updateCartItemQuantity(
                                    item.id,
                                    item.quantity - 1
                                  )
                                }
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-6 text-center">
                                {item.quantity}
                              </span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                disabled={cartOps.updateQuantity.isPending}
                                onClick={() =>
                                  updateCartItemQuantity(
                                    item.id,
                                    item.quantity + 1
                                  )
                                }
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            $
                            {(
                              parseFloat(item.price.toString()) * item.quantity
                            ).toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                disabled={cartOps.updateQuantity.isPending}
                                onClick={() =>
                                  updateCartItemQuantity(item.id, 0)
                                }
                              >
                                <Trash className="h-3 w-3" color="red" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                    <ShoppingCart className="h-10 w-10 mb-2" />
                    <p>No items in cart</p>
                    <p className="text-sm">Add products by clicking on them</p>
                  </div>
                )}
              </ScrollArea>
            </CardContent>

            <CardFooter className="flex-col pt-6">
              <div className="w-full space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${cart?.subtotal?.toFixed(2) || "0.00"}</span>
                </div>
                {(cart?.discountTotal ?? 0) > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount</span>
                    <span>-${cart ? cart.discountTotal.toFixed(2) : 0}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax</span>
                  <span>${cart?.taxTotal?.toFixed(2) || "0.00"}</span>
                </div>
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>${cart?.totalAmount?.toFixed(2) || "0.00"}</span>
                </div>
              </div>

              {/* <PermissionGuard
                userRole={UserRole.CASHIER}
                permission={Permission.CREATE_SALE}
              > */}
              <Button
                className="w-full neon-glow animate-glow bg-neon-purple hover:bg-neon-purple/90"
                size="lg"
                disabled={
                  !(cart?.items as CartItem[])?.length ||
                  createSaleMutation.isPending
                }
                onClick={handleCheckout}
              >
                {createSaleMutation.isPending ? (
                  "Processing..."
                ) : (
                  <>
                    <Receipt className="h-4 w-4 mr-2" />
                    Checkout
                  </>
                )}
              </Button>
              {/* </PermissionGuard> */}
            </CardFooter>
          </Card>
        </div>
      </div>

      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent className="sm:max-w-md border-neon-purple/30">
          <DialogHeader>
            <DialogTitle>Payment</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={
                  paymentMethod === "credit_card" ? "default" : "outline"
                }
                className={`flex-1 gap-2 ${
                  paymentMethod === "credit_card"
                    ? "bg-neon-purple hover:bg-neon-purple/90"
                    : ""
                }`}
                onClick={() => setPaymentMethod("credit_card")}
              >
                <CreditCard className="h-4 w-4" />
                Credit Card
              </Button>
              <Button
                variant={paymentMethod === "cash" ? "default" : "outline"}
                className={`flex-1 gap-2 ${
                  paymentMethod === "cash"
                    ? "bg-neon-purple hover:bg-neon-purple/90"
                    : ""
                }`}
                onClick={() => setPaymentMethod("cash")}
              >
                <DollarSign className="h-4 w-4" />
                Cash
              </Button>
            </div>

            {paymentMethod === "cash" && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Cash Received</label>
                <NumberInput
                  min={cart?.totalAmount}
                  step={1}
                  value={cashReceived}
                  onChange={(value) => setCashReceived(value)}
                  className="w-full"
                />

                <div className="flex justify-between font-medium">
                  <span>Change</span>
                  <span>${calculateChange().toFixed(2)}</span>
                </div>
              </div>
            )}

            <div className="bg-muted rounded-md p-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Items</span>
                <span>
                  {(cart?.items as CartItem[])?.reduce(
                    (acc, item) => acc + item.quantity,
                    0
                  ) || 0}
                </span>
              </div>
              {(cart?.discountTotal ?? 0) > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount</span>
                  <span>-${cart?.discountTotal.toFixed(2) || 0}</span>
                </div>
              )}
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>${cart?.totalAmount?.toFixed(2) || "0.00"}</span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsPaymentDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCompleteSale}
              disabled={createSaleMutation.isPending}
              className="gap-2 bg-neon-purple hover:bg-neon-purple/90"
            >
              <Wallet className="h-4 w-4" />
              {createSaleMutation.isPending ? "Processing..." : "Complete Sale"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isCustomerDialogOpen}
        onOpenChange={setIsCustomerDialogOpen}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Select Customer</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search customers..."
                className="pl-8 neon-input"
              />
            </div>

            <ScrollArea className="h-72">
              <div className="space-y-1">
                {customers.map((customer) => (
                  <Button
                    key={customer.id}
                    variant="ghost"
                    className="w-full justify-start font-normal gap-2"
                    onClick={() => handleCustomerSelect(customer)}
                  >
                    <User className="h-4 w-4 flex-shrink-0" />
                    <div className="flex flex-col items-start text-left">
                      <span>{customer.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {customer.email || customer.phone || "No contact info"}
                      </span>
                    </div>
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCustomerDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="outline" className="gap-2">
              <Plus className="h-4 w-4" />
              New Customer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DiscountSelector
        open={isDiscountDialogOpen}
        onOpenChange={setIsDiscountDialogOpen}
        onSelectDiscount={handleApplyDiscount}
      />

      <Dialog open={isInvoiceOpen} onOpenChange={setIsInvoiceOpen}>
        <DialogContent className="max-w-4xl h-[90vh] p-0 border-neon-purple/30">
          {lastCompletedSale && (
            <InvoicePrint
              data={lastCompletedSale}
              onClose={() => setIsInvoiceOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default POS;
