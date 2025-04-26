"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import {
  ArrowUpDown,
  MoreHorizontal,
  UserPlus,
  Lock,
  Unlock,
  KeyRound,
  UserCog,
  Trash,
} from "lucide-react";
import { UserRole, Permission } from "@/lib/permissions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePermissions, useRolesPermissions } from "@/hooks/usePermissions";
import { Badge } from "@/components/ui/badge";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { getAllUsers } from "@/actions/users/get-all-users";
import { createNewUser } from "@/actions/users/create-new-user";
import { updateUser, updateUserPassword } from "@/actions/users/update-user";
import { deleteUserById } from "@/actions/users/delete-user";
import { Branch } from "@prisma/client";
import { useBranches } from "@/lib/branches-service";
import { useTranslations } from "next-intl";

// Define the shape of our user
interface UserData {
  id: string;
  name: string;
  email: string;
  roles: { id: string; name: string }[];
  avatar?: string | null;
  active?: boolean;
  created_at?: Date;
  updated_at?: Date;
  branches: Branch[];
}

// Schema for adding/editing users

const roleBadgeColors: Record<string, string> = {
  [UserRole.ADMIN]: "bg-red-500 hover:bg-red-600",
  [UserRole.MANAGER]: "bg-blue-500 hover:bg-blue-600",
  [UserRole.EDITOR]: "bg-green-500 hover:bg-green-600",
  [UserRole.VIEWER]: "bg-gray-500 hover:bg-gray-600",
  [UserRole.CASHIER]: "bg-yellow-500 hover:bg-yellow-600",
  [UserRole.INVENTORY_CLERK]: "bg-purple-500 hover:bg-purple-600",
  [UserRole.ACCOUNTANT]: "bg-pink-500 hover:bg-pink-600",
};

export default function UsersPage() {
  const t = useTranslations();
  const userFormSchema = z.object({
    name: z.string().min(2, {
      message: t("Name must be at least 2 characters"),
    }),
    email: z.string().email({
      message: t("Please enter a valid email address"),
    }),
    password: z
      .string()
      .min(6, {
        message: t("Password must be at least 6 characters"),
      })
      .optional(),
    roles: z.array(z.string()).min(1, {
      message: t("Please select at least one role"),
    }),
    active: z.boolean().default(true),
    branches: z
      .array(z.string())
      .min(1, t("At least one branch must be selected")),
  });

  // Schema for changing password
  const passwordFormSchema = z
    .object({
      password: z.string().min(6, {
        message: t("Password must be at least 6 characters"),
      }),
      confirmPassword: z.string().min(6, {
        message: t("Password must be at least 6 characters"),
      }),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("Passwords don't match"),
      path: ["confirmPassword"],
    });
  const { toast } = useToast();
  const [data, setData] = useState<UserData[]>([]);
  const { checkPermission } = usePermissions(UserRole.ADMIN);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const { roles } = useRolesPermissions();
  const { data: branches } = useBranches();

  // Form for adding new users
  const addForm = useForm<z.infer<typeof userFormSchema>>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: "",
      email: "",
      roles: [UserRole.VIEWER],
      active: true,
      branches: [],
    },
  });

  // Form for editing users
  const editForm = useForm<z.infer<typeof userFormSchema>>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: "",
      email: "",
      roles: [],
      active: true,
      branches: [],
    },
  });

  // Form for changing password
  const passwordForm = useForm<z.infer<typeof passwordFormSchema>>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  // Fetch all users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await getAllUsers();
      setData(response);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: t("Error"),
        description: t("Failed to fetch users"),
        variant: "destructive",
      });
    } finally {
    }
  };

  // Handle adding a new user
  const onAddUser = async (values: z.infer<typeof userFormSchema>) => {
    try {
      toast({
        title: t("Creating user"),
        description: t("Please wait") + "...",
      });

      const response = await createNewUser(
        values.name,
        values.email,
        values.password ?? "12345678",
        values.roles,
        true,
        values.branches
      );

      setData([...data, response]);

      toast({
        title: t("User created"),
        description: `${t("User")} ${values.name} ${t(
          "was successfully created"
        )}.`,
      });

      setOpenAddDialog(false);
      addForm.reset();
    } catch (error) {
      console.error("Error creating user:", error);
      toast({
        title: t("Error"),
        description: t("Failed to create user"),
        variant: "destructive",
      });
    }
  };

  // Handle editing a user
  const onEditUser = async (values: z.infer<typeof userFormSchema>) => {
    if (!selectedUser) return;

    try {
      toast({
        title: t("Updating user"),
        description: t("Please wait") + "...",
      });

      const response = await updateUser({
        id: selectedUser.id,
        name: values.name,
        email: values.email,
        roles: values.roles,
        active: values.active,
        branches: values.branches,
        ...(values.password ? { password: values.password } : {}),
      });

      // Update the user in the data array
      setData(
        data.map((user) => (user.id === selectedUser.id ? response : user))
      );

      toast({
        title: t("User updated"),
        description: `${t("User")} ${values.name} ${t(
          "was successfully updated"
        )}.`,
      });

      setOpenEditDialog(false);
    } catch (error) {
      console.error("Error updating user:", error);
      toast({
        title: t("Error"),
        description: t("Failed to update user"),
        variant: "destructive",
      });
    }
  };

  // Handle changing a user's password
  const onChangePassword = async (
    values: z.infer<typeof passwordFormSchema>
  ) => {
    if (!selectedUser) return;

    try {
      toast({
        title: t("Updating password"),
        description: t("Please wait") + "...",
      });

      await updateUserPassword({
        id: selectedUser.id,
        password: values.password,
      });

      toast({
        title: t("Password updated"),
        description: `${t("Password for")} ${selectedUser.name} ${t("was successfully updated")}.`,
      });

      setOpenPasswordDialog(false);
      passwordForm.reset();
    } catch (error) {
      console.error("Error updating password:", error);
      toast({
        title: t("Error"),
        description: t("Failed to update password"),
        variant: "destructive",
      });
    }
  };

  // Handle locking/unlocking a user
  const toggleUserStatus = async (user: UserData) => {
    try {
      const newStatus = !(user.active ?? true);
      const action = newStatus ? t("Activating") : t("Deactivating");

      toast({
        title: `${action} ${t("user")}`,
        description: t("Please wait") + "...",
      });

      const response = await updateUser({
        id: user.id,
        name: user.name,
        email: user.email,
        active: newStatus,
        roles: user.roles.map((r) => r.name),
      });

      // Update the user in the data array
      setData(data.map((u) => (u.id === user.id ? response : u)));

      toast({
        title: `${t("User")} ${newStatus ? t("activated") : t("deactivated")}`,
        description: `${t("User")} ${user.name} ${t("was successfully")} ${
newStatus ? t("activated") : t("deactivated")
        }.`,
      });
    } catch (error) {
      console.error("Error toggling user status:", error);
      toast({
        title: t("Error"),
        description: `${t("Failed to")} ${
          user.active ? t("deactivate") : t("activate")
        } ${t("user")}`,
        variant: "destructive",
      });
    }
  };

  // Handle deleting a user
  const deleteUser = async (user: UserData) => {
    try {
      toast({
        title: t("Deleting user"),
        description: t("Please wait") + "...",
      });

      await deleteUserById(user.id);

      // Remove the user from the data array
      setData(data.filter((u) => u.id !== user.id));

      toast({
        title: t("User deleted"),
        description: `${t("User")} ${user.name} ${t(
          "was successfully deleted"
        )}.`,
      });
    } catch (error) {
      console.error("Error deleting user:", error);
      toast({
        title: t("Error"),
        description: t("Failed to delete user"),
        variant: "destructive",
      });
    }
  };

  // Set up edit form when a user is selected
  useEffect(() => {
    if (selectedUser && openEditDialog) {
      editForm.reset({
        name: selectedUser.name,
        email: selectedUser.email,
        roles: selectedUser.roles.map((r) => r.name),
        active: selectedUser.active ?? true,
        branches: selectedUser.branches.map((b) => b.id),
      });
    }
  }, [selectedUser, openEditDialog, editForm]);

  // Handle opening the edit dialog
  const handleEditUser = (user: UserData) => {
    setSelectedUser(user);
    setOpenEditDialog(true);
  };

  // Handle opening the password dialog
  const handleChangePassword = (user: UserData) => {
    setSelectedUser(user);
    setOpenPasswordDialog(true);
    passwordForm.reset();
  };

  // Define table columns
  const columns: ColumnDef<UserData>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <div
            className="flex items-center cursor-pointer"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {t("Name")}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </div>
        );
      },
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.avatar ?? undefined} alt={user.name} />
              <AvatarFallback>
                {user.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span>{user.name}</span>
              {user.active === false && (
                <Badge
                  variant="outline"
                  className="text-red-500 border-red-500"
                >
                  {t("Inactive")}
                </Badge>
              )}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "email",
      header: t("Email"),
    },
    {
      accessorKey: "roles",
      header: t("Roles"),
      cell: ({ row }) => {
        const roles = row.getValue("roles") as { id: string; name: string }[];

        return (
          <div className="flex flex-wrap gap-1">
            {roles.map((role) => (
              <Badge
                key={role.id}
                variant="secondary"
                className={roleBadgeColors[role.name] || "bg-gray-500"}
              >
                {role.name}
              </Badge>
            ))}
          </div>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const user = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">{t("Open menu")}</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{t("Actions")}</DropdownMenuLabel>
              <DropdownMenuSeparator />

              {checkPermission(Permission.EDIT_USERS) && (
                <>
                  <DropdownMenuItem onClick={() => handleEditUser(user)}>
                    <UserCog className="mr-2 h-4 w-4" />
                    {t("Edit user")}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleChangePassword(user)}>
                    <KeyRound className="mr-2 h-4 w-4" />
                    {t("Change password")}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => toggleUserStatus(user)}>
                    {user.active === false ? (
                      <>
                        <Unlock className="mr-2 h-4 w-4" />
                        {t("Activate user")}
                      </>
                    ) : (
                      <>
                        <Lock className="mr-2 h-4 w-4" />
                        {t("Deactivate user")}
                      </>
                    )}
                  </DropdownMenuItem>
                </>
              )}

              {checkPermission(Permission.DELETE_USER) && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                      <Trash className="mr-2 h-4 w-4" />
                      {t("Delete user")}
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="rtl:text-start">
                        {t("Are you sure")}?
                      </AlertDialogTitle>
                      <AlertDialogDescription className="rtl:text-start">
                        {t("This action cannot be undone")}.{" "}
                        {t("This will permanently delete the user and remove their data from our servers")}
                        .
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>{t("Cancel")}</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-red-500 hover:bg-red-600"
                        onClick={() => deleteUser(user)}
                      >
                        {t("Delete")}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">{t("Users")}</h1>
        {checkPermission(Permission.CREATE_USER) && (
          <Dialog open={openAddDialog} onOpenChange={setOpenAddDialog}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-1">
                <UserPlus className="h-4 w-4" />
                <span>{t("Add User")}</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle className="rtl:text-start">
                  {t("Add New User")}
                </DialogTitle>
                <DialogDescription className="rtl:text-start">
                  {t("Create a new user account to give someone access to the system")}.
                </DialogDescription>
              </DialogHeader>
              <Form {...addForm}>
                <form
                  onSubmit={addForm.handleSubmit(onAddUser)}
                  className="space-y-4"
                >
                  <FormField
                    control={addForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("Name")}</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={addForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("Email")}</FormLabel>
                        <FormControl>
                          <Input placeholder="john@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={addForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("Password")}</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="••••••"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={addForm.control}
                    name="branches"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("Select Branches")}</FormLabel>
                        <div className="border rounded-md p-2 max-h-40 overflow-y-auto space-y-2">
                          {branches?.map((branch) => (
                            <div
                              key={branch.id}
                              className="flex items-center space-x-2"
                            >
                              <Checkbox
                                id={`branch-${branch.id}`}
                                checked={field.value?.includes(branch.id)}
                                onCheckedChange={(checked) => {
                                  const newValue = checked
                                    ? [...(field.value || []), branch.id]
                                    : (field.value || []).filter(
                                        (id: string) => id !== branch.id
                                      );
                                  field.onChange(newValue);
                                }}
                              />
                              <label
                                htmlFor={`branch-${branch.id}`}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                {branch.name}
                              </label>
                            </div>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={addForm.control}
                    name="roles"
                    render={() => (
                      <FormItem>
                        <div className="mb-4">
                          <FormLabel>{t("Roles")}</FormLabel>
                          <FormDescription>
                            {t("Select the roles for this user")}
                          </FormDescription>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          {roles.map((role) => (
                            <FormField
                              key={role.id}
                              control={addForm.control}
                              name="roles"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={role.id}
                                    className="flex flex-row items-start space-x-3 space-y-0"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(
                                          role.name
                                        )}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([
                                                ...field.value,
                                                role.name,
                                              ])
                                            : field.onChange(
                                                field.value?.filter(
                                                  (value) => value !== role.name
                                                )
                                              );
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="font-normal">
                                      {role.name}
                                    </FormLabel>
                                  </FormItem>
                                );
                              }}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button type="submit">{t("Create User")}</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="rounded-md border p-6">
        <Tabs
          defaultValue="all"
          value={activeTab}
          onValueChange={setActiveTab}
          className="mb-6"
        >
          <TabsList>
            <TabsTrigger value="all">{t("All Users")}</TabsTrigger>
            <TabsTrigger value="active">{t("Active")}</TabsTrigger>
            <TabsTrigger value="inactive">{t("Inactive")}</TabsTrigger>
          </TabsList>
        </Tabs>

        <DataTable
          columns={columns}
          data={data.filter((user) => {
            if (activeTab === "active") return user.active !== false;
            if (activeTab === "inactive") return user.active === false;
            return true;
          })}
          filterColumn="name"
          filterPlaceholder={t("Filter users") + "..."}
        />
      </div>

      {/* Edit User Dialog */}
      <Dialog open={openEditDialog} onOpenChange={setOpenEditDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="rtl:text-start">{t("Edit User")}</DialogTitle>
            <DialogDescription className="rtl:text-start">
              {t("Update user details and roles")}.
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <Form {...editForm}>
              <form
                onSubmit={editForm.handleSubmit(onEditUser)}
                className="space-y-4"
              >
                <FormField
                  control={editForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("Name")}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("Email")}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="branches"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("Select Branches")}</FormLabel>
                      <div className="border rounded-md p-2 max-h-40 overflow-y-auto space-y-2">
                        {branches?.map((branch) => (
                          <div
                            key={branch.id}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              id={`branch-${branch.id}`}
                              checked={field.value?.includes(branch.id)}
                              onCheckedChange={(checked) => {
                                const newValue = checked
                                  ? [...(field.value || []), branch.id]
                                  : (field.value || []).filter(
                                      (id: string) => id !== branch.id
                                    );
                                field.onChange(newValue);
                              }}
                            />
                            <label
                              htmlFor={`branch-${branch.id}`}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {branch.name}
                            </label>
                          </div>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="active"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          {t("User Status")}
                        </FormLabel>
                        <FormDescription>
                          {field.value ? t("User is active") : t("User is inactive")}
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={selectedUser?.id === "1"} // Prevent changing status of first user (assumed admin)
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="roles"
                  render={() => (
                    <FormItem>
                      <div className="mb-4">
                        <FormLabel>{t("Roles")}</FormLabel>
                        <FormDescription className="rtl:text-start">
                          {t("Select the roles for this user")}
                        </FormDescription>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        {roles.map((role) => (
                          <FormField
                            key={role.id}
                            control={editForm.control}
                            name="roles"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={role.id}
                                  className="flex flex-row items-start space-x-3 space-y-0"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(role.name)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([
                                              ...field.value,
                                              role.name,
                                            ])
                                          : field.onChange(
                                              field.value?.filter(
                                                (value) => value !== role.name
                                              )
                                            );
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal">
                                    {role.name}
                                  </FormLabel>
                                </FormItem>
                              );
                            }}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit">{t("Save Changes")}</Button>
                </DialogFooter>
              </form>
            </Form>
          )}
        </DialogContent>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog open={openPasswordDialog} onOpenChange={setOpenPasswordDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="rtl:text-start">
              {t("Change Password")}
            </DialogTitle>
            <DialogDescription className="rtl:text-start">
              {selectedUser
                ? `${t("Update password for")} ${selectedUser.name}`
                : t("Update user password")}
            </DialogDescription>
          </DialogHeader>
          <Form {...passwordForm}>
            <form
              onSubmit={passwordForm.handleSubmit(onChangePassword)}
              className="space-y-4"
            >
              <FormField
                control={passwordForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("New Password")}</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={passwordForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("Confirm Password")}</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit">{t("Update Password")}</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
