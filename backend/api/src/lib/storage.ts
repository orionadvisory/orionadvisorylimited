/** Object storage (Cloudflare R2) + text extraction, behind an interface so tests can fake it. */
export interface Storage {
  put(key: string, body: string | Uint8Array, contentType: string): Promise<void>;
  getBuffer(key: string): Promise<Buffer>;
  delete(key: string): Promise<void>;
  signedUrl(key: string, expiresInSeconds?: number): Promise<string>;
  extractText(buffer: Buffer, fileName: string): Promise<string>;
}

export const r2Storage: Storage = {
  async put(key, body, contentType) {
    const { uploadFile } = await import("@orion/core/storage/r2");
    await uploadFile(key, body, contentType);
  },
  async getBuffer(key) {
    const { getFileBuffer } = await import("@orion/core/storage/r2");
    return getFileBuffer(key);
  },
  async delete(key) {
    const { deleteFile } = await import("@orion/core/storage/r2");
    await deleteFile(key);
  },
  async signedUrl(key, expiresInSeconds = 3600) {
    const { getFileUrl } = await import("@orion/core/storage/r2");
    return getFileUrl(key, expiresInSeconds);
  },
  async extractText(buffer, fileName) {
    // Lazy: pulls in mammoth/xlsx/pdf-parse only when a document is actually analysed.
    const { extractText } = await import("@orion/core/extract-text");
    return extractText(buffer, fileName);
  },
};

/** Make a user-supplied file name safe to embed in an object key. */
export function safeFileName(name: string): string {
  const base = name.split(/[\\/]/).pop() ?? "file";
  const cleaned = base.replace(/[^\w.\- ]+/g, "_").replace(/\s+/g, "_").replace(/^\.+/, "");
  return (cleaned || "file").slice(0, 120);
}
