import {
  FileAudio,
  Languages,
  Download,
  Clock,
  Shield,
  Sparkles,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function FeaturesSection() {
  const features = [
    {
      icon: FileAudio,
      title: "Multiple Audio Formats",
      description: "Support for MP3, WAV, M4A, and more audio formats",
    },
    {
      icon: Languages,
      title: "Dual Language Support",
      description: "Transcribe in English and Myanmar with high accuracy",
    },
    {
      icon: Download,
      title: "Export Options",
      description: "Download as TXT, PDF, or DOCX format",
    },
    {
      icon: Clock,
      title: "Quick Turnaround",
      description: "Get your transcripts in minutes, not hours",
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "End-to-end encryption for all your files",
    },
    {
      icon: Sparkles,
      title: "AI-Powered",
      description: "Advanced AI technology for accurate transcription",
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Powerful Features
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Everything you need for professional audio transcription
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="border-2 hover:border-primary transition-colors"
            >
              <CardContent className="p-6">
                <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
