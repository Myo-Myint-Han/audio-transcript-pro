import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, generateToken } from "@/lib/auth";
import { createResponse, createErrorResponse } from "@/lib/api-utils";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    // Validation
    if (!name || !email || !password) {
      return createErrorResponse("All fields are required", 400);
    }

    if (password.length < 6) {
      return createErrorResponse("Password must be at least 6 characters", 400);
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return createErrorResponse("Email already registered", 400);
    }

    // Create user
    const hashedPassword = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    // Generate token
    const token = generateToken(user.id);

    return createResponse(
      {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      },
      201
    );
  } catch (error) {
    console.error("Registration error:", error);
    return createErrorResponse("Registration failed", 500);
  }
}
