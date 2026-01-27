import { db, OfflineSale, OfflineProduct, OfflineCustomer } from "./db";
import { getAllPOSProducts } from "@/actions/products/get-all-pos-products";
import { getAllCustomers } from "@/actions/customers/get-all-customers";
import { getAllCategories } from "@/actions/categories/get-all-categories";
import { syncSale } from "@/actions/sales/sync-sale";
import { toast } from "sonner";
import { Sale, SaleItem } from "@prisma/client";

export const syncPull = async () => {
  try {
    console.log("Starting Sync Pull...");
    const [productsResult, customersResult, categoriesResult] =
      await Promise.all([
        getAllPOSProducts(),
        getAllCustomers(),
        getAllCategories(),
      ]);

    await db.transaction(
      "rw",
      db.products,
      db.customers,
      db.categories,
      async () => {
        // Sync Products
        if (productsResult) {
          // Transform prisma product to offline product if needed or just store raw if compatible
          // We'll map to ensure type safety based on our Dexie schema
          const products: OfflineProduct[] = productsResult.map((p: any) => ({
            id: p.id,
            name: p.name,
            description: p.description,
            sku: p.sku,
            barcode: p.barcode,
            category: p.category,
            image_url: p.image_url,
            price: typeof p.price === "object" ? p.price.toNumber() : p.price,
            cost: typeof p.cost === "object" ? p.cost.toNumber() : p.cost,
            taxRate:
              typeof p.taxRate === "object" ? p.taxRate.toNumber() : p.taxRate,
            stock: p.stock,
            low_stock_threshold: p.low_stock_threshold,
            isActive: p.isActive ?? true,
            created_at: p.created_at ? new Date(p.created_at) : new Date(),
            updated_at: p.updated_at ? new Date(p.updated_at) : new Date(),
          }));
          await db.products.clear();
          await db.products.bulkPut(products);
        }

        // Sync Customers
        if (customersResult) {
          const customers: OfflineCustomer[] = customersResult.map(
            (c: any) => ({
              id: c.id,
              name: c.name,
              phone: c.phone,
              email: c.email,
            }),
          );
          await db.customers.clear();
          await db.customers.bulkPut(customers);
        }

        // Sync Categories
        if (categoriesResult) {
          const categories = categoriesResult.map((c: any) => ({
            id: c.id,
            name: c.name,
            image_url: c.imageUrl,
            color: c.color,
            sortOrder: c.sortOrder,
          }));
          await db.categories.clear();
          await db.categories.bulkPut(categories);
        }
      },
    );
    console.log("Sync Pull Completed");
    return true;
  } catch (error) {
    console.error("Sync Pull Failed:", error);
    return false;
  }
};

export const syncPush = async () => {
  try {
    const unsyncedSales = await db.sales.where("synced").equals(0).toArray();
    if (unsyncedSales.length === 0) return true;

    console.log(`Found ${unsyncedSales.length} unsynced sales. Pushing...`);

    for (const offlineSale of unsyncedSales) {
      try {
        // Map OfflineSale to Prisma Sale/SaleItem structure expected by createNewSale
        // We need to be careful with types. createNewSale expects a Sale object (which has many fields).
        // We'll construct a partial object or cast relevant fields.

        const saleData: any = {
          customerId: offlineSale.customerId,
          subtotal: offlineSale.subtotal,
          taxTotal: offlineSale.taxTotal,
          discountTotal: offlineSale.discountTotal,
          totalAmount: offlineSale.totalAmount,
          paymentMethod: offlineSale.paymentMethod,
          paymentStatus: offlineSale.paymentStatus,
          notes: offlineSale.notes,
          // These will be overridden by server logic but required by type
          registerId: "",
          cashierId: "",
        };

        const saleItems = offlineSale.items.map((item: any) => ({
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discountAmount: item.discountAmount,
          taxAmount: item.taxAmount,
          subtotal: item.subtotal,
        }));

        // createNewSale expects Sale, SaleItems. We are passing what we have.
        await syncSale(saleData, saleItems as any as SaleItem[]);

        // Mark as synced
        if (offlineSale.id) {
          const updated = await db.sales.update(offlineSale.id, { synced: 1 });
          console.log(
            `Updated sale ${offlineSale.id} synced status. Result: ${updated}`,
          );
          if (updated === 0) {
            console.warn(
              `Warning: Sale ${offlineSale.id} was not updated in DB (key not found?)`,
            );
          }
        } else {
          console.error(
            `Error: Offline sale ${offlineSale.tempId} has no ID! Cannot mark as synced.`,
          );
        }

        console.log(`Sale ${offlineSale.tempId} synced successfully.`);
      } catch (err) {
        console.error(`Failed to sync sale ${offlineSale.tempId}:`, err);
        toast.error(
          `Sync failed for sale #${offlineSale.tempId}: ${err instanceof Error ? err.message : "Unknown error"}`,
        );
        // Optionally count failures to stop retry loop if needed
      }
    }
    return true;
  } catch (error) {
    console.error("Sync Push Failed:", error);
    toast.error("Sync Process Failed");
    return false;
  }
};
