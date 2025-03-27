import { useState, useEffect } from "react";
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
import { Permission, UserRole } from "@/lib/permissions";
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
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { CreateRoleDialog } from "../CreateRoleDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { useRolesPermissions } from "@/hooks/usePermissions";
import { getAllUsers } from "@/actions/users/get-all-users";
import { getUserAdditionalPermissions } from "@/actions/auth/permissions/get-user-additional-permissions";
import { updateUser } from "@/actions/users/update-user";
import { updateUserAdditionalPermissions } from "@/actions/auth/permissions/update-user-additional-permissions";
import { updateRole } from "@/actions/auth/roles/update-role";
import { deleteRole } from "@/actions/auth/roles/delete-role";

interface User {
  id: string;
  name: string;
  email: string;
  roles: { id: string; name: string }[];
  avatar?: string | null;
  additionalPermissions?: { id: string; name: string }[];
}

export function RolePermissionManager() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedRoleForEdit, setSelectedRoleForEdit] = useState<string | null>(
    null
  );
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [isCreateRoleDialogOpen, setIsCreateRoleDialogOpen] = useState(false);
  const [rolePermissionsForEdit, setRolePermissionsForEdit] = useState<
    string[]
  >([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [pendingDeleteRole, setPendingDeleteRole] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [isEditingPermissions, setIsEditingPermissions] = useState(false);
  const [tempPermissions, setTempPermissions] = useState<string[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [savingUser, setSavingUser] = useState(false);
  const [savingRole, setSavingRole] = useState(false);
  const [userAdditionalPermissions, setUserAdditionalPermissions] = useState<
    string[]
  >([]);

  // Fetch roles and permissions from the database
  const {
    roles,
    permissions,
    loading: loadingRolesAndPermissions,
    error,
  } = useRolesPermissions();

  const selectedUser = users.find((user) => user.id === selectedUserId);
  const availableRoles = roles.map((role) => role.name);
  const availablePermissions = permissions.map(
    (permission) => permission.name as Permission
  );

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const response = await getAllUsers();
      setUsers(response);

      // If users were fetched successfully and we have a selected user, get their additional permissions
      if (selectedUserId) {
        fetchUserAdditionalPermissions(selectedUserId);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to fetch users");
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchUserAdditionalPermissions = async (userId: string) => {
    try {
      const response = await getUserAdditionalPermissions(userId);
      setUserAdditionalPermissions(
        response.map((p: { name: string }) => p.name)
      );
    } catch (error) {
      console.error(
        `Error fetching additional permissions for user ${userId}:`,
        error
      );
      toast.error("Failed to fetch user permissions");
    }
  };

  const handleUserSelect = (userId: string) => {
    setSelectedUserId(userId);
    fetchUserAdditionalPermissions(userId);
  };

  const handleAddRole = async (role: string) => {
    if (!selectedUser) return;

    try {
      setSavingUser(true);

      // Find the role object by name
      const roleObj = roles.find((r) => r.name === role);
      if (!roleObj) {
        toast.error(`Role ${role} not found`);
        return;
      }

      // Get current user roles
      const currentRoles = selectedUser.roles.map((r) => r.name);

      // Skip if role already exists
      if (currentRoles.includes(role)) return;

      // Update user roles
      await updateUser({
        id: selectedUser.id,
        name: selectedUser.name,
        email: selectedUser.email,
        roles: [...currentRoles, role],
      });

      toast.success(`Added ${role} role to ${selectedUser.name}`);
      fetchUsers(); // Refresh all users
    } catch (error) {
      console.error("Error adding role:", error);
      toast.error("Failed to add role");
    } finally {
      setSavingUser(false);
    }
  };

  const handleRemoveRole = async (role: string) => {
    if (!selectedUser) return;

    try {
      setSavingUser(true);

      // Get current user roles
      const currentRoles = selectedUser.roles.map((r) => r.name);

      // Check if this would remove all roles
      if (currentRoles.length <= 1) {
        toast.error("User must have at least one role");
        return;
      }

      // Update user roles
      await updateUser({
        id: selectedUser.id,
        name: selectedUser.name,
        email: selectedUser.email,
        roles: currentRoles.filter((r) => r !== role),
      });

      toast.success(`Removed ${role} role from ${selectedUser.name}`);
      fetchUsers(); // Refresh all users
    } catch (error) {
      console.error("Error removing role:", error);
      toast.error("Failed to remove role");
    } finally {
      setSavingUser(false);
    }
  };

  const handleTogglePermission = (permission: Permission) => {
    setUserAdditionalPermissions((prev) =>
      prev.includes(permission)
        ? prev.filter((p) => p !== permission)
        : [...prev, permission]
    );
  };

  const saveUserPermissions = async () => {
    if (!selectedUser) return;

    try {
      setSavingUser(true);

      await updateUserAdditionalPermissions(
        selectedUser.id,
        userAdditionalPermissions
      );

      toast.success(`Updated permissions for ${selectedUser.name}`);
      fetchUsers(); // Refresh all users
    } catch (error) {
      console.error("Error saving user permissions:", error);
      toast.error("Failed to save user permissions");
    } finally {
      setSavingUser(false);
    }
  };

  const handleRoleCreated = (roleName: string) => {
    // Refresh roles
    toast.success(`New role "${roleName}" created`);
    // The useRolesPermissions hook will automatically refresh
  };

  const handleRoleSelect = (role: { id: string; name: string }) => {
    // Finish any editing in progress
    if (isEditingPermissions) {
      setIsEditingPermissions(false);
    }

    setSelectedRoleForEdit(role.name);
    setSelectedRoleId(role.id);

    // Get current permissions for this role
    const currentRoleObj = roles.find((r) => r.id === role.id);
    if (currentRoleObj) {
      const rolePermissions = currentRoleObj.permissions.map((p) => p.name);
      setRolePermissionsForEdit(rolePermissions);
      setTempPermissions(rolePermissions);
    } else {
      setRolePermissionsForEdit([]);
      setTempPermissions([]);
    }
  };

  const handleToggleRolePermission = (permission: Permission) => {
    if (!selectedRoleForEdit || !isEditingPermissions) return;

    // Don't allow editing built-in roles
    if (Object.values(UserRole).includes(selectedRoleForEdit as UserRole)) {
      toast.error("Built-in roles cannot be modified");
      return;
    }

    setTempPermissions((prev) =>
      prev.includes(permission)
        ? prev.filter((p) => p !== permission)
        : [...prev, permission]
    );
  };

  const handleUpdateRole = async () => {
    if (!selectedRoleId || !selectedRoleForEdit) return;

    try {
      setSavingRole(true);

      await updateRole(selectedRoleId, selectedRoleForEdit, tempPermissions);

      setRolePermissionsForEdit(tempPermissions);
      setIsEditingPermissions(false);
      toast.success(`Role "${selectedRoleForEdit}" permissions updated`);

      // The useRolesPermissions hook will automatically refresh
    } catch (error) {
      console.error("Error updating role:", error);
      toast.error("Failed to update role permissions");
    } finally {
      setSavingRole(false);
    }
  };

  const confirmDeleteRole = (role: { id: string; name: string }) => {
    setPendingDeleteRole(role);
    setShowDeleteConfirm(true);
  };

  const executeDeleteRole = async () => {
    if (!pendingDeleteRole) return;

    try {
      await deleteRole(pendingDeleteRole.id);

      if (selectedRoleId === pendingDeleteRole.id) {
        setSelectedRoleForEdit(null);
        setSelectedRoleId(null);
      }

      toast.success(`Role "${pendingDeleteRole.name}" deleted successfully`);

      // The useRolesPermissions hook will automatically refresh
    } catch (error: any) {
      console.error("Error deleting role:", error);

      // Check if error is due to role being assigned to users
      if (error.response?.data?.error?.includes("assigned to users")) {
        toast.error(
          `Cannot delete role: it is assigned to ${error.response.data.userCount} user(s)`
        );
      } else {
        toast.error("Failed to delete role");
      }
    } finally {
      setShowDeleteConfirm(false);
      setPendingDeleteRole(null);
    }
  };

  const startEditingPermissions = () => {
    if (!selectedRoleForEdit) return;

    if (Object.values(UserRole).includes(selectedRoleForEdit as UserRole)) {
      toast.error("Built-in roles cannot be modified");
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

    // Find all role objects for this user
    const userRoleObjects = selectedUser.roles
      .map((role) => roles.find((r) => r.name === role.name))
      .filter(Boolean);

    // Check if any role grants this permission
    return userRoleObjects.some((role) =>
      role?.permissions.some((p) => p.name === permission)
    );
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
    "Discount Management": [
      Permission.VIEW_DISCOUNTS,
      Permission.CREATE_DISCOUNT,
      Permission.UPDATE_DISCOUNT,
      Permission.DELETE_DISCOUNT,
    ],
  };

  // Show loading state while data is being fetched
  if (loadingRolesAndPermissions || loadingUsers) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Role & Permission Management</CardTitle>
          <CardDescription>Loading data...</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center p-10">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p>Loading roles and permissions...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show error state if data fetch failed
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Role & Permission Management</CardTitle>
          <CardDescription>An error occurred</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-destructive/10 text-destructive rounded-md">
            Failed to load roles and permissions. Please try again later.
          </div>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Reload page
          </Button>
        </CardContent>
      </Card>
    );
  }

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
                              key={role.id}
                              className="flex items-center gap-1 bg-accent rounded-full px-3 py-1"
                            >
                              <span>{role.name}</span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-5 w-5 rounded-full"
                                onClick={() => handleRemoveRole(role.name)}
                                disabled={savingUser}
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
                            onValueChange={(value) => handleAddRole(value)}
                          >
                            <SelectTrigger id="add-role" className="w-full">
                              <SelectValue placeholder="Select role to add" />
                            </SelectTrigger>
                            <SelectContent>
                              {availableRoles
                                .filter(
                                  (role) =>
                                    !selectedUser.roles.some(
                                      (r) => r.name === role
                                    )
                                )
                                .map((role) => (
                                  <SelectItem key={role} value={role}>
                                    {role}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <Button
                          size="sm"
                          className="flex items-center gap-1"
                          disabled={savingUser}
                        >
                          {savingUser ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Plus className="h-4 w-4" />
                          )}
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
                  <Button onClick={saveUserPermissions} disabled={savingUser}>
                    {savingUser ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
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
                              userAdditionalPermissions.includes(permission);

                            return (
                              <div
                                key={permission}
                                className="flex items-start space-x-2"
                              >
                                <Checkbox
                                  id={permission}
                                  checked={fromRole || isAdditional}
                                  disabled={fromRole || savingUser} // Can't remove permissions from roles
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
                                        .filter((role) => {
                                          const roleObj = roles.find(
                                            (r) => r.name === role.name
                                          );
                                          return roleObj?.permissions.some(
                                            (p) => p.name === permission
                                          );
                                        })
                                        .map((role) => role.name)
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
                      {roles.map((role) => (
                        <div
                          key={role.id}
                          className={`p-2 rounded-md cursor-pointer transition-colors flex justify-between items-center ${
                            selectedRoleId === role.id
                              ? "bg-primary text-primary-foreground"
                              : "hover:bg-accent"
                          }`}
                        >
                          <div
                            className="flex-1"
                            onClick={() => handleRoleSelect(role)}
                          >
                            <div className="font-medium">{role.name}</div>
                            <div className="text-xs opacity-90">
                              {isBuiltInRole(role.name)
                                ? "Built-in role"
                                : "Custom role"}
                            </div>
                          </div>

                          {!isBuiltInRole(role.name) && (
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
                                disabled={savingRole}
                              >
                                {savingRole ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Save className="h-4 w-4" />
                                )}
                                <span>Save</span>
                              </Button>
                              <Button
                                onClick={cancelEditingPermissions}
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-1"
                                disabled={savingRole}
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
                                          !isEditingPermissions ||
                                          savingRole
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
              This will permanently delete the role &quot;
              {pendingDeleteRole?.name}&quot;. This action cannot be undone.
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
