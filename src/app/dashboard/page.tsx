"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { formatDate, formatFileSize, formatDuration } from "@/lib/utils";
import {
  FileAudio,
  Download,
  Trash2,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  FileText,
  FileDown,
} from "lucide-react";
import Link from "next/link";
import jsPDF from "jspdf";
import { Document, Packer, Paragraph, TextRun } from "docx";
import { saveAs } from "file-saver";

interface Transcript {
  id: string;
  fileName: string;
  fileSize: number;
  language: string;
  status: string;
  progress: number;
  transcript: string | null;
  duration: number | null;
  createdAt: string;
}

export default function DashboardPage() {
  const { user, token } = useAuth();
  const searchParams = useSearchParams();
  const transcriptParam = searchParams.get("transcript");
  const [selectedTranscript, setSelectedTranscript] = useState<string | null>(
    transcriptParam
  );

  // Auto-select transcript from URL parameter
  useEffect(() => {
    if (transcriptParam) {
      setSelectedTranscript(transcriptParam);
    }
  }, [transcriptParam]);

  const {
    data: transcripts,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["transcripts"],
    queryFn: async () => {
      const response = await axios.get("/api/transcripts", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data as Transcript[];
    },
    enabled: !!token,
    refetchInterval: (query) => {
      const data = query.state.data as Transcript[] | undefined;
      const hasProcessing = data?.some((t) => t.status === "processing");
      return hasProcessing ? 2000 : false;
    },
  });

  // Auto-refresh when navigating to dashboard
  useEffect(() => {
    if (token) {
      refetch();
    }
  }, [token, refetch]);

  // Auto-scroll to selected transcript
  useEffect(() => {
    if (selectedTranscript && transcripts) {
      const element = document.getElementById(
        `transcript-${selectedTranscript}`
      );
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }
  }, [selectedTranscript, transcripts]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this transcript?")) return;

    try {
      await axios.delete(`/api/transcripts/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      refetch();
      if (selectedTranscript === id) {
        setSelectedTranscript(null);
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete transcript");
    }
  };

  const handleDownloadTXT = (transcript: Transcript) => {
    if (!transcript.transcript) return;

    const content = `Transcript: ${transcript.fileName}\nDate: ${formatDate(
      transcript.createdAt
    )}\nLanguage: ${transcript.language === "en" ? "English" : "Myanmar"}\n\n${
      transcript.transcript
    }`;
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${transcript.fileName.replace(/\.[^/.]+$/, "")}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadPDF = (transcript: Transcript) => {
    if (!transcript.transcript) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const maxWidth = pageWidth - margin * 2;

    // Title
    doc.setFontSize(16);
    doc.text("Audio Transcript", margin, 20);

    // Metadata
    doc.setFontSize(10);
    doc.text(`File: ${transcript.fileName}`, margin, 30);
    doc.text(`Date: ${formatDate(transcript.createdAt)}`, margin, 37);
    doc.text(
      `Language: ${transcript.language === "en" ? "English" : "Myanmar"}`,
      margin,
      44
    );

    // Transcript content
    doc.setFontSize(12);
    const lines = doc.splitTextToSize(transcript.transcript, maxWidth);
    doc.text(lines, margin, 55);

    doc.save(`${transcript.fileName.replace(/\.[^/.]+$/, "")}.pdf`);
  };

  const handleDownloadDOCX = async (transcript: Transcript) => {
    if (!transcript.transcript) return;

    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: "Audio Transcript",
                  bold: true,
                  size: 32,
                }),
              ],
              spacing: { after: 200 },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `File: ${transcript.fileName}`,
                  size: 20,
                }),
              ],
              spacing: { after: 100 },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `Date: ${formatDate(transcript.createdAt)}`,
                  size: 20,
                }),
              ],
              spacing: { after: 100 },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `Language: ${
                    transcript.language === "en" ? "English" : "Myanmar"
                  }`,
                  size: 20,
                }),
              ],
              spacing: { after: 300 },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: transcript.transcript,
                  size: 24,
                }),
              ],
            }),
          ],
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${transcript.fileName.replace(/\.[^/.]+$/, "")}.docx`);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white py-20">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            Please Login
          </h1>
          <Link href="/login">
            <Button size="lg">Go to Login</Button>
          </Link>
        </div>
      </div>
    );
  }

  const selectedTranscriptData = transcripts?.find(
    (t) => t.id === selectedTranscript
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>
            <p className="text-gray-600">Manage your transcriptions</p>
          </div>
          <Link href="/transcribe">
            <Button>
              <FileAudio className="h-4 w-4 mr-2" />
              New Transcript
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Transcript List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>
                  Your Transcripts ({transcripts?.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                    <p className="text-sm text-gray-500 mt-2">Loading...</p>
                  </div>
                ) : transcripts && transcripts.length > 0 ? (
                  <div className="space-y-2 max-h-[600px] overflow-y-auto">
                    {transcripts.map((transcript) => (
                      <button
                        key={transcript.id}
                        id={`transcript-${transcript.id}`}
                        onClick={() => setSelectedTranscript(transcript.id)}
                        className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                          selectedTranscript === transcript.id
                            ? "border-primary bg-primary/5 shadow-md"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-2 flex-1 min-w-0">
                            <FileAudio className="h-4 w-4 text-primary flex-shrink-0" />
                            <span className="font-medium text-sm truncate">
                              {transcript.fileName}
                            </span>
                          </div>
                          {transcript.status === "completed" && (
                            <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 ml-2" />
                          )}
                          {transcript.status === "processing" && (
                            <Loader2 className="h-4 w-4 text-primary animate-spin flex-shrink-0 ml-2" />
                          )}
                          {transcript.status === "failed" && (
                            <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 ml-2" />
                          )}
                        </div>
                        <div className="text-xs text-gray-500 mb-1">
                          {formatDate(transcript.createdAt)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatFileSize(transcript.fileSize)} •{" "}
                          {transcript.language === "en" ? "English" : "Myanmar"}
                        </div>
                        {transcript.status === "processing" && (
                          <Progress
                            value={transcript.progress}
                            className="mt-2 h-1"
                          />
                        )}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileAudio className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">No transcripts yet</p>
                    <Link href="/transcribe">
                      <Button size="sm">Create First Transcript</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Transcript Details */}
          <div className="lg:col-span-2">
            {selectedTranscriptData ? (
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="mb-2">
                        {selectedTranscriptData.fileName}
                      </CardTitle>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center">
                          <FileText className="h-4 w-4 mr-1" />
                          {formatFileSize(selectedTranscriptData.fileSize)}
                        </span>
                        {selectedTranscriptData.duration && (
                          <span className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {formatDuration(selectedTranscriptData.duration)}
                          </span>
                        )}
                        <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                          {selectedTranscriptData.language === "en"
                            ? "English"
                            : "Myanmar"}
                        </span>
                        <span className="text-xs">
                          {formatDate(selectedTranscriptData.createdAt)}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(selectedTranscriptData.id)}
                    >
                      <Trash2 className="h-5 w-5 text-red-500" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {selectedTranscriptData.status === "processing" && (
                    <div className="text-center py-12">
                      <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary mb-4" />
                      <h3 className="text-lg font-semibold mb-2">
                        Processing Your Audio...
                      </h3>
                      <Progress
                        value={selectedTranscriptData.progress}
                        className="max-w-xs mx-auto mb-2"
                      />
                      <p className="text-sm text-gray-500">
                        {selectedTranscriptData.progress}% complete
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        This usually takes 5-30 seconds
                      </p>
                    </div>
                  )}

                  {selectedTranscriptData.status === "completed" && (
                    <div>
                      <div className="mb-4 flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          onClick={() =>
                            handleDownloadTXT(selectedTranscriptData)
                          }
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Download TXT
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleDownloadPDF(selectedTranscriptData)
                          }
                        >
                          <FileDown className="h-4 w-4 mr-2" />
                          Download PDF
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleDownloadDOCX(selectedTranscriptData)
                          }
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download DOCX
                        </Button>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-6 max-h-[500px] overflow-y-auto">
                        <h3 className="font-semibold mb-4 flex items-center">
                          <FileText className="h-5 w-5 mr-2 text-primary" />
                          Transcript:
                        </h3>
                        <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                          {selectedTranscriptData.transcript}
                        </p>
                      </div>
                    </div>
                  )}

                  {selectedTranscriptData.status === "failed" && (
                    <div className="text-center py-12">
                      <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">
                        Transcription Failed
                      </h3>
                      <p className="text-gray-500 mb-4">
                        {selectedTranscriptData.transcript ||
                          "Something went wrong. Please try again."}
                      </p>
                      <Button
                        onClick={() => handleDelete(selectedTranscriptData.id)}
                        variant="outline"
                      >
                        Delete and Try Again
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="text-center py-20">
                  <FileAudio className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-6">
                    {transcripts && transcripts.length > 0
                      ? "Select a transcript to view details"
                      : "No transcripts yet. Create your first one!"}
                  </p>
                  <Link href="/transcribe">
                    <Button>
                      <FileAudio className="h-4 w-4 mr-2" />
                      Create New Transcript
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
