"use server";

import {checkUserPermissions} from "@/actions/users/check-permissions";
import {rolePermissions, UserRole} from "@/lib/permissions";
import {prisma} from "@/lib/prisma";
import {decimalToNumber} from "@/lib/utils";

export const getRegisterTransactionById = async (id: string) => {
    try {
        await checkUserPermissions(rolePermissions[UserRole.MANAGER]);

        const register = await prisma.registerTransaction.findUnique({
            where: {
                id,
            },
            include: {
                cashier: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                register: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            },
        });
        if (!register) throw new Error("Could not find transaction");

        const formattedRegister = {
            ...register,
            created_at: register.created_at
                ? new Date(register.created_at)
                    .toISOString()
                    .replace("T", " ")
                    .slice(0, 19) // Format: YYYY-MM-DD HH:mm:ss
                : null,
        };

        return decimalToNumber(formattedRegister);
    } catch (error) {
        console.error("Error fetching transactions:", error);
        throw new Error("Failed to fetch transactions");
    }
};
