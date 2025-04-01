"use server";

import { verifyAuth } from "@/lib/auth";
import { cookies } from "next/headers";

export const checkUser = async () => {
  const token = (await cookies()).get("authToken")?.value;
  if (!token) throw new Error("User not authenticated");
  const user = verifyAuth(token);
  return user;
};
