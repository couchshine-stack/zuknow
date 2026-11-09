import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomBytes } from "crypto";

const ALLOWED = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/gif", "gif"],
]);

const MAX_BYTES = 5 * 1024 * 1024;

export async function saveUploadedImage(file: File) {
  const ext = ALLOWED.get(file.type);
  if (!ext) {
    return { error: "Use a JPG, PNG, WEBP, or GIF." };
  }
  if (file.size > MAX_BYTES) {
    return { error: "Keep the photo under 5 MB." };
  }
  const buffer = Buffer.from(await file.arrayBuffer());
  const name = `${Date.now()}-${randomBytes(6).toString("hex")}.${ext}`;
  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, name), buffer);
  return { url: `/uploads/${name}` };
}
