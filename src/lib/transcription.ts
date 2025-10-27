import fs from "fs";
import path from "path";
import FormData from "form-data";
import axios from "axios";

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
  return types[ext] || "audio/wav";
}

export async function transcribeAudio(
  filePath: string,
  language: "en" | "my"
): Promise<string> {
  // Priority 1: OpenAI for Myanmar (most accurate)
  if (language === "my" && OPENAI_API_KEY && OPENAI_API_KEY.startsWith("sk-")) {
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

      // Better Myanmar prompt
      form.append("prompt", "မင်္ဂလာပါ။ ဒါကမြန်မာစကားဖြစ်ပါတယ်။");

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
        console.log(`   📝 Length: ${response.data.text.length} chars`);

        const hasMyanmarScript = /[\u1000-\u109F]/.test(response.data.text);
        const hasThaiScript = /[\u0E00-\u0E7F]/.test(response.data.text);
        console.log(
          `   Myanmar: ${hasMyanmarScript ? "✅" : "❌"} | Thai: ${
            hasThaiScript ? "⚠️" : "✅"
          }`
        );

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
      console.log(
        `   Language: ${language} (${
          language === "my" ? "Myanmar" : "English"
        })`
      );

      const form = new FormData();

      form.append("file", fs.createReadStream(filePath), {
        filename: path.basename(filePath),
        contentType: getAudioContentType(filePath),
      });
      form.append("model", "whisper-large-v3");
      form.append("language", language === "my" ? "my" : "en");
      form.append("response_format", "json");

      // Enhanced prompts
      if (language === "my") {
        // Longer, more specific Myanmar prompt to guide the model
        form.append(
          "prompt",
          "မင်္ဂလာပါ။ ဒါကမြန်မာဘာသာစကားဖြစ်ပါတယ်။ ကျွန်တော်မြန်မာလိုပြောနေပါတယ်။"
        );
        console.log("   📝 Using enhanced Myanmar prompt");
      } else {
        form.append("prompt", "This is spoken in English.");
        console.log("   📝 Using English prompt");
      }

      // Lower temperature for more consistent output
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
        }
      );

      console.log(`   📥 Status: ${response.status}`);

      if (response.data && response.data.text) {
        const text = response.data.text.trim();
        console.log(`   ✅ Success! Length: ${text.length} chars`);
        console.log(`   Preview: "${text.substring(0, 80)}..."`);

        const hasMyanmarScript = /[\u1000-\u109F]/.test(text);
        const hasThaiScript = /[\u0E00-\u0E7F]/.test(text);

        console.log(
          `   Myanmar: ${hasMyanmarScript ? "✅" : "❌"} | Thai: ${
            hasThaiScript ? "⚠️" : "✅"
          }`
        );

        // Clean up mixed scripts if Myanmar was requested
        if (language === "my" && hasThaiScript && hasMyanmarScript) {
          console.log(
            `   ⚠️ Mixed scripts detected - some Thai characters present`
          );
          console.log(
            `   💡 Tip: Speak more clearly or use OpenAI API for better Myanmar accuracy`
          );
        }

        return text;
      }

      throw new Error("No text in response");
    } catch (error: any) {
      console.error(`   ❌ Groq error:`, error.response?.data || error.message);
    }
  }

  console.log("\n⚠️ No API available");
  return getDemoTranscription(filePath, language);
}

function getDemoTranscription(filePath: string, language: "en" | "my"): string {
  const stats = fs.statSync(filePath);
  const fileName = path.basename(filePath);
  const sizeKB = Math.round(stats.size / 1024);
  const duration = Math.round(stats.size / (128000 / 8));

  if (language === "my") {
    return `[သရုပ်ပြမုဒ် - API Key လိုအပ်သည်]

📁 ${fileName}
💾 ${sizeKB} KB | ⏱️ ~${duration} စက္ကန့်

🎯 မြန်မာဘာသာ မှတ်တမ်းတင်ရန်:

✅ **Groq** (အခမဲ့):
   - အလုပ်လုပ်သည် ✓
   - တခါတရံ ထိုင်းစာလုံးများ ရောနှောနိုင်သည်
   - ရှင်းလင်းစွာပြောဆိုပါ

💎 **OpenAI** ($0.006/မိနစ်):
   - အကောင်းဆုံး တိကျမှု ✓
   - မြန်မာစာလုံးများ ပြည့်စုံစွာ ရရှိမည်
   - platform.openai.com တွင် key ရယူပါ

💡 အကြံပြုချက်: OpenAI ကို အသုံးပြုပါ ($5 = ~14 နာရီ)`;
  }

  return `[DEMO MODE - API Key Required]

📁 ${fileName}
💾 ${sizeKB} KB | ⏱️ ~${duration}s

🎯 For Myanmar transcription:

✅ **Groq** (FREE):
   - Works ✓
   - Sometimes mixes Thai characters
   - Speak clearly for best results

💎 **OpenAI** ($0.006/min):
   - Best accuracy ✓
   - Perfect Myanmar script ✓
   - Get key at: platform.openai.com

💡 Tip: Use OpenAI for Myanmar ($5 = ~14 hours)`;
}
