"use client"

import { useCallback, useEffect, useState } from "react";
import { Permission, UserRole, hasPermission } from "@/lib/permissions";
import { getAllRoles } from "@/actions/auth/roles/get-all-roles";
import { getAllPermissions } from "@/actions/auth/permissions/get-all-permissions";

export function usePermissions(
  userRoles: (UserRole | string) | (UserRole | string)[],
  additionalPermissions: Permission[] = []
) {
  // Convert single role to array if necessary
  const roles = Array.isArray(userRoles) ? userRoles : [userRoles];

  const checkPermission = useCallback(
    (permission: Permission) => {
      return hasPermission(roles, permission, additionalPermissions);
    },
    [roles, additionalPermissions]
  );

  return {
    checkPermission,
    isAdmin: roles.includes(UserRole.ADMIN),
    isManager:
      roles.includes(UserRole.MANAGER) || roles.includes(UserRole.ADMIN),
    roles,
    additionalPermissions,
  };
}

export function PermissionGuard({
  userRole,
  permission,
  fallback = null,
  children,
  additionalPermissions,
}: {
  userRole: (UserRole | string) | (UserRole | string)[];
  permission: Permission;
  fallback?: React.ReactNode;
  children: React.ReactNode;
  additionalPermissions?: Permission[];
}) {
  const { checkPermission } = usePermissions(userRole, additionalPermissions);

  if (!checkPermission(permission)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// New hook to fetch roles and permissions from the database
export function useRolesPermissions() {
  const [roles, setRoles] = useState<
    { id: string; name: string; permissions: { id: string; name: string }[] }[]
  >([]);
  const [permissions, setPermissions] = useState<
    { id: string; name: string }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRolesAndPermissions = async () => {
      setLoading(true);
      try {
        // Fetch roles with their permissions
        const rolesResponse = await getAllRoles();
        setRoles(rolesResponse);

        // Fetch all available permissions
        const permissionsResponse = await getAllPermissions();
        setPermissions(permissionsResponse);

        setError(null);
      } catch (err) {
        console.error("Error fetching roles and permissions:", err);
        setError("Failed to load roles and permissions");
      } finally {
        setLoading(false);
      }
    };

    fetchRolesAndPermissions();
  }, []);

  return { roles, permissions, loading, error };
}
