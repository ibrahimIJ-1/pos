"use server"

import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyAuth } from "./lib/auth";

import * as jwt from "jsonwebtoken";
import { Permission } from "./lib/permissions";

const prisma = new PrismaClient();

export interface AuthenticatedRequest extends NextApiRequest {
  user?: {
    id: string;
    email: string;
    name: string;
    roles: string[];
  };
}

export function authenticateToken(
  req: AuthenticatedRequest,
  res: NextApiResponse,
  next: () => void
) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ error: "Unauthorized: Missing or invalid token format" });
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(
      token,
      process.env.NEXTAUTH_SECRET || "your-secret-key-here"
    ) as jwt.JwtPayload;

    // Add user info to the request
    req.user = {
      id: decoded.id as string,
      email: decoded.email as string,
      name: decoded.name as string,
      roles: decoded.roles as string[],
    };

    next();
  } catch (error) {
    return res.status(401).json({ error: "Unauthorized: Invalid token" });
  }
}

export function checkPermission(requiredPermissions: Permission[] = []) {
  return async (
    req: AuthenticatedRequest,
    res: NextApiResponse,
    next: () => void
  ) => {
    if (requiredPermissions.length === 0) {
      return next();
    }

    try {
      // Fetch the user with their roles and permissions
      const user = await prisma.user.findUnique({
        where: { id: req.user?.id },
        include: {
          roles: {
            include: {
              permissions: true,
            },
          },
          additionalPermissions: {
            include: {
              permission: true,
            },
          },
        },
      });

      if (!user) {
        return res.status(401).json({ error: "Unauthorized: User not found" });
      }

      // Check if the user has the required permissions
      const userPermissions = new Set([
        ...user.roles.flatMap((role) => role.permissions.map((p) => p.name)),
        ...user.additionalPermissions.map((ap) => ap.permission.name),
      ]);

      const hasRequiredPermissions = requiredPermissions.every((permission) =>
        userPermissions.has(permission)
      );

      if (!hasRequiredPermissions) {
        return res
          .status(403)
          .json({ error: "Forbidden: Insufficient permissions" });
      }

      next();
    } catch (error) {
      console.error("Permission check error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  };
}

// Higher-order function for Next.js API routes to use auth middleware
export function withAuth(handler: any, requiredPermissions: Permission[] = []) {
  return async (req: AuthenticatedRequest, res: NextApiResponse) => {
    try {
      await new Promise<void>((resolve, reject) => {
        authenticateToken(req, res, () => {
          resolve();
        });
      });

      if (requiredPermissions.length > 0) {
        await new Promise<void>((resolve, reject) => {
          checkPermission(requiredPermissions)(req, res, () => {
            resolve();
          });
        });
      }

      return handler(req, res);
    } catch (error) {
      // If any middleware rejects, the response has already been sent
      return;
    }
  };
}

export async function middleware(request: NextRequest) {
  try {
    const response = await fetch('http://localhost:5001/getmac');
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const macAddress = await response.text();
    // return macAddress;
  } catch (error) {
    console.error('Error fetching MAC address:', error);
    return null;
  }
  const token = request.cookies.get("authToken")?.value;
  
  // Check auth routes that don't need authentication
  const isAuthRoute = request.nextUrl.pathname.startsWith("/auth/");
  if (isAuthRoute) {
    // If user is already logged in, redirect them away from auth pages
    if (token) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    return NextResponse.next();
  }

  // Paths that require authentication
  const authRoutes = ["/admin", "/pos"];
  const isProtectedRoute = authRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  );

  if (isProtectedRoute) {
    if (!token) {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }

    try {
      // Verify token
      await verifyAuth(token);
      return NextResponse.next();
    } catch (error) {
      console.log("@ERROR: ", error);
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/pos/:path*", "/auth/:path*"],
};
