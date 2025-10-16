// lib/decodeImageFromUrl.ts
import { FileImageCodec } from "../lib/file-image-encoder";

export async function decodeImageFromUrl(imageUrl: string): Promise<File> {
  console.log("[decodeImageFromUrl] เริ่มโหลดภาพจาก URL:", imageUrl);

  return new Promise<File>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.referrerPolicy = "no-referrer";

    img.onload = async () => {
      console.log("[decodeImageFromUrl] ✅ โหลดภาพสำเร็จ");
      console.log("[decodeImageFromUrl] ขนาดภาพ:", {
        width: img.naturalWidth,
        height: img.naturalHeight,
      });

      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        console.log("[decodeImageFromUrl] 🧩 สร้าง canvas สำเร็จ:", {
          width: canvas.width,
          height: canvas.height,
        });

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          console.error("[decodeImageFromUrl] ❌ ไม่สามารถสร้าง context ได้");
          throw new Error("Cannot get canvas context");
        }

        ctx.drawImage(img, 0, 0);
        console.log("[decodeImageFromUrl] 🖼️ วาดภาพลง canvas แล้ว");

        console.log(
          "[decodeImageFromUrl] 🔍 เริ่ม decode ด้วย FileImageCodec..."
        );
        const result = await FileImageCodec.decodeImageToFile(canvas);
        console.log("[decodeImageFromUrl] ✅ Decode เสร็จสิ้น:", result);

        const file = new File([result.blob], result.filename, {
          type: result.blob.type,
        });
        console.log("[decodeImageFromUrl] 📦 สร้างไฟล์สำเร็จ:", {
          name: file.name,
          type: file.type,
          size: file.size,
        });

        resolve(file);
      } catch (err: any) {
        console.error(
          "[decodeImageFromUrl] ❌ เกิดข้อผิดพลาดระหว่าง decode:",
          err
        );

        // ตรวจจับ CORS
        if (
          err instanceof DOMException &&
          /(taint|cross-origin)/i.test(err.message)
        ) {
          reject(new Error("ไม่สามารถอ่านภาพได้เพราะติด CORS (Cross-Origin)."));
        } else {
          reject(err);
        }
      }
    };

    img.onerror = (err) => {
      console.error("[decodeImageFromUrl] ❌ โหลดภาพไม่สำเร็จ:", err, imageUrl);
      reject(
        new Error("โหลดภาพไม่สำเร็จ อาจเป็นปัญหา CORS หรือ URL ไม่ถูกต้อง")
      );
    };

    console.log("[decodeImageFromUrl] 🔗 ตั้งค่า src:", imageUrl.trim());
    img.src = imageUrl.trim();
  });
}
