import formidable from "formidable";
import fs from "fs";
import path from "path";

export const uploadDir = path.join(process.cwd(), "public", "uploads");

// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

interface ParsedFile {
  filepath: string;
  originalFilename: string | null;
  mimetype: string | null;
  size: number;
  newFilename: string;
}

interface ParsedFormData {
  fields: Record<string, string>;
  files: Record<string, ParsedFile>;
}

export async function parseForm(request: Request): Promise<ParsedFormData> {
  const formData = await request.formData();
  const fields: Record<string, string> = {};
  const files: Record<string, ParsedFile> = {};

  for (const [key, value] of formData.entries()) {
    if (value instanceof File) {
      // Handle file
      const buffer = Buffer.from(await value.arrayBuffer());
      const filename = `${Date.now()}-${value.name}`;
      const filepath = path.join(uploadDir, filename);

      fs.writeFileSync(filepath, buffer);

      files[key] = {
        filepath,
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
