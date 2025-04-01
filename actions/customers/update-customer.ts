"use server";

import { prisma } from "@/lib/prisma";
import { checkUserPermissions } from "../users/check-permissions";
import { rolePermissions, UserRole } from "@/lib/permissions";

export const updateCustomer = async ({
  id,
  name,
  email,
  phone,
  address,
  city,
  state,
  postal_code,
  country,
  tax_exempt,
  notes,
}: {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  tax_exempt: boolean;
  notes: string;
}) => {
  //   const hasEditPermission = req.user?.roles.some((role) =>
  //     ["admin", "manager"].includes(role)
  //   );

  //   if (!hasEditPermission) {
  //     return res
  //       .status(403)
  //       .json({ error: "You do not have permission to edit customers" });
  //   }

  try {
    await checkUserPermissions([...rolePermissions[UserRole.MANAGER]]);

    if (!name) {
      throw new Error("Customer name is required");
    }

    const customer = await prisma.customer.update({
      where: { id },
      data: {
        name,
        email,
        phone,
        address,
        city,
        state,
        postal_code,
        country,
        tax_exempt: tax_exempt || false,
        notes,
      },
    });

    return customer;
  } catch (error) {
    console.error(`Error updating customer ${id}:`, error);
    throw new Error("Failed to update customer");
  }
};
