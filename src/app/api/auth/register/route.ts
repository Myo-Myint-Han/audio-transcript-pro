import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, generateToken } from "@/lib/auth";
import { createResponse, createErrorResponse } from "@/lib/api-utils";

export async function POST(request: NextRequest) {
  console.log("=".repeat(50));
  console.log("🚀 REGISTER API CALLED");
  console.log("=".repeat(50));

  try {
    // Check environment
    console.log("🌍 Environment:", process.env.NODE_ENV);
    console.log("🔑 JWT_SECRET exists:", !!process.env.JWT_SECRET);
    console.log(
      "🗄️  Database URL exists:",
      !!process.env.SUPABASE_DATABASE_URL
    );

    const body = await request.json();
    console.log("📦 Request body received:", {
      name: body.name,
      email: body.email,
      hasPassword: !!body.password,
    });

    const { name, email, password } = body;

    // Validation
    if (!name || !email || !password) {
      console.log("❌ Validation failed: Missing fields");
      return createErrorResponse("All fields are required", 400);
    }

    if (password.length < 6) {
      console.log("❌ Validation failed: Password too short");
      return createErrorResponse("Password must be at least 6 characters", 400);
    }

    console.log("✅ Validation passed");

    // Check if user exists
    console.log("🔍 Checking if user exists...");
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.log("❌ User already exists:", email);
      return createErrorResponse("Email already registered", 400);
    }

    console.log("✅ Email is available");

    // Create user
    console.log("👤 Creating user...");
    const hashedPassword = await hashPassword(password);

    console.log("💾 Saving to database...");
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });
    console.log("✅ User created with ID:", user.id);

    // Generate token
    console.log("🎫 Generating JWT token...");
    const token = generateToken(user.id);
    console.log("✅ Token generated successfully");

    const response = {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    };

    console.log("✅ REGISTRATION SUCCESSFUL");
    console.log("=".repeat(50));

    return createResponse(response, 201);
  } catch (error: any) {
    console.error("=".repeat(50));
    console.error("❌ REGISTRATION ERROR:");
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    console.error("=".repeat(50));

    return createErrorResponse(`Registration failed: ${error.message}`, 500);
  }
}
