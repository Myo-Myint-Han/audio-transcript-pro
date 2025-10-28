import fs from "fs";
import path from "path";
import FormData from "form-data";
import axios from "axios";
import os from "os";

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

console.log("🔑 Groq API:", !!GROQ_API_KEY);
console.log("🔑 OpenAI API:", !!OPENAI_API_KEY);

function getAudioContentType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  const types: Record<string, string> = {
    ".mp3": "audio/mpeg",
    ".wav": "audio/wav",
    ".m4a": "audio/x-m4a",
    ".ogg": "audio/ogg",
    ".webm": "audio/webm",
    ".flac": "audio/flac",
    ".aac": "audio/aac",
  };
  return types[ext] || "audio/webm";
}

async function downloadFile(url: string): Promise<string> {
  console.log("📥 Downloading file from URL:", url);

  // Create temp file
  const tempDir = os.tmpdir();
  const filename = `audio-${Date.now()}.webm`;
  const tempPath = path.join(tempDir, filename);

  // Download file
  const response = await axios.get(url, {
    responseType: "arraybuffer",
    timeout: 30000, // 30 second timeout
  });

  fs.writeFileSync(tempPath, response.data);
  console.log("✅ File downloaded to:", tempPath);

  return tempPath;
}

export async function transcribeAudio(
  filePathOrUrl: string,
  language: "en" | "my"
): Promise<string> {
  let filePath = filePathOrUrl;
  let isTemp = false;

  // If URL, download it first
  if (filePathOrUrl.startsWith("http")) {
    console.log("📥 Downloading file from URL...");
    filePath = await downloadFile(filePathOrUrl);
    isTemp = true;
  }

  try {
    // Priority 1: OpenAI for Myanmar (most accurate)
    if (
      language === "my" &&
      OPENAI_API_KEY &&
      OPENAI_API_KEY.startsWith("sk-")
    ) {
      try {
        console.log("\n🎯 Using OpenAI Whisper (Premium) for Myanmar...");

        const form = new FormData();
        form.append("file", fs.createReadStream(filePath), {
          filename: path.basename(filePath),
          contentType: getAudioContentType(filePath),
        });
        form.append("model", "whisper-1");
        form.append("language", "my");
        form.append("response_format", "json");
        form.append("prompt", "မြန်မာဘာသာစကား");

        const response = await axios.post(
          "https://api.openai.com/v1/audio/transcriptions",
          form,
          {
            headers: {
              ...form.getHeaders(),
              Authorization: `Bearer ${OPENAI_API_KEY}`,
            },
            maxBodyLength: Infinity,
          }
        );

        if (response.data?.text) {
          console.log(`   ✅ OpenAI Success!`);
          return response.data.text;
        }
      } catch (error: any) {
        console.error(
          `   ❌ OpenAI error:`,
          error.response?.data?.error || error.message
        );
        console.log(`   ⤵️ Falling back to Groq...`);
      }
    }

    // Priority 2: Groq (works for both languages)
    if (GROQ_API_KEY && GROQ_API_KEY.startsWith("gsk_")) {
      try {
        console.log(`\n🎯 Using Groq Whisper API...`);
        console.log(`   Model: whisper-large-v3`);
        console.log(`   File: ${path.basename(filePath)}`);
        console.log(`   Language: ${language}`);

        const form = new FormData();
        form.append("file", fs.createReadStream(filePath), {
          filename: path.basename(filePath),
          contentType: getAudioContentType(filePath),
        });
        form.append("model", "whisper-large-v3");
        form.append("language", language === "my" ? "my" : "en");
        form.append("response_format", "json");

        if (language === "my") {
          form.append("prompt", "မြန်မာဘာသာစကား");
        } else {
          form.append("prompt", "This is spoken in English.");
        }

        form.append("temperature", "0");

        const response = await axios.post(
          "https://api.groq.com/openai/v1/audio/transcriptions",
          form,
          {
            headers: {
              ...form.getHeaders(),
              Authorization: `Bearer ${GROQ_API_KEY}`,
            },
            maxBodyLength: Infinity,
            maxContentLength: Infinity,
            timeout: 60000, // 60 second timeout
          }
        );

        if (response.data && response.data.text) {
          const text = response.data.text.trim();
          console.log(`   ✅ Success! Length: ${text.length} chars`);
          return text;
        }

        throw new Error("No text in response");
      } catch (error: any) {
        console.error(
          `   ❌ Groq error:`,
          error.response?.data || error.message
        );
      }
    }

    console.log("\n⚠️ No API available");
    return getDemoTranscription(filePath, language);
  } finally {
    // Clean up temp file
    if (isTemp && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log("🗑️ Cleaned up temp file");
    }
  }
}

function getDemoTranscription(filePath: string, language: "en" | "my"): string {
  const stats = fs.existsSync(filePath) ? fs.statSync(filePath) : null;
  const fileName = path.basename(filePath);
  const sizeKB = stats ? Math.round(stats.size / 1024) : 0;

  if (language === "my") {
    return `[သရုပ်ပြမှုဒ် - API Key လိုအပ်သည်]

📁 ${fileName}
💾 ${sizeKB} KB

🎯 မြန်မာဘာသာ မှတ်တမ်းတင်ရန်:

✅ **Groq** (အခမဲ့):
   - အလုပ်လုပ်သည် ✓
   - တခါတရံ ထိုင်းစာလုံးများ ရောနှောနိုင်သည်
   - လက်ရှိတွင် အလုပ်မလုပ်ပါ

💎 **OpenAI** ($0.006/မိနစ်):
   - အကောင်းဆုံး တိကျမှု ✓
   - platform.openai.com တွင် key ရယူပါ

💡 အကြံပြုချက်: OpenAI ကို အသုံးပြုပါ ($5 = ~14 နာရီ)`;
  }

  return `[DEMO MODE - API Key Required]

📁 ${fileName}
💾 ${sizeKB} KB

🎯 For Myanmar transcription:

✅ **Groq** (FREE):
   - Works ✓
   - Sometimes mixes Thai characters
   - Currently not working

💎 **OpenAI** ($0.006/min):
   - Best accuracy ✓
   - Perfect Myanmar script ✓
   - Get key at: platform.openai.com

💡 Tip: Use OpenAI for Myanmar ($5 = ~14 hours)`;
}
