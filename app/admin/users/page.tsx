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
}

// Schema for adding/editing users
const userFormSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z
    .string()
    .min(6, {
      message: "Password must be at least 6 characters.",
    })
    .optional(),
  roles: z.array(z.string()).min(1, {
    message: "Please select at least one role.",
  }),
  active: z.boolean().default(true),
});

// Schema for changing password
const passwordFormSchema = z
  .object({
    password: z.string().min(6, {
      message: "Password must be at least 6 characters.",
    }),
    confirmPassword: z.string().min(6, {
      message: "Password must be at least 6 characters.",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

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
  const { toast } = useToast();
  const [data, setData] = useState<UserData[]>([]);
  const { checkPermission } = usePermissions(UserRole.ADMIN);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const { roles } = useRolesPermissions();

  // Form for adding new users
  const addForm = useForm<z.infer<typeof userFormSchema>>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: "",
      email: "",
      roles: [UserRole.VIEWER],
      active: true,
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
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive",
      });
    } finally {
    }
  };

  // Handle adding a new user
  const onAddUser = async (values: z.infer<typeof userFormSchema>) => {
    try {
      toast({
        title: "Creating user",
        description: "Please wait...",
      });

      const response = await createNewUser(
        values.name,
        values.email,
        values.password ?? "12345678",
        values.roles
      );

      setData([...data, response]);

      toast({
        title: "User created",
        description: `User ${values.name} was successfully created.`,
      });

      setOpenAddDialog(false);
      addForm.reset();
    } catch (error) {
      console.error("Error creating user:", error);
      toast({
        title: "Error",
        description: "Failed to create user",
        variant: "destructive",
      });
    }
  };

  // Handle editing a user
  const onEditUser = async (values: z.infer<typeof userFormSchema>) => {
    if (!selectedUser) return;

    try {
      toast({
        title: "Updating user",
        description: "Please wait...",
      });

      const response = await updateUser({
        id: selectedUser.id,
        name: values.name,
        email: values.email,
        roles: values.roles,
        active: values.active,
        ...(values.password ? { password: values.password } : {}),
      });

      // Update the user in the data array
      setData(
        data.map((user) => (user.id === selectedUser.id ? response : user))
      );

      toast({
        title: "User updated",
        description: `User ${values.name} was successfully updated.`,
      });

      setOpenEditDialog(false);
    } catch (error) {
      console.error("Error updating user:", error);
      toast({
        title: "Error",
        description: "Failed to update user",
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
        title: "Updating password",
        description: "Please wait...",
      });

      await updateUserPassword({
        id: selectedUser.id,
        password: values.password,
      });

      toast({
        title: "Password updated",
        description: `Password for ${selectedUser.name} was successfully updated.`,
      });

      setOpenPasswordDialog(false);
      passwordForm.reset();
    } catch (error) {
      console.error("Error updating password:", error);
      toast({
        title: "Error",
        description: "Failed to update password",
        variant: "destructive",
      });
    }
  };

  // Handle locking/unlocking a user
  const toggleUserStatus = async (user: UserData) => {
    try {
      const newStatus = !(user.active ?? true);
      const action = newStatus ? "Activating" : "Deactivating";

      toast({
        title: `${action} user`,
        description: "Please wait...",
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
        title: `User ${newStatus ? "activated" : "deactivated"}`,
        description: `User ${user.name} was successfully ${
          newStatus ? "activated" : "deactivated"
        }.`,
      });
    } catch (error) {
      console.error("Error toggling user status:", error);
      toast({
        title: "Error",
        description: `Failed to ${
          user.active ? "deactivate" : "activate"
        } user`,
        variant: "destructive",
      });
    }
  };

  // Handle deleting a user
  const deleteUser = async (user: UserData) => {
    try {
      toast({
        title: "Deleting user",
        description: "Please wait...",
      });

      await deleteUserById(user.id);

      // Remove the user from the data array
      setData(data.filter((u) => u.id !== user.id));

      toast({
        title: "User deleted",
        description: `User ${user.name} was successfully deleted.`,
      });
    } catch (error) {
      console.error("Error deleting user:", error);
      toast({
        title: "Error",
        description: "Failed to delete user",
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
            Name
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
                  Inactive
                </Badge>
              )}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "roles",
      header: "Roles",
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
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />

              {checkPermission(Permission.EDIT_USERS) && (
                <>
                  <DropdownMenuItem onClick={() => handleEditUser(user)}>
                    <UserCog className="mr-2 h-4 w-4" />
                    Edit user
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleChangePassword(user)}>
                    <KeyRound className="mr-2 h-4 w-4" />
                    Change password
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => toggleUserStatus(user)}>
                    {user.active === false ? (
                      <>
                        <Unlock className="mr-2 h-4 w-4" />
                        Activate user
                      </>
                    ) : (
                      <>
                        <Lock className="mr-2 h-4 w-4" />
                        Deactivate user
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
                      Delete user
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently
                        delete the user and remove their data from our servers.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-red-500 hover:bg-red-600"
                        onClick={() => deleteUser(user)}
                      >
                        Delete
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
        <h1 className="text-3xl font-bold tracking-tight">Users</h1>
        {checkPermission(Permission.CREATE_USER) && (
          <Dialog open={openAddDialog} onOpenChange={setOpenAddDialog}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-1">
                <UserPlus className="h-4 w-4" />
                <span>Add User</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add New User</DialogTitle>
                <DialogDescription>
                  Create a new user account to give someone access to the
                  system.
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
                        <FormLabel>Name</FormLabel>
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
                        <FormLabel>Email</FormLabel>
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
                        <FormLabel>Password</FormLabel>
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
                    name="roles"
                    render={() => (
                      <FormItem>
                        <div className="mb-4">
                          <FormLabel>Roles</FormLabel>
                          <FormDescription>
                            Select the roles for this user
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
                    <Button type="submit">Create User</Button>
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
            <TabsTrigger value="all">All Users</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="inactive">Inactive</TabsTrigger>
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
          filterPlaceholder="Filter users..."
        />
      </div>

      {/* Edit User Dialog */}
      <Dialog open={openEditDialog} onOpenChange={setOpenEditDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user details and roles.
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
                      <FormLabel>Name</FormLabel>
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
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
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
                        <FormLabel className="text-base">User Status</FormLabel>
                        <FormDescription>
                          {field.value ? "User is active" : "User is inactive"}
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
                        <FormLabel>Roles</FormLabel>
                        <FormDescription>
                          Select the roles for this user
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
                  <Button type="submit">Save Changes</Button>
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
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              {selectedUser
                ? `Update password for ${selectedUser.name}`
                : "Update user password"}
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
                    <FormLabel>New Password</FormLabel>
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
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit">Update Password</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
