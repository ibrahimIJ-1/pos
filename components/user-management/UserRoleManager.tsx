import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { UserPlus, RefreshCcw, User, Shield, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useRolesPermissions } from "@/hooks/usePermissions";
import { getAllUsers } from "@/actions/users/get-all-users";
import { updateUser } from "@/actions/users/update-user";
import { useTranslations } from "next-intl";

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
  roles: { id: string; name: string }[];
}

export function UserRoleManager() {
  const t = useTranslations();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoles, setSelectedRoles] = useState<Record<string, string[]>>(
    {}
  );
  const [savingUser, setSavingUser] = useState<string | null>(null);

  // Fetch available roles from the database
  const { roles, loading: loadingRoles } = useRolesPermissions();
  const availableRoles = roles.map((role) => role.name);

  // Fetch all users when component mounts
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await getAllUsers();
      const userData = response;

      // Initialize selectedRoles state with current user roles
      const initialRoleState: Record<string, string[]> = {};
      userData.forEach((user: User) => {
        initialRoleState[user.id] = user.roles.map((role) => role.name);
      });

      setUsers(userData);
      setSelectedRoles(initialRoleState);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error(t("Failed to fetch users"));
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = (userId: string, role: string) => {
    const userCurrentRoles = selectedRoles[userId] || [];

    // If role already exists, remove it, otherwise add it
    const updatedRoles = userCurrentRoles.includes(role)
      ? userCurrentRoles.filter((r) => r !== role)
      : [...userCurrentRoles, role];

    setSelectedRoles({ ...selectedRoles, [userId]: updatedRoles });
  };

  const saveUserRoles = async (userId: string) => {
    try {
      const user = users.find((u) => u.id === userId);
      if (!user) return;

      setSavingUser(userId);
      toast.loading(`${t("Updating roles for")} ${user.name}...`);

      await updateUser({
        id: userId,
        name: user.name,
        email: user.email,
        roles: selectedRoles[userId],
      });

      toast.success(`${t("Updated roles for")} ${user.name}`);
      fetchUsers(); // Refresh the user list
    } catch (error) {
      console.error("Error updating user roles:", error);
      toast.error(t("Failed to update user roles"));
    } finally {
      setSavingUser(null);
    }
  };

  if (loading || loadingRoles) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            {t("User Role Management")}
          </CardTitle>
          <CardDescription>
            {t("Manage user roles and permissions")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            {t("User Role Management")}
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchUsers}
            className="flex items-center gap-1"
          >
            <RefreshCcw className="h-4 w-4" />
            <span>{t("Refresh")}</span>
          </Button>
        </div>
        <CardDescription>
          {t("Manage user roles and permissions")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table dir={t("dir") as "rtl" | "ltr"}>
          <TableHeader>
            <TableRow>
              <TableHead className="rtl:text-start">{t("User")}</TableHead>
              <TableHead className="rtl:text-start">{t("Email")}</TableHead>
              <TableHead className="rtl:text-start">{t("Roles")}</TableHead>
              <TableHead className="text-right rtl:text-start">{t("Actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length > 0 ? (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="flex items-center gap-2">
                    <Avatar>
                      <AvatarImage
                        src={user.avatar ?? undefined}
                        alt={user.name}
                      />
                      <AvatarFallback>
                        {user.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span>{user.name}</span>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1 max-w-md">
                      {availableRoles.map((role) => (
                        <Badge
                          key={role}
                          variant={
                            selectedRoles[user.id]?.includes(role)
                              ? "default"
                              : "outline"
                          }
                          className="cursor-pointer"
                          onClick={() => handleRoleChange(user.id, role)}
                        >
                          {role}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      onClick={() => saveUserRoles(user.id)}
                      disabled={savingUser === user.id}
                    >
                      {savingUser === user.id ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-1" />
                      ) : null}
                      {t("Save")}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  {t("No users found")}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
