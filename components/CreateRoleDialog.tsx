"use client"

import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import {Permission } from "@/lib/permissions";
import { createNewRole } from "@/actions/auth/roles/create-role";
import { useTranslations } from "next-intl";

interface CreateRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRoleCreated: (roleName: string, permissions: Permission[]) => void;
}

// Group permissions for better organization
const permissionGroups = {
  "User Management": [
    Permission.VIEW_USERS,
    Permission.CREATE_USER,
    Permission.EDIT_USERS,
    Permission.DELETE_USER,
  ],
  "Content Management": [
    Permission.VIEW_CONTENT,
    Permission.CREATE_CONTENT,
    Permission.EDIT_CONTENT,
    Permission.DELETE_CONTENT,
  ],
  "Settings & Analytics": [
    Permission.VIEW_SETTINGS,
    Permission.EDIT_SETTINGS,
    Permission.VIEW_ANALYTICS,
  ],
  "Products & Inventory": [
    Permission.VIEW_PRODUCTS,
    Permission.CREATE_PRODUCT,
    Permission.EDIT_PRODUCTS,
    Permission.DELETE_PRODUCT,
    Permission.ADJUST_INVENTORY,
  ],
  "Sales & Transactions": [
    Permission.VIEW_SALES,
    Permission.CREATE_SALE,
    Permission.VOID_SALE,
    Permission.APPLY_DISCOUNT,
    Permission.ISSUE_REFUND,
    Permission.VIEW_REGISTER,
    Permission.OPEN_CLOSE_REGISTER,
  ],
  "Customer Management": [
    Permission.VIEW_CUSTOMERS,
    Permission.CREATE_CUSTOMER,
    Permission.EDIT_CUSTOMERS,
    Permission.DELETE_CUSTOMER,
  ],
};

export function CreateRoleDialog({ open, onOpenChange, onRoleCreated }: CreateRoleDialogProps) {
  const t = useTranslations();
  const { toast } = useToast();
  const [roleName, setRoleName] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<Permission[]>([]);
  
  const handlePermissionToggle = (permission: Permission) => {
    setSelectedPermissions(prev => 
      prev.includes(permission)
        ? prev.filter(p => p !== permission)
        : [...prev, permission]
    );
  };
  
  const handleSubmit = async () => {
    if (!roleName.trim()) {
      toast({
        title: t("Role name required"),
        description: t("Please enter a name for the role"),
        variant: "destructive"
      });
      return;
    }
    
    if (selectedPermissions.length === 0) {
      toast({
        title: t("Permissions required"),
        description: t("Please select at least one permission for the role"),
        variant: "destructive"
      });
      return;
    }
    
    try {
      const newRoleName = await createNewRole(roleName, selectedPermissions);
      toast({
        title: t("Role created"),
        description: `${t("Role")} "${newRoleName}" ${t("created successfully")}`
      });
      onRoleCreated(newRoleName.name, selectedPermissions);
      setRoleName("");
      setSelectedPermissions([]);
      onOpenChange(false);
    } catch (error) {
      toast({
        title: t("Error creating role"),
        description: error instanceof Error ? error.message : t("Unknown error"),
        variant: "destructive"
      });
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md neon-card neon-border">
        <DialogHeader>
          <DialogTitle className="rtl:text-start">{t("Create New Role")}</DialogTitle>
          <DialogDescription className="rtl:text-start">
            {t("Create a custom role with specific permissions")}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="role-name">{t("Role Name")}</Label>
            <Input 
              id="role-name" 
              placeholder={t("Enter role name")} 
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              className="neon-input"
            />
          </div>
          
          <div className="space-y-2">
            <Label>{t("Permissions")}</Label>
            <ScrollArea className="h-[300px] rounded-md border p-4" dir={t("dir") as "rtl" | "ltr"}>
              <div className="space-y-6">
                {Object.entries(permissionGroups).map(([groupName, permissions]) => (
                  <div key={groupName} className="space-y-2">
                    <h4 className="font-medium border-b pb-1">{groupName}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {permissions.map(permission => (
                        <div key={permission} className="flex items-start space-x-2">
                          <Checkbox 
                            id={`create-${permission}`}
                            checked={selectedPermissions.includes(permission)}
                            onCheckedChange={() => handlePermissionToggle(permission)}
                          />
                          <Label
                            htmlFor={`create-${permission}`}
                            className="font-medium"
                          >
                            {permission.replace(/_/g, ' ')}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => onOpenChange(false)}
          >
            {t("Cancel")}
          </Button>
          <Button 
            type="button" 
            onClick={handleSubmit}
          >
            {t("Create Role")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
