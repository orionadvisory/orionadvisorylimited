import mammoth from "mammoth";
import * as XLSX from "xlsx";

const MAX_CHARS = 8000;

export async function extractText(buffer: Buffer, fileName: string): Promise<string> {
  const ext = fileName.toLowerCase().split(".").pop();

  if (ext === "pdf") {
    // pdf-parse pulls in pdfjs, which references DOM globals (DOMMatrix) at
    // load time and crashes the serverless runtime. Import it lazily and fail
    // soft so a PDF upload can never take down the whole assessment.
    try {
      const { PDFParse } = await import("pdf-parse");
      const parser = new PDFParse(buffer);
      const result = await parser.getText();
      return result.text.slice(0, MAX_CHARS);
    } catch (err) {
      console.error("PDF text extraction failed:", err);
      return `[PDF uploaded: ${fileName} — text could not be extracted]`;
    }
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
