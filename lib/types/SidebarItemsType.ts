import { Permission } from "../permissions";

export interface SidebarItemType {
  icon: React.ReactNode;
  label: string;
  href?: string;
  neededPermissions: (Permission | Permission[])[];
  children?: SidebarItemType[];
}