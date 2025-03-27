export enum UserRole {
  ADMIN = "admin",
  OWNER = "owner",
  MANAGER = "manager",
  CASHIER = "cashier",
  INVENTORY_CLERK = "inventory_clerk",
  ACCOUNTANT = "accountant",
  EDITOR = "editor",
  VIEWER = "viewer",
}

// export interface Discount {
//   id: string;
//   name: string;
//   code?: string | null;
//   type: string;
//   value: number;
//   min_purchase_amount?: number | null;
//   applies_to: string;
//   product_ids?: string[] | null;
//   category_ids?: string[] | null;
//   buy_x_quantity?: number | null;
//   get_y_quantity?: number | null;
//   start_date: string;
//   end_date?: string | null;
//   max_uses?: number | null;
//   current_uses: number;
//   is_active: boolean;
//   createdAt: string;
//   updatedAt: string;
// }

export enum Permission {
  // Analytics
  VIEW_ANALYTICS = "view_analytics",

  // User management
  VIEW_USERS = "view_users",
  EDIT_USERS = "edit_users",
  CREATE_USER = "create_user",
  DELETE_USER = "delete_user",

  // Product management
  VIEW_PRODUCTS = "view_products",
  EDIT_PRODUCTS = "edit_products",
  CREATE_PRODUCT = "create_product",
  DELETE_PRODUCT = "delete_product",
  ADJUST_INVENTORY = "adjust_inventory",

  // Customer management
  VIEW_CUSTOMERS = "view_customers",
  EDIT_CUSTOMERS = "edit_customers",
  CREATE_CUSTOMER = "create_customer",
  DELETE_CUSTOMER = "delete_customer",

  // Content management
  VIEW_CONTENT = "view_content",
  EDIT_CONTENT = "edit_content",
  CREATE_CONTENT = "create_content",
  DELETE_CONTENT = "delete_content",

  // Sales & transactions
  VIEW_TRANSACTIONS = "view_transactions",
  EDIT_TRANSACTIONS = "edit_transactions",
  VIEW_SALES = "view_sales",
  CREATE_SALE = "create_sale",
  VOID_SALE = "void_sale",
  ISSUE_REFUND = "issue_refund",

  // Register management
  VIEW_REGISTER = "view_register",
  OPEN_CLOSE_REGISTER = "open_close_register",
  VIEW_REGISTERS = "view_registers",
  OPEN_REGISTER = "open_register",
  CLOSE_REGISTER = "close_register",
  ADD_CASH = "add_cash",
  REMOVE_CASH = "remove_cash",
  // Settings
  VIEW_SETTINGS = "view_settings",
  EDIT_SETTINGS = "edit_settings",

  // Discount permissions
  VIEW_DISCOUNTS = "view_discounts",
  CREATE_DISCOUNT = "create_discount",
  UPDATE_DISCOUNT = "update_discount",
  DELETE_DISCOUNT = "delete_discount",
  APPLY_DISCOUNT = "apply_discount",

  //reports
  VIEW_REPORTS = "view_reports",
  EXPORT_REPORTS = "export_reports",

  //Settings
  MANAGE_SETTINGS = "manage_settings",
  VIEW_ROLES = "view_roles",
  CREATE_ROLE = "create_role",
  UPDATE_ROLE = "update_role",
  DELETE_ROLE = "delete_role",
  ASSIGN_PERMISSIONS = "assign_permissions",
}

// Define role-specific permissions
export const rolePermissions: Record<string, Permission[]> = {
  [UserRole.ADMIN]: Object.values(Permission),
  [UserRole.MANAGER]: [
    Permission.VIEW_ANALYTICS,
    Permission.VIEW_USERS,
    Permission.VIEW_PRODUCTS,
    Permission.EDIT_PRODUCTS,
    Permission.CREATE_PRODUCT,
    Permission.VIEW_CUSTOMERS,
    Permission.EDIT_CUSTOMERS,
    Permission.CREATE_CUSTOMER,
    Permission.VIEW_TRANSACTIONS,
    Permission.VIEW_SALES,
    Permission.CREATE_SALE,
    Permission.VOID_SALE,
    Permission.APPLY_DISCOUNT,
    Permission.ISSUE_REFUND,
    Permission.VIEW_REGISTER,
    Permission.OPEN_CLOSE_REGISTER,
    Permission.VIEW_SETTINGS,
  ],
  [UserRole.CASHIER]: [
    Permission.VIEW_PRODUCTS,
    Permission.VIEW_CUSTOMERS,
    Permission.CREATE_CUSTOMER,
    Permission.CREATE_SALE,
    Permission.APPLY_DISCOUNT,
    Permission.VIEW_REGISTER,
    Permission.OPEN_CLOSE_REGISTER,
  ],
  [UserRole.INVENTORY_CLERK]: [
    Permission.VIEW_PRODUCTS,
    Permission.EDIT_PRODUCTS,
    Permission.CREATE_PRODUCT,
    Permission.ADJUST_INVENTORY,
  ],
  [UserRole.ACCOUNTANT]: [
    Permission.VIEW_ANALYTICS,
    Permission.VIEW_TRANSACTIONS,
    Permission.VIEW_SALES,
  ],
  [UserRole.EDITOR]: [
    Permission.VIEW_CONTENT,
    Permission.EDIT_CONTENT,
    Permission.CREATE_CONTENT,
  ],
  [UserRole.VIEWER]: [
    Permission.VIEW_CONTENT,
    Permission.VIEW_PRODUCTS,
    Permission.VIEW_CUSTOMERS,
  ],
};

// User type definition
export interface User {
  id: string;
  name: string;
  email: string;
  roles: (UserRole | string)[];
  additionalPermissions?: Permission[];
  avatar?: string | null;
}

// export interface Product {
//   id: string;
//   name: string;
//   description: string | undefined;
//   sku: string;
//   barcode: string | undefined;
//   price: number;
//   cost: number;
//   category: string;
//   tax_rate: number;
//   stock: number;
//   low_stock_threshold: number;
//   image_url: string | undefined;
//   active: boolean;
//   created_at?: string;
//   updated_at?: string;
// }

export interface Register {
  id: string;
  name: string;
  status: "open" | "closed";
  current_cashier_id?: string;
  opening_balance: number;
  closing_balance?: number;
  opened_at: string;
  closed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface RegisterTransaction {
  id: string;
  register_id: string;
  type: "sale" | "refund" | "expense" | "cash_in" | "cash_out";
  reference_id?: string;
  amount: number;
  payment_method: string;
  description: string;
  cashier_id: string;
  created_at: string;
}

// Add Discount type
// export interface Discount {
//   id: string;
//   name: string;
//   code?: string;
//   type: "percentage" | "fixed" | "buy_x_get_y";
//   value: number; // percentage or fixed amount
//   min_purchase_amount?: number;
//   applies_to: "entire_order" | "specific_products" | "specific_categories";
//   product_ids?: string[];
//   category_ids?: string[];
//   buy_x_quantity?: number;
//   get_y_quantity?: number;
//   start_date: string;
//   end_date?: string;
//   max_uses?: number;
//   current_uses: number;
//   is_active: boolean;
//   created_at: string;
//   updated_at: string;
// }

// Helper functions for role management
export function hasPermission(
  roles: (UserRole | string)[],
  permission: Permission,
  additionalPermissions: Permission[] = []
): boolean {
  // Check if the permission is in additionalPermissions
  if (additionalPermissions.includes(permission)) {
    return true;
  }

  // Check if any of the user's roles grant the permission
  return roles.some((role) => {
    const permissions = rolePermissions[role];
    return permissions && permissions.includes(permission);
  });
}

// Custom roles management functions
const customRoles: Record<string, Permission[]> = {};

export function getAllRoles(): string[] {
  return [...Object.values(UserRole), ...Object.keys(customRoles)];
}

export function getRolePermissions(role: string): Permission[] {
  return rolePermissions[role] || customRoles[role] || [];
}

export function createRole(name: string, permissions: Permission[]): string {
  if (Object.values(UserRole).includes(name as UserRole) || customRoles[name]) {
    throw new Error(`Role "${name}" already exists`);
  }

  customRoles[name] = permissions;
  return name;
}

export function updateRolePermissions(
  role: string,
  permissions: Permission[]
): void {
  if (Object.values(UserRole).includes(role as UserRole)) {
    throw new Error("Cannot modify built-in roles");
  }

  if (!customRoles[role]) {
    throw new Error(`Role "${role}" does not exist`);
  }

  customRoles[role] = permissions;
}

export function deleteRole(role: string): void {
  if (Object.values(UserRole).includes(role as UserRole)) {
    throw new Error("Cannot delete built-in roles");
  }

  if (!customRoles[role]) {
    throw new Error(`Role "${role}" does not exist`);
  }

  delete customRoles[role];
}
