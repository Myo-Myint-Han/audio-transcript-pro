import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getUserFromRequest,
  createResponse,
  createErrorResponse,
} from "@/lib/api-utils";
import { parseForm } from "@/lib/upload";
import { transcribeAudio } from "@/lib/transcription";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60; // 60 seconds max

// GET - Get all transcripts for user
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);

    if (!user) {
      return createErrorResponse("Unauthorized", 401);
    }

    const transcripts = await prisma.transcript.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    return createResponse(transcripts);
  } catch (error) {
    console.error("Get transcripts error:", error);
    return createErrorResponse("Failed to get transcripts", 500);
  }
}

// POST - Upload and create new transcript
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);

    if (!user) {
      return createErrorResponse("Unauthorized", 401);
    }

    const { fields, files } = await parseForm(request);

    const file = files.file;
    if (!file) {
      return createErrorResponse("No file uploaded", 400);
    }

    const language = fields.language || "en";

    // Create transcript record with Supabase URL
    const transcript = await prisma.transcript.create({
      data: {
        userId: user.id,
        fileName: file.originalFilename || "unknown",
        fileSize: file.size || 0,
        filePath: file.filepath, // This is now the Supabase public URL
        language: language,
        status: "processing",
        progress: 0,
      },
    });

    console.log("✅ Transcript created:", transcript.id);
    console.log("📁 File URL:", file.filepath);

    // Start transcription process (don't await - let it run in background)
    processTranscript(transcript.id, file.filepath, language as "en" | "my");

    // Return the created transcript immediately
    return createResponse(transcript, 201);
  } catch (error) {
    console.error("Upload error:", error);
    return createErrorResponse("Upload failed", 500);
  }
}

// Real transcription process
async function processTranscript(
  transcriptId: string,
  fileUrl: string,
  language: "en" | "my"
) {
  try {
    // Update progress to 10%
    await prisma.transcript.update({
      where: { id: transcriptId },
      data: { progress: 10 },
    });

    console.log(`Starting transcription for ${transcriptId}`);
    console.log(`File URL: ${fileUrl}`);

    // Update progress to 30%
    await prisma.transcript.update({
      where: { id: transcriptId },
      data: { progress: 30 },
    });

    // Call transcription API (fileUrl is a Supabase public URL)
    const transcriptText = await transcribeAudio(fileUrl, language);

    console.log(`Transcription completed for ${transcriptId}`);

    // Update progress to 90%
    await prisma.transcript.update({
      where: { id: transcriptId },
      data: { progress: 90 },
    });

    // Estimate duration (rough estimate based on file size)
    const approximateDuration = 60; // Default to 60 seconds

    // Update to completed
    await prisma.transcript.update({
      where: { id: transcriptId },
      data: {
        progress: 100,
        status: "completed",
        transcript: transcriptText,
        duration: approximateDuration,
      },
    });
  } catch (error: any) {
    console.error("Process transcript error:", error);

    // Update to failed with error message
    await prisma.transcript.update({
      where: { id: transcriptId },
      data: {
        status: "failed",
        progress: 0,
        transcript: `Error: ${error.message}`,
      },
    });
  }
}
