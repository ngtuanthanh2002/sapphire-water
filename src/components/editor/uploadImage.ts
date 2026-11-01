import { createBrowserSupabase } from "@/lib/supabase/client";

const MAX_WIDTH = 2000;
const MAX_BYTES = 10 * 1024 * 1024;
const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];

export const IMAGE_ACCEPT = ACCEPTED.join(",");

/** Camera photos run 5–10 MB and post images skip next/image, so shrink them before upload. */
async function shrink(file: File): Promise<Blob> {
  if (file.type === "image/gif") return file; // would lose its animation

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_WIDTH / bitmap.width);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", 0.86));
  return blob && blob.size < file.size ? blob : file;
}

export async function uploadBlogImage(file: File): Promise<string> {
  if (!ACCEPTED.includes(file.type)) throw new Error("Chỉ hỗ trợ ảnh JPG, PNG, WebP, GIF hoặc AVIF.");

  const body = await shrink(file);
  if (body.size > MAX_BYTES) throw new Error("Ảnh lớn hơn 10 MB.");

  const extension = body.type.split("/")[1];
  const path = `${new Date().getFullYear()}/${crypto.randomUUID()}.${extension}`;

  const supabase = createBrowserSupabase();
  const { error } = await supabase.storage
    .from("blog-images")
    .upload(path, body, { contentType: body.type, cacheControl: "31536000" });

  if (error) throw new Error("Không tải được ảnh lên. Vui lòng thử lại.");

  return supabase.storage.from("blog-images").getPublicUrl(path).data.publicUrl;
}
