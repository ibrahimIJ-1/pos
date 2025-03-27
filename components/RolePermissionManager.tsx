import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Permission,
  UserRole,
  rolePermissions,
  User,
  getAllRoles,
  getRolePermissions,
  updateRolePermissions,
  deleteRole,
} from "@/lib/permissions";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Shield,
  UserCog,
  Plus,
  Trash2,
  Settings,
  Save,
  RefreshCcw,
  X,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CreateRoleDialog } from "./CreateRoleDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";

// Sample users with multiple roles
const sampleUsers: User[] = [
  {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    roles: [UserRole.ADMIN],
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane@example.com",
    roles: [UserRole.MANAGER, UserRole.CASHIER],
    additionalPermissions: [Permission.ISSUE_REFUND],
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jane",
  },
  {
    id: "3",
    name: "Bob Johnson",
    email: "bob@example.com",
    roles: [UserRole.EDITOR, UserRole.INVENTORY_CLERK],
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Bob",
  },
  {
    id: "4",
    name: "Alice Brown",
    email: "alice@example.com",
    roles: [UserRole.VIEWER, UserRole.CASHIER],
    additionalPermissions: [Permission.VIEW_ANALYTICS],
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alice",
  },
];

export function RolePermissionManager() {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>(sampleUsers);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedRoleForEdit, setSelectedRoleForEdit] = useState<string | null>(
    null
  );
  const [availableRoles, setAvailableRoles] = useState<string[]>(getAllRoles());
  // const [availablePermissions] = useState<Permission[]>(
  //   Object.values(Permission)
  // );
  const [isCreateRoleDialogOpen, setIsCreateRoleDialogOpen] = useState(false);
  const [rolePermissionsForEdit, setRolePermissionsForEdit] = useState<
    Permission[]
  >([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [pendingDeleteRole, setPendingDeleteRole] = useState<string | null>(
    null
  );
  const [isEditingPermissions, setIsEditingPermissions] = useState(false);
  const [tempPermissions, setTempPermissions] = useState<Permission[]>([]);

  const selectedUser = users.find((user) => user.id === selectedUserId);

  const handleUserSelect = (userId: string) => {
    setSelectedUserId(userId);
  };

  const handleAddRole = (role: string) => {
    if (!selectedUser || selectedUser.roles.includes(role)) return;

    const updatedUsers = users.map((user) => {
      if (user.id === selectedUserId) {
        return {
          ...user,
          roles: [...user.roles, role],
        };
      }
      return user;
    });

    setUsers(updatedUsers);
    toast({
      title: "Role added",
      description: `Added ${role} role to ${selectedUser.name}`,
    });
  };

  const handleRemoveRole = (role: string) => {
    if (!selectedUser || selectedUser.roles.length <= 1) {
      toast({
        title: "Cannot remove role",
        description: "User must have at least one role",
        variant: "destructive",
      });
      return;
    }

    const updatedUsers = users.map((user) => {
      if (user.id === selectedUserId) {
        return {
          ...user,
          roles: user.roles.filter((r) => r !== role),
        };
      }
      return user;
    });

    setUsers(updatedUsers);
    toast({
      title: "Role removed",
      description: `Removed ${role} role from ${selectedUser.name}`,
    });
  };

  const handleTogglePermission = (permission: Permission) => {
    if (!selectedUser) return;

    const updatedUsers = users.map((user) => {
      if (user.id === selectedUserId) {
        const additionalPermissions = user.additionalPermissions || [];
        const permissionExists = additionalPermissions.includes(permission);

        return {
          ...user,
          additionalPermissions: permissionExists
            ? additionalPermissions.filter((p) => p !== permission)
            : [...additionalPermissions, permission],
        };
      }
      return user;
    });

    setUsers(updatedUsers);
  };

  const handleRoleCreated = (roleName: string) => {
    setAvailableRoles(getAllRoles());
    toast({
      title: "Role created",
      description: `New role "${roleName}" is now available`,
    });
  };

  const handleRoleSelect = (role: string) => {
    // Finish any editing in progress
    if (isEditingPermissions) {
      setIsEditingPermissions(false);
    }

    setSelectedRoleForEdit(role);
    const currentPermissions = getRolePermissions(role);
    setRolePermissionsForEdit(currentPermissions);
    setTempPermissions(currentPermissions);
  };

  const handleToggleRolePermission = (permission: Permission) => {
    if (!selectedRoleForEdit || !isEditingPermissions) return;

    // Don't allow editing built-in roles
    if (Object.values(UserRole).includes(selectedRoleForEdit as UserRole)) {
      toast({
        title: "Cannot modify built-in role",
        description: "Built-in roles cannot be modified",
        variant: "destructive",
      });
      return;
    }

    setTempPermissions((prev) =>
      prev.includes(permission)
        ? prev.filter((p) => p !== permission)
        : [...prev, permission]
    );
  };

  const handleUpdateRole = () => {
    if (!selectedRoleForEdit) return;

    try {
      updateRolePermissions(selectedRoleForEdit, tempPermissions);
      setRolePermissionsForEdit(tempPermissions);
      setIsEditingPermissions(false);
      toast({
        title: "Role updated",
        description: `Role "${selectedRoleForEdit}" permissions updated`,
      });
    } catch (error) {
      toast({
        title: "Error updating role",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  const confirmDeleteRole = (role: string) => {
    setPendingDeleteRole(role);
    setShowDeleteConfirm(true);
  };

  const executeDeleteRole = () => {
    if (!pendingDeleteRole) return;

    try {
      // Check if any user is using this role
      const usersWithRole = users.filter((user) =>
        user.roles.includes(pendingDeleteRole)
      );
      if (usersWithRole.length > 0) {
        toast({
          title: "Cannot delete role",
          description: `Role "${pendingDeleteRole}" is assigned to ${usersWithRole.length} user(s)`,
          variant: "destructive",
        });
        return;
      }

      deleteRole(pendingDeleteRole);
      setAvailableRoles(getAllRoles());
      if (selectedRoleForEdit === pendingDeleteRole) {
        setSelectedRoleForEdit(null);
      }
      toast({
        title: "Role deleted",
        description: `Role "${pendingDeleteRole}" deleted successfully`,
      });
    } catch (error) {
      toast({
        title: "Error deleting role",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setShowDeleteConfirm(false);
      setPendingDeleteRole(null);
    }
  };

  const startEditingPermissions = () => {
    if (!selectedRoleForEdit) return;

    if (Object.values(UserRole).includes(selectedRoleForEdit as UserRole)) {
      toast({
        title: "Cannot modify built-in role",
        description: "Built-in roles cannot be modified",
        variant: "destructive",
      });
      return;
    }

    setTempPermissions([...rolePermissionsForEdit]);
    setIsEditingPermissions(true);
  };

  const cancelEditingPermissions = () => {
    setTempPermissions([...rolePermissionsForEdit]);
    setIsEditingPermissions(false);
  };

  // Check if a permission is granted through roles
  const isPermissionFromRole = (permission: Permission): boolean => {
    if (!selectedUser) return false;
    return selectedUser.roles.some((role) =>
      rolePermissions[role]?.includes(permission)
    );
  };

  // Check if permission is in additional permissions
  const isAdditionalPermission = (permission: Permission): boolean => {
    if (!selectedUser || !selectedUser.additionalPermissions) return false;
    return selectedUser.additionalPermissions.includes(permission);
  };

  // Is the selected role a built-in role
  const isBuiltInRole = (role: string): boolean => {
    return Object.values(UserRole).includes(role as UserRole);
  };

  // Grouped permissions for better UI organization
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

  return (
    <Card className="neon-card neon-border">
      <CardHeader>
        <CardTitle>Role & Permission Management</CardTitle>
        <CardDescription>
          Manage user roles and additional permissions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="users">
          <TabsList className="mb-4">
            <TabsTrigger value="users" className="flex items-center gap-1">
              <UserCog className="h-4 w-4" />
              <span>User Roles</span>
            </TabsTrigger>
            <TabsTrigger
              value="permissions"
              className="flex items-center gap-1"
            >
              <Shield className="h-4 w-4" />
              <span>Permissions</span>
            </TabsTrigger>
            <TabsTrigger value="roles" className="flex items-center gap-1">
              <Settings className="h-4 w-4" />
              <span>Manage Roles</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Select User</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px] pr-4">
                    <div className="space-y-2">
                      {users.map((user) => (
                        <div
                          key={user.id}
                          className={`p-2 rounded-md cursor-pointer transition-colors flex items-center gap-2 ${
                            selectedUserId === user.id
                              ? "bg-primary text-primary-foreground"
                              : "hover:bg-accent"
                          }`}
                          onClick={() => handleUserSelect(user.id)}
                        >
                          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                            {user.avatar ? (
                              <img
                                src={user.avatar}
                                alt={user.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <span>{user.name.charAt(0)}</span>
                            )}
                          </div>
                          <div>
                            <div className="font-medium">{user.name}</div>
                            <div className="text-xs opacity-90">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="text-lg">User Roles</CardTitle>
                  <CardDescription>
                    {selectedUser
                      ? `Manage roles for ${selectedUser.name}`
                      : "Select a user to manage their roles"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {selectedUser ? (
                    <div className="space-y-4">
                      <div>
                        <Label>Current Roles</Label>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {selectedUser.roles.map((role) => (
                            <div
                              key={role}
                              className="flex items-center gap-1 bg-accent rounded-full px-3 py-1"
                            >
                              <span>{role}</span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-5 w-5 rounded-full"
                                onClick={() => handleRemoveRole(role)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-2 items-end">
                        <div className="space-y-2 flex-1">
                          <Label htmlFor="add-role">Add Role</Label>
                          <Select
                            onValueChange={(value: UserRole) =>
                              handleAddRole(value as UserRole)
                            }
                          >
                            <SelectTrigger id="add-role" className="w-full">
                              <SelectValue placeholder="Select role to add" />
                            </SelectTrigger>
                            <SelectContent>
                              {availableRoles
                                .filter(
                                  (role) => !selectedUser.roles.includes(role)
                                )
                                .map((role) => (
                                  <SelectItem key={role} value={role}>
                                    {role}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <Button size="sm" className="flex items-center gap-1">
                          <Plus className="h-4 w-4" />
                          <span>Add</span>
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                      Select a user to manage their roles
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="permissions" className="space-y-4">
            {selectedUser ? (
              <div>
                <div className="mb-4 flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-medium mb-1">
                      Additional Permissions for {selectedUser.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Grant additional permissions beyond those provided by
                      roles
                    </p>
                  </div>
                  <Button
                    onClick={() =>
                      toast({
                        title: "Permissions saved",
                        description: "User permissions updated successfully",
                      })
                    }
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Permissions
                  </Button>
                </div>

                <div className="space-y-6">
                  {Object.entries(permissionGroups).map(
                    ([groupName, permissions]) => (
                      <div key={groupName} className="space-y-2">
                        <h4 className="font-medium border-b pb-1">
                          {groupName}
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {permissions.map((permission) => {
                            const fromRole = isPermissionFromRole(permission);
                            const isAdditional =
                              isAdditionalPermission(permission);

                            return (
                              <div
                                key={permission}
                                className="flex items-start space-x-2"
                              >
                                <Checkbox
                                  id={permission}
                                  checked={fromRole || isAdditional}
                                  disabled={fromRole} // Can't remove permissions from roles
                                  onCheckedChange={() =>
                                    handleTogglePermission(permission)
                                  }
                                />
                                <div className="space-y-1 leading-none">
                                  <Label
                                    htmlFor={permission}
                                    className={`font-medium ${
                                      fromRole ? "opacity-70" : ""
                                    }`}
                                  >
                                    {permission.replace(/_/g, " ")}
                                  </Label>
                                  {fromRole && (
                                    <p className="text-xs text-muted-foreground">
                                      From role:{" "}
                                      {selectedUser.roles
                                        .filter((role) =>
                                          rolePermissions[role].includes(
                                            permission
                                          )
                                        )
                                        .join(", ")}
                                    </p>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                Select a user to manage their permissions
              </div>
            )}
          </TabsContent>

          <TabsContent value="roles" className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Manage Roles</h3>
              <Button
                onClick={() => setIsCreateRoleDialogOpen(true)}
                className="flex items-center gap-1"
              >
                <Plus className="h-4 w-4" />
                <span>Create Role</span>
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Select Role</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px] pr-4">
                    <div className="space-y-2">
                      {availableRoles.map((role) => (
                        <div
                          key={role}
                          className={`p-2 rounded-md cursor-pointer transition-colors flex justify-between items-center ${
                            selectedRoleForEdit === role
                              ? "bg-primary text-primary-foreground"
                              : "hover:bg-accent"
                          }`}
                        >
                          <div
                            className="flex-1"
                            onClick={() => handleRoleSelect(role)}
                          >
                            <div className="font-medium">{role}</div>
                            <div className="text-xs opacity-90">
                              {isBuiltInRole(role)
                                ? "Built-in role"
                                : "Custom role"}
                            </div>
                          </div>

                          {!isBuiltInRole(role) && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => confirmDeleteRole(role)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-lg">
                        Role Permissions
                      </CardTitle>
                      <CardDescription>
                        {selectedRoleForEdit
                          ? `Manage permissions for ${selectedRoleForEdit} role${
                              isBuiltInRole(selectedRoleForEdit)
                                ? " (read-only)"
                                : ""
                            }`
                          : "Select a role to manage its permissions"}
                      </CardDescription>
                    </div>

                    {selectedRoleForEdit &&
                      !isBuiltInRole(selectedRoleForEdit) && (
                        <div className="flex gap-2">
                          {isEditingPermissions ? (
                            <>
                              <Button
                                onClick={handleUpdateRole}
                                variant="default"
                                size="sm"
                                className="flex items-center gap-1"
                              >
                                <Save className="h-4 w-4" />
                                <span>Save</span>
                              </Button>
                              <Button
                                onClick={cancelEditingPermissions}
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-1"
                              >
                                <X className="h-4 w-4" />
                                <span>Cancel</span>
                              </Button>
                            </>
                          ) : (
                            <Button
                              onClick={startEditingPermissions}
                              variant="outline"
                              size="sm"
                              className="flex items-center gap-1"
                            >
                              <RefreshCcw className="h-4 w-4" />
                              <span>Edit</span>
                            </Button>
                          )}
                        </div>
                      )}
                  </div>
                </CardHeader>
                <CardContent>
                  {selectedRoleForEdit ? (
                    <div className="space-y-4">
                      <ScrollArea className="h-[350px] pr-4">
                        <div className="space-y-6">
                          {Object.entries(permissionGroups).map(
                            ([groupName, permissions]) => (
                              <div key={groupName} className="space-y-2">
                                <h4 className="font-medium border-b pb-1">
                                  {groupName}
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                  {permissions.map((permission) => (
                                    <div
                                      key={permission}
                                      className="flex items-start space-x-2"
                                    >
                                      <Checkbox
                                        id={`role-${permission}`}
                                        checked={
                                          isEditingPermissions
                                            ? tempPermissions.includes(
                                                permission
                                              )
                                            : rolePermissionsForEdit.includes(
                                                permission
                                              )
                                        }
                                        disabled={
                                          isBuiltInRole(selectedRoleForEdit) ||
                                          !isEditingPermissions
                                        }
                                        onCheckedChange={() =>
                                          handleToggleRolePermission(permission)
                                        }
                                      />
                                      <Label
                                        htmlFor={`role-${permission}`}
                                        className={`font-medium ${
                                          isBuiltInRole(selectedRoleForEdit) ||
                                          !isEditingPermissions
                                            ? "opacity-70"
                                            : ""
                                        }`}
                                      >
                                        {permission.replace(/_/g, " ")}
                                      </Label>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </ScrollArea>
                    </div>
                  ) : (
                    <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                      Select a role to manage its permissions
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>

      <CreateRoleDialog
        open={isCreateRoleDialogOpen}
        onOpenChange={setIsCreateRoleDialogOpen}
        onRoleCreated={handleRoleCreated}
      />

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the role &quot;{pendingDeleteRole}&quot;. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={executeDeleteRole}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
