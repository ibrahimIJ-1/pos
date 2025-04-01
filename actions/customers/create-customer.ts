"use server";

import { rolePermissions, UserRole } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { checkUserPermissions } from "../users/check-permissions";

export const createNewCustomer = async ({
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
  try {
    // Validate required fields
    await checkUserPermissions(rolePermissions[UserRole.MANAGER]);
    if (!name) {
      throw new Error("Customer name is required");
    }

    // Check if customer with email already exists (if email provided)
    if (email) {
      const existingCustomer = await prisma.customer.findUnique({
        where: { email },
      });

      if (existingCustomer) {
        throw new Error("Customer with this email already exists");
      }
    }

    // Create the customer
    const customer = await prisma.customer.create({
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
    console.error("Error creating customer:", error);
    throw new Error("Failed to create customer");
  }
};
