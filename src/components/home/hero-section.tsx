import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Mic, Zap, Globe, Shield } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-purple-50 to-white py-20 sm:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="animate-slideIn">
            <div className="inline-flex items-center px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium mb-6">
              <Zap className="h-4 w-4 mr-2" />
              Lightning Fast Transcription
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Transform Audio to Text in{" "}
              <span className="text-primary">Seconds</span>
            </h1>

            <p className="text-lg text-gray-600 mb-8">
              Professional audio transcription service supporting English and
              Myanmar languages. Accurate, fast, and secure transcription for
              all your needs.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Link href="/transcribe">
                <Button size="lg" className="w-full sm:w-auto">
                  <Mic className="mr-2 h-5 w-5" />
                  Start Transcribing
                </Button>
              </Link>
              <Link href="/pricing">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto"
                >
                  View Pricing
                </Button>
              </Link>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="flex items-start space-x-3">
                <Globe className="h-6 w-6 text-primary flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    Multi-Language
                  </h3>
                  <p className="text-sm text-gray-600">English & Myanmar</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Zap className="h-6 w-6 text-primary flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    Fast Processing
                  </h3>
                  <p className="text-sm text-gray-600">Results in minutes</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Shield className="h-6 w-6 text-primary flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    Secure & Private
                  </h3>
                  <p className="text-sm text-gray-600">Your data is safe</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Visual */}
          <div className="relative">
            <div className="aspect-square rounded-2xl bg-gradient-to-br from-purple-100 to-purple-50 p-8 flex items-center justify-center">
              <div className="text-center">
                <div className="inline-flex p-8 bg-white rounded-full shadow-lg mb-6">
                  <Mic className="h-24 w-24 text-primary" />
                </div>
                <div className="space-y-3">
                  <div className="h-3 bg-purple-200 rounded-full w-3/4 mx-auto"></div>
                  <div className="h-3 bg-purple-200 rounded-full w-full mx-auto"></div>
                  <div className="h-3 bg-purple-200 rounded-full w-5/6 mx-auto"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
