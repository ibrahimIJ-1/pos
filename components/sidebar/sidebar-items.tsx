import {
  ArrowBigLeftDashIcon,
  Coins,
  ComputerIcon,
  GitBranchIcon,
  LayoutDashboard,
  ListChecks,
  Package,
  Receipt,
  Settings,
  ShoppingCart,
  Tag,
  Users,
  Warehouse,
} from "lucide-react";
import { SidebarItemType } from "../../lib/types/SidebarItemsType";
import { rolePermissions, UserRole } from "../../lib/permissions";

export const SidebarAdminItems: SidebarItemType[] = [
  // {
  //   icon: <Home className="h-4 w-4" />,
  //   label: t("Home"),
  //   href: "/",
  //   neededPermissions: [],
  // },
  {
    icon: <LayoutDashboard className="h-4 w-4" />,
    label: "Dashboard",
    href: "/admin",
    neededPermissions: [],
  },
  {
    icon: <Package className="h-4 w-4" />,
    label: "Products",
    href: "/admin/products",
    neededPermissions: rolePermissions[UserRole.MANAGER],
  },
  {
    icon: <ShoppingCart className="h-4 w-4" />,
    label: "POS",
    href: "/pos",
    neededPermissions: rolePermissions[UserRole.CASHIER],
  },
  {
    icon: <Users className="h-4 w-4" />,
    label: "Customers",
    href: "/admin/customers",
    neededPermissions: rolePermissions[UserRole.MANAGER],
  },
  {
    icon: <Coins className="h-4 w-4" />,
    label: "Transactions",
    href: "/admin/transactions",
    neededPermissions: [
      ...rolePermissions[UserRole.ACCOUNTANT],
      rolePermissions[UserRole.MANAGER],
    ],
  },
  {
    icon: <Tag className="h-4 w-4" />,
    label: "Discounts",
    href: "/admin/discounts",
    neededPermissions: [
      ...rolePermissions[UserRole.ACCOUNTANT],
      rolePermissions[UserRole.MANAGER],
    ],
  },
  {
    icon: <Package className="h-4 w-4" />,
    label: "Refund Requests",
    href: "/admin/refunds",
    neededPermissions: rolePermissions[UserRole.MANAGER],
  },
  {
    icon: <ComputerIcon className="h-4 w-4" />,
    label: "Registers",
    href: "/admin/registers",
    neededPermissions: [
      ...rolePermissions[UserRole.ACCOUNTANT],
      rolePermissions[UserRole.MANAGER],
    ],
  },
  {
    icon: <Receipt className="h-4 w-4" />,
    label: "Reports",
    href: "/admin/reports",
    neededPermissions: [
      ...rolePermissions[UserRole.ACCOUNTANT],
      rolePermissions[UserRole.MANAGER],
    ],
  },
  {
    icon: <ListChecks className="h-4 w-4" />,
    label: "Users",
    href: "/admin/users",
    neededPermissions: rolePermissions[UserRole.OWNER],
  },
  {
    icon: <GitBranchIcon className="h-4 w-4" />,
    label: "Branches",
    href: "/admin/branches",
    neededPermissions: rolePermissions[UserRole.OWNER],
  },
  {
    icon: <Settings className="h-4 w-4" />,
    label: "Settings",
    href: "/admin/settings",
    neededPermissions: rolePermissions[UserRole.OWNER],
  },
];

export const SidebarPOSItems: SidebarItemType[] = [
  {
    icon: <LayoutDashboard className="h-4 w-4" />,
    label: "Dashboard",
    href: "/admin",
    neededPermissions: rolePermissions[UserRole.MANAGER],
  },
  {
    icon: <ShoppingCart className="h-4 w-4" />,
    label: "POS",
    href: "/pos",
    neededPermissions: rolePermissions[UserRole.CASHIER],
  },
  {
    icon: <ArrowBigLeftDashIcon className="h-4 w-4" />,
    label: "Refund",
    href: "/refund",
    neededPermissions: rolePermissions[UserRole.CASHIER],
  },
];
