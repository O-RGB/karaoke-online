// lib/decodeImageFromUrl.ts
import { FileImageCodec } from "../lib/file-image-encoder";

export async function decodeImageFromUrl(imageUrl: string): Promise<File> {
  return new Promise<File>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.referrerPolicy = "no-referrer";

    img.onload = async () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;

        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Cannot get canvas context");

        ctx.drawImage(img, 0, 0);

        const result = await FileImageCodec.decodeImageToFile(canvas);
        const file = new File([result.blob], result.filename, {
          type: result.blob.type,
        });
        resolve(file);
      } catch (err) {
        // ตรวจจับ CORS
        if (
          err instanceof DOMException &&
          /tainted canvas/i.test(err.message)
        ) {
          reject(new Error("ไม่สามารถอ่านภาพได้เพราะติด CORS (Cross-Origin)."));
        } else {
          reject(err);
        }
      }
    };

    img.onerror = () => {
      reject(
        new Error("โหลดภาพไม่สำเร็จ อาจเป็นปัญหา CORS หรือ URL ไม่ถูกต้อง")
      );
    };

    img.src = imageUrl.trim();
  });
}
