"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/transcribe/file-upload";
import { AudioRecorder } from "@/components/transcribe/audio-recorder";
import { useAuth } from "@/contexts/auth-context";
import { Upload, Mic, Globe, Info } from "lucide-react";
import axios from "axios";

export default function TranscribePage() {
  const router = useRouter();
  const { user, token } = useAuth();
  const [mode, setMode] = useState<"upload" | "record" | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [language, setLanguage] = useState<"en" | "my">("en");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
  };

  const handleRecordingComplete = async (blob: Blob, duration: number) => {
    // Convert blob to file
    const file = new File([blob], `recording-${Date.now()}.webm`, {
      type: "audio/webm",
    });
    setSelectedFile(file);
    setMode("upload");
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      setError("Please select a file first");
      return;
    }

    if (!user || !token) {
      router.push("/login");
      return;
    }

    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("language", language);

      const response = await axios.post("/api/transcripts", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      router.push(`/dashboard?transcript=${response.data.id}`);
    } catch (err: any) {
      setError(err.response?.data?.error || "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleClearFile = () => {
    setSelectedFile(null);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white py-20">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            Please Login to Transcribe
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            You need to be logged in to use the transcription service.
          </p>
          <Button size="lg" onClick={() => router.push("/login")}>
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white py-20">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Transcribe Your Audio
          </h1>
          <p className="text-lg text-gray-600">
            Upload a file or record audio to get started
          </p>
        </div>

        {!mode && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card
              className="cursor-pointer hover:border-primary hover:shadow-lg transition-all"
              onClick={() => setMode("upload")}
            >
              <CardContent className="p-8 text-center">
                <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Upload className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Upload File
                </h3>
                <p className="text-gray-600">
                  Upload an existing audio file from your device
                </p>
                <p className="text-xs text-gray-500 mt-3">
                  Supports: MP3, WAV, M4A, WebM, OGG, FLAC
                </p>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer hover:border-primary hover:shadow-lg transition-all"
              onClick={() => setMode("record")}
            >
              <CardContent className="p-8 text-center">
                <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mic className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Record Audio
                </h3>
                <p className="text-gray-600">
                  Record audio directly from your microphone
                </p>
                <p className="text-xs text-gray-500 mt-3">
                  No time limit • High quality recording
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {mode && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  {mode === "upload" ? "Upload Audio File" : "Record Audio"}
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setMode(null)}>
                  Change Method
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {mode === "upload" && (
                <FileUpload
                  onFileSelect={handleFileSelect}
                  selectedFile={selectedFile}
                  onClear={handleClearFile}
                />
              )}

              {mode === "record" && (
                <AudioRecorder onRecordingComplete={handleRecordingComplete} />
              )}

              {selectedFile && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      <Globe className="inline h-4 w-4 mr-2" />
                      Select Language
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => setLanguage("en")}
                        className={`p-4 border-2 rounded-lg text-center transition-colors ${
                          language === "en"
                            ? "border-primary bg-primary/5"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="text-2xl mb-2">🇬🇧</div>
                        <div className="font-semibold">English</div>
                        <div className="text-xs text-gray-500 mt-1">
                          ISO: en
                        </div>
                      </button>
                      <button
                        onClick={() => setLanguage("my")}
                        className={`p-4 border-2 rounded-lg text-center transition-colors ${
                          language === "my"
                            ? "border-primary bg-primary/5"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="text-2xl mb-2">🇲🇲</div>
                        <div className="font-semibold">မြန်မာ</div>
                        <div className="text-xs text-gray-500 mt-1">
                          Myanmar/Burmese (ISO: my)
                        </div>
                      </button>
                    </div>

                    {/* Language Tips */}
                    <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-start space-x-2">
                        <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-blue-800">
                          {language === "my" ? (
                            <>
                              <p className="font-semibold mb-1">
                                မြန်မာဘာသာ မှတ်တမ်းတင်ခြင်း အကြံပြုချက်များ:
                              </p>
                              <ul className="list-disc list-inside space-y-1 text-xs">
                                <li>ရှင်းလင်းပြတ်သားစွာ ပြောဆိုပါ</li>
                                <li>နောက်ခံအသံများကို လျှော့ချပါ</li>
                                <li>အနည်းဆုံး 20-30 စက္ကန့် အသံဖမ်းပါ</li>
                                <li>စံမြန်မာစကားကို အသုံးပြုပါ</li>
                              </ul>
                            </>
                          ) : (
                            <>
                              <p className="font-semibold mb-1">
                                Tips for better English transcription:
                              </p>
                              <ul className="list-disc list-inside space-y-1 text-xs">
                                <li>Speak clearly and at a moderate pace</li>
                                <li>Minimize background noise</li>
                                <li>Record at least 20-30 seconds</li>
                                <li>Use a good quality microphone</li>
                              </ul>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                      <p className="font-semibold">Error:</p>
                      <p className="text-sm">{error}</p>
                    </div>
                  )}

                  <Button
                    size="lg"
                    className="w-full"
                    onClick={handleSubmit}
                    disabled={uploading}
                  >
                    {uploading ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      <>
                        <Mic className="h-5 w-5 mr-2" />
                        Start Transcription
                      </>
                    )}
                  </Button>

                  {/* Additional Info */}
                  <div className="text-center text-xs text-gray-500">
                    <p>
                      Powered by Whisper AI •{" "}
                      {language === "my" ? "မြန်မာဘာသာ" : "English"}{" "}
                      transcription
                    </p>
                    <p className="mt-1">
                      Processing typically takes 5-30 seconds depending on audio
                      length
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* Feature Highlights */}
        {!mode && (
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">⚡</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-1">
                Fast Processing
              </h4>
              <p className="text-sm text-gray-600">
                Get your transcripts in seconds, not minutes
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🎯</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-1">
                High Accuracy
              </h4>
              <p className="text-sm text-gray-600">
                Powered by Whisper AI for professional quality
              </p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🌏</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-1">
                Multi-Language
              </h4>
              <p className="text-sm text-gray-600">
                Support for English and Myanmar (Burmese)
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
