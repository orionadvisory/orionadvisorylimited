import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";
import * as XLSX from "xlsx";

const MAX_CHARS = 8000;

export async function extractText(buffer: Buffer, fileName: string): Promise<string> {
  const ext = fileName.toLowerCase().split(".").pop();

  if (ext === "pdf") {
    const parser = new PDFParse(buffer);
    const result = await parser.getText();
    return result.text.slice(0, MAX_CHARS);
  }

  if (ext === "docx") {
    const result = await mammoth.extractRawText({ buffer });
    return result.value.slice(0, MAX_CHARS);
  }

  if (ext === "doc") {
    return `[Word .doc file uploaded: ${fileName} — please convert to .docx for text extraction]`;
  }

  if (ext === "xlsx" || ext === "xls") {
    const workbook = XLSX.read(buffer, { type: "buffer" });
    let text = "";
    for (const sheetName of workbook.SheetNames) {
      const sheet = workbook.Sheets[sheetName];
      text += `[Sheet: ${sheetName}]\n`;
      text += XLSX.utils.sheet_to_csv(sheet) + "\n\n";
    }
    return text.slice(0, MAX_CHARS);
  }

  if (ext === "csv") {
    return buffer.toString("utf-8").slice(0, MAX_CHARS);
  }

  if (ext === "txt" || ext === "md") {
    return buffer.toString("utf-8").slice(0, MAX_CHARS);
  }

  if (ext === "png" || ext === "jpg" || ext === "jpeg") {
    return `[Image uploaded: ${fileName} — visual content not extracted]`;
  }

  return `[File uploaded: ${fileName} — content not extracted]`;
}
