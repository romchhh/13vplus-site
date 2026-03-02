import { mkdir, writeFile, unlink } from "fs/promises";
import path from "path";
import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { createLogger } from "@/lib/logger";

const log = createLogger("POST /api/images");

export const runtime = "nodejs";
export const maxDuration = 300; // seconds

// Convert uploaded image to WebP
async function convertToWebP(
  inputPath: string,
  outputDir: string
): Promise<string> {
  const newName = `${crypto.randomUUID()}.webp`;
  const outputPath = path.join(outputDir, newName);

  await sharp(inputPath)
    .rotate() // auto-orient
    .webp({ quality: 80 })
    .toFile(outputPath);

  await unlink(inputPath).catch((err) => {
    log.warn("Failed to remove original after WebP conversion:", err);
  });
  return newName;
}

const VIDEO_EXTENSIONS = ["mp4", "webm", "ogg", "mov", "avi", "mkv", "flv", "wmv"];

function getFileType(mimeType: string, filename: string): "photo" | "video" {
  if (mimeType.startsWith("video/")) return "video";
  const ext = filename.split(".").pop()?.toLowerCase();
  if (ext && VIDEO_EXTENSIONS.includes(ext)) return "video";
  return "photo";
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll("images") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    const uploadDir = path.join(process.cwd(), "product-images");
    await mkdir(uploadDir, { recursive: true });

    const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15 MB
    const savedMedia: { type: "photo" | "video"; url: string }[] = [];

    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: "Max file size is 15MB" },
          { status: 413 }
        );
      }

      const ext = file.name.split(".").pop();
      const uniqueName = `${crypto.randomUUID()}.${ext}`;
      const filePath = path.join(uploadDir, uniqueName);

      log.debug("Uploading file:", file.name, "MIME:", file.type, "Size:", file.size);

      const buffer = Buffer.from(await file.arrayBuffer());
      await writeFile(filePath, buffer);

      const fileType = getFileType(file.type, file.name);
      let finalFileName = uniqueName;

      if (fileType === "photo") {
        try {
          finalFileName = await convertToWebP(filePath, uploadDir);
        } catch (error) {
          log.warn("Failed to convert image, keeping original:", error);
        }
      }

      savedMedia.push({ type: fileType, url: finalFileName });
    }

    return NextResponse.json({ media: savedMedia }, { status: 201 });
  } catch (error) {
    log.error(error);
    return NextResponse.json({ error: "File upload failed" }, { status: 500 });
  }
}
