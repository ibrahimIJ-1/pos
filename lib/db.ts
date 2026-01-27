import Dexie, { Table } from "dexie";

// Define interfaces for our offline data
export interface OfflineSale {
  id?: number; // Auto-incremented ID
  tempId: string; // UUID for tracking before sync
  customerId: string | null;
  items: any[]; // Store varied item structure
  subtotal: number;
  taxTotal: number;
  discountTotal: number;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  notes?: string;
  timestamp: number;
  synced: number; // 0 = false, 1 = true
}

export interface OfflineProduct {
  id: string;
  name: string;
  description: string;
  sku: string;
  barcode: string | null;
  category: string;
  image_url: string | null;
  price: number;
  cost: number;
  taxRate: number;
  stock: number;
  low_stock_threshold: number;
  isActive: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface OfflineCustomer {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
}

export interface OfflineStart {
  id?: number;
  completed: number; // 0 or 1
}

export interface LocalCart {
  id?: string; // string UUID
  items: LocalCartItem[];
  customerId?: string | null;
  customerName?: string | null;
  discountId?: string | null;
  discountAmount: number;
  subtotal: number;
  taxTotal: number;
  totalAmount: number;
  status: "active" | "saved";
}

export interface LocalCartItem {
  id?: string; // string UUID
  cartId: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  taxRate: number;
  image_url?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class POSDatabase extends Dexie {
  sales!: Table<OfflineSale>;
  products!: Table<OfflineProduct>;
  customers!: Table<OfflineCustomer>;
  settings!: Table<any>;
  initialSync!: Table<OfflineStart>;
  cart!: Table<LocalCart>;
  cartItems!: Table<LocalCartItem>;

  constructor() {
    super("POSDatabase");
    this.version(1).stores({
      sales: "++id, tempId, timestamp, synced, customerId",
      products: "id, name, sku, barcode, categoryId",
      customers: "id, name, phone, email",
      settings: "key",
      initialSync: "++id",
      cart: "id, status", // id 1 for active cart
      cartItems: "id, cartId, productId",
    });
  }
}

export const db = new POSDatabase();
