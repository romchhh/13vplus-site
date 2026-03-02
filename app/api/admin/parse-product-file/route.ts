import { NextRequest, NextResponse } from "next/server";
import mammoth from "mammoth";
import { PDFParse } from "pdf-parse";

const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "Файл не надіслано" },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "Розмір файлу не більше 10 МБ" },
        { status: 413 }
      );
    }

    const ext = file.name.split(".").pop()?.toLowerCase();
    const buffer = Buffer.from(await file.arrayBuffer());

    let text: string;

    switch (ext) {
      case "txt": {
        text = buffer.toString("utf-8");
        break;
      }
      case "doc":
      case "docx": {
        const result = await mammoth.extractRawText({ buffer });
        text = result.value;
        break;
      }
      case "pdf": {
        const parser = new PDFParse({
          data: new Uint8Array(buffer),
        });
        try {
          const result = await parser.getText();
          text = result.text;
        } finally {
          await parser.destroy();
        }
        break;
      }
      default:
        return NextResponse.json(
          { error: "Підтримуються лише .txt, .pdf, .doc, .docx" },
          { status: 400 }
        );
    }

    if (!text || !text.trim()) {
      return NextResponse.json(
        { error: "Не вдалося отримати текст із файлу" },
        { status: 422 }
      );
    }

    return NextResponse.json({ text: text.trim() });
  } catch (err) {
    console.error("parse-product-file error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Помилка обробки файлу" },
      { status: 500 }
    );
  }
}
