import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, generateToken } from "@/lib/auth";
import { createResponse, createErrorResponse } from "@/lib/api-utils";

export async function POST(request: NextRequest) {
  console.log("=".repeat(50));
  console.log("🚀 LOGIN API CALLED");
  console.log("=".repeat(50));

  try {
    console.log("🌍 Environment:", process.env.NODE_ENV);
    console.log("🔑 JWT_SECRET exists:", !!process.env.JWT_SECRET);

    const body = await request.json();
    console.log("📦 Login attempt for email:", body.email);

    const { email, password } = body;

    // Validation
    if (!email || !password) {
      console.log("❌ Validation failed: Missing credentials");
      return createErrorResponse("Email and password are required", 400);
    }

    // Find user
    console.log("🔍 Finding user in database...");
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.log("❌ User not found:", email);
      return createErrorResponse("Invalid credentials", 401);
    }

    console.log("✅ User found:", user.id);

    // Verify password
    console.log("🔐 Verifying password...");
    const isValid = await verifyPassword(password, user.password);

    if (!isValid) {
      console.log("❌ Invalid password");
      return createErrorResponse("Invalid credentials", 401);
    }

    console.log("✅ Password valid");

    // Generate token
    console.log("🎫 Generating token...");
    const token = generateToken(user.id);

    const response = {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    };

    console.log("✅ LOGIN SUCCESSFUL");
    console.log("=".repeat(50));

    return createResponse(response);
  } catch (error: any) {
    console.error("=".repeat(50));
    console.error("❌ LOGIN ERROR:");
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    console.error("=".repeat(50));

    return createErrorResponse(`Login failed: ${error.message}`, 500);
  }
}
