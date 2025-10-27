import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, generateToken } from "@/lib/auth";
import { createResponse, createErrorResponse } from "@/lib/api-utils";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validation
    if (!email || !password) {
      return createErrorResponse("Email and password are required", 400);
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return createErrorResponse("Invalid credentials", 401);
    }

    // Verify password
    const isValid = await verifyPassword(password, user.password);

    if (!isValid) {
      return createErrorResponse("Invalid credentials", 401);
    }

    // Generate token
    const token = generateToken(user.id);

    return createResponse({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return createErrorResponse("Login failed", 500);
  }
}
