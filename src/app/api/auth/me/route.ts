import { NextRequest } from "next/server";
import {
  getUserFromRequest,
  createResponse,
  createErrorResponse,
} from "@/lib/api-utils";

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);

    if (!user) {
      return createErrorResponse("Unauthorized", 401);
    }

    return createResponse({
      id: user.id,
      name: user.name,
      email: user.email,
    });
  } catch (error) {
    console.error("Me error:", error);
    return createErrorResponse("Failed to get user", 500);
  }
}
