import { Permission } from "../permissions";

export type SidebarItemType = {
  icon: React.JSX.Element;
  label: string;
  href: string;
  neededPermissions: (Permission | Permission[])[];
};