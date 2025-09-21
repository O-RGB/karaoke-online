"use client";
import React, { useEffect, useRef, useState } from "react";
import { FileImageCodec } from "../lib/file-image-encoder";

interface ImageDecoderFromUrlProps {
  imageUrl?: string;
  onDecoded?: (file: File) => void;
  onFail?: (message: string) => void; // ให้ noti เรียกจาก callback นี้
}

const ImageDecoderFromUrl: React.FC<ImageDecoderFromUrlProps> = ({
  imageUrl,
  onDecoded,
  onFail,
}) => {
  const hiddenImgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (imageUrl && hiddenImgRef.current) {
      hiddenImgRef.current.src = imageUrl.trim();
    }
  }, [imageUrl]);

  const handleHiddenImageLoaded = async () => {
    if (!hiddenImgRef.current) return;
    try {
      const img = hiddenImgRef.current;
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Cannot get canvas context");

      ctx.drawImage(img, 0, 0); // ถ้า CORS ไม่ถูกต้อง จะ throw DOMException

      const result = await FileImageCodec.decodeImageToFile(canvas);

      const file = new File([result.blob], result.filename, {
        type: result.blob.type,
      });

      onDecoded?.(file);
    } catch (error: any) {
      console.error("Decoding from URL failed:", error);

      // ตรวจจับข้อความที่สื่อว่าเป็น CORS
      if (
        error instanceof DOMException &&
        /tainted canvas/i.test(error.message)
      ) {
        onFail?.("ไม่สามารถอ่านภาพได้เพราะติด CORS (Cross-Origin).");
      } else {
        onFail?.("Decoding from URL failed");
      }
    }
  };

  const handleImageError = () => {
    onFail?.("โหลดภาพไม่สำเร็จ อาจเป็นปัญหา CORS หรือ URL ไม่ถูกต้อง");
  };

  return (
    <img
      ref={hiddenImgRef}
      alt="hidden"
      referrerPolicy="no-referrer"
      style={{ display: "none" }}
      onLoad={handleHiddenImageLoaded}
      onError={handleImageError}
      crossOrigin="anonymous"
    />
  );
};

export default ImageDecoderFromUrl;
