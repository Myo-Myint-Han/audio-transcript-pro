import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getUserFromRequest,
  createResponse,
  createErrorResponse,
} from "@/lib/api-utils";

export const dynamic = "force-dynamic";

// GET single transcript
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest(request);
    const { id } = await params;

    if (!user) {
      return createErrorResponse("Unauthorized", 401);
    }

    const transcript = await prisma.transcript.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!transcript) {
      return createErrorResponse("Transcript not found", 404);
    }

    return createResponse(transcript);
  } catch (error) {
    console.error("Get transcript error:", error);
    return createErrorResponse("Failed to get transcript", 500);
  }
}

// DELETE transcript
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest(request);
    const { id } = await params;

    if (!user) {
      return createErrorResponse("Unauthorized", 401);
    }

    const transcript = await prisma.transcript.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!transcript) {
      return createErrorResponse("Transcript not found", 404);
    }

    await prisma.transcript.delete({
      where: { id },
    });

    return createResponse({ message: "Transcript deleted" });
  } catch (error) {
    console.error("Delete transcript error:", error);
    return createErrorResponse("Failed to delete transcript", 500);
  }
}
