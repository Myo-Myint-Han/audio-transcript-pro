import { Upload, Zap, Download } from "lucide-react";

export function HowItWorksSection() {
  const steps = [
    {
      icon: Upload,
      title: "Upload Audio",
      description: "Drag and drop your audio file or select from your device",
      step: "01",
    },
    {
      icon: Zap,
      title: "AI Processing",
      description:
        "Our AI analyzes and transcribes your audio with high accuracy",
      step: "02",
    },
    {
      icon: Download,
      title: "Download Transcript",
      description:
        "Get your transcript in your preferred format (TXT, PDF, DOCX)",
      step: "03",
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Three simple steps to get your transcription
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full text-white font-bold text-xl mb-4">
                  {step.step}
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border-2 border-gray-100">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mb-4">
                    <step.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-8 left-1/2 w-full h-0.5 bg-primary/20 -z-10" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
