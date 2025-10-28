import { supabase } from "./supabase";

export interface ParsedFile {
  filepath: string;
  originalFilename: string | null;
  mimetype: string | null;
  size: number;
  newFilename: string;
}

export interface ParsedFormData {
  fields: Record<string, string>;
  files: Record<string, ParsedFile>;
}

export async function parseForm(request: Request): Promise<ParsedFormData> {
  const formData = await request.formData();
  const fields: Record<string, string> = {};
  const files: Record<string, ParsedFile> = {};

  for (const [key, value] of formData.entries()) {
    if (value instanceof File) {
      // Handle file upload to Supabase Storage
      const buffer = Buffer.from(await value.arrayBuffer());
      const filename = `${Date.now()}-${value.name}`;
      const filepath = `${filename}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from("audio-files")
        .upload(filepath, buffer, {
          contentType: value.type,
          cacheControl: "3600",
          upsert: false,
        });

      if (error) {
        console.error("Upload error:", error);
        throw new Error(`Failed to upload file: ${error.message}`);
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("audio-files").getPublicUrl(filepath);

      files[key] = {
        filepath: publicUrl,
        originalFilename: value.name,
        mimetype: value.type,
        size: value.size,
        newFilename: filename,
      };
    } else {
      // Handle field
      fields[key] = value;
    }
  }

  return { fields, files };
}
