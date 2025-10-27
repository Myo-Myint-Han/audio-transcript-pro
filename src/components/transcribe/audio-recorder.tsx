"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Square, Play, Pause, Trash2 } from "lucide-react";
import { formatDuration } from "@/lib/utils";

interface AudioRecorderProps {
  onRecordingComplete: (blob: Blob, duration: number) => void;
}

export function AudioRecorder({ onRecordingComplete }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioURL, setAudioURL] = useState<string>("");
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (audioURL) {
        URL.revokeObjectURL(audioURL);
      }
    };
  }, [audioURL]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm",
      });

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setAudioURL(url);
        setAudioBlob(blob);

        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setIsPaused(false);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert("Unable to access microphone. Please check your permissions.");
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording && !isPaused) {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && isRecording && isPaused) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const deleteRecording = () => {
    if (audioURL) {
      URL.revokeObjectURL(audioURL);
    }
    setAudioURL("");
    setAudioBlob(null);
    setRecordingTime(0);
    setIsPlaying(false);
    audioChunksRef.current = [];
  };

  const togglePlayback = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const handleUseRecording = () => {
    if (audioBlob) {
      onRecordingComplete(audioBlob, recordingTime);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div
          className={`inline-flex items-center justify-center w-32 h-32 rounded-full mb-6 ${
            isRecording ? "bg-red-100 animate-pulse" : "bg-primary/10"
          }`}
        >
          <Mic
            className={`h-16 w-16 ${
              isRecording ? "text-red-500" : "text-primary"
            }`}
          />
        </div>

        <div className="text-4xl font-bold text-gray-900 mb-2">
          {formatDuration(recordingTime)}
        </div>

        {isRecording && (
          <p className="text-sm text-gray-600">
            {isPaused ? "Recording paused" : "Recording in progress..."}
          </p>
        )}
      </div>

      <div className="flex justify-center space-x-4">
        {!isRecording && !audioURL && (
          <Button size="lg" onClick={startRecording}>
            <Mic className="h-5 w-5 mr-2" />
            Start Recording
          </Button>
        )}

        {isRecording && (
          <>
            {isPaused ? (
              <Button size="lg" onClick={resumeRecording} variant="outline">
                <Play className="h-5 w-5 mr-2" />
                Resume
              </Button>
            ) : (
              <Button size="lg" onClick={pauseRecording} variant="outline">
                <Pause className="h-5 w-5 mr-2" />
                Pause
              </Button>
            )}
            <Button size="lg" onClick={stopRecording} variant="destructive">
              <Square className="h-5 w-5 mr-2" />
              Stop
            </Button>
          </>
        )}

        {audioURL && !isRecording && (
          <>
            <Button size="lg" onClick={togglePlayback} variant="outline">
              {isPlaying ? (
                <>
                  <Pause className="h-5 w-5 mr-2" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="h-5 w-5 mr-2" />
                  Play
                </>
              )}
            </Button>
            <Button size="lg" onClick={deleteRecording} variant="destructive">
              <Trash2 className="h-5 w-5 mr-2" />
              Delete
            </Button>
            <Button size="lg" onClick={handleUseRecording}>
              Use Recording
            </Button>
          </>
        )}
      </div>

      {audioURL && (
        <audio
          ref={audioRef}
          src={audioURL}
          onEnded={() => setIsPlaying(false)}
          className="hidden"
        />
      )}
    </div>
  );
}
