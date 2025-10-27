import Link from "next/link";
import { Mic, Mail, MapPin, Phone } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-gray-50 border-t">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="bg-primary p-2 rounded-lg">
                <Mic className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold">
                Transcript<span className="text-primary">Pro</span>
              </span>
            </div>
            <p className="text-sm text-gray-600">
              Professional audio transcription service supporting English and
              Myanmar languages.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/transcribe"
                  className="text-sm text-gray-600 hover:text-primary"
                >
                  Start Transcribing
                </Link>
              </li>
              <li>
                <Link
                  href="/pricing"
                  className="text-sm text-gray-600 hover:text-primary"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard"
                  className="text-sm text-gray-600 hover:text-primary"
                >
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/help"
                  className="text-sm text-gray-600 hover:text-primary"
                >
                  Help Center
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-sm text-gray-600 hover:text-primary"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-sm text-gray-600 hover:text-primary"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-center text-sm text-gray-600">
                <Mail className="h-4 w-4 mr-2" />
                support@transcriptpro.com
              </li>
              <li className="flex items-center text-sm text-gray-600">
                <Phone className="h-4 w-4 mr-2" />
                +95 9 123 456 789
              </li>
              <li className="flex items-center text-sm text-gray-600">
                <MapPin className="h-4 w-4 mr-2" />
                Yangon, Myanmar
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-sm text-gray-600">
          <p>© 2025 TranscriptPro. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
