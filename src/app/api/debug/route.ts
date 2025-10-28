import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  return Response.json({
    environment: process.env.NODE_ENV,
    hasJwtSecret: !!process.env.JWT_SECRET,
    jwtSecretPreview: process.env.JWT_SECRET?.substring(0, 10) + "...",
    hasSupabaseUrl: !!process.env.SUPABASE_DATABASE_URL,
    hasSupabasePublicUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasSupabaseAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    hasGroqKey: !!process.env.GROQ_API_KEY,
    timestamp: new Date().toISOString(),
  });
}
