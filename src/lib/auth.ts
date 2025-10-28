import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error("❌ JWT_SECRET is not set!");
  throw new Error("JWT_SECRET environment variable is not set!");
}

console.log("✅ JWT_SECRET is loaded:", JWT_SECRET?.substring(0, 10) + "...");

export async function hashPassword(password: string): Promise<string> {
  console.log("🔐 Hashing password...");
  const hashed = await bcrypt.hash(password, 10);
  console.log("✅ Password hashed successfully");
  return hashed;
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  console.log("🔍 Verifying password...");
  const isValid = await bcrypt.compare(password, hashedPassword);
  console.log("✅ Password verification:", isValid);
  return isValid;
}

export function generateToken(userId: string): string {
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }
  console.log("🎫 Generating token for userId:", userId);
  const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" });
  console.log("✅ Token generated:", token.substring(0, 20) + "...");
  return token;
}

export function verifyToken(token: string): { userId: string } | null {
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }

  console.log("🔍 Verifying token:", token.substring(0, 20) + "...");

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (
      typeof decoded === "object" &&
      decoded !== null &&
      "userId" in decoded
    ) {
      console.log("✅ Token valid for userId:", (decoded as any).userId);
      return decoded as { userId: string };
    }
    console.log("❌ Token invalid: missing userId");
    return null;
  } catch (error) {
    console.error("❌ Token verification failed:", error);
    return null;
  }
}
