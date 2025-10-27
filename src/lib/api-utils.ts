import { NextRequest } from "next/server";
import { verifyToken } from "./auth";
import { prisma } from "./prisma";

export async function getUserFromRequest(request: NextRequest) {
  const authHeader = request.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.substring(7);
  const payload = verifyToken(token);

  if (!payload) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
  });

  return user;
}

export function createResponse(data: any, status = 200) {
  return Response.json(data, { status });
}

export function createErrorResponse(message: string, status = 400) {
  return Response.json({ error: message }, { status });
}
