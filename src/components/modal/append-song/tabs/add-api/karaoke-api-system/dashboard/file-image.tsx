"use client";
import React, { useState, useEffect } from "react";
import { FileImageCodec } from "../lib/file-image-encoder";
import Button from "@/components/common/button/button";
import { FaDownload } from "react-icons/fa";

interface FileImageEncoderProps {
  fileToEncode?: File;
  onEncoded?: (dataUrl: string, filename: string) => void;
}

const FileImageEncoder: React.FC<FileImageEncoderProps> = ({
  fileToEncode,
  onEncoded,
}) => {
  const [encodedImage, setEncodedImage] = useState<string>("");
  const [filename, setFilename] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!fileToEncode) return;

    const encodeFile = async () => {
      setIsProcessing(true);
      try {
        if (fileToEncode.size > 1024 * 1024) {
          alert("File size must be less than 1MB");
          setIsProcessing(false);
          return;
        }

        const { canvas, filename } = await FileImageCodec.encodeFileToImage(
          fileToEncode
        );
        const dataUrl = canvas.toDataURL("image/png");
        setEncodedImage(dataUrl);
        setFilename(filename);
        onEncoded?.(dataUrl, filename);
      } catch (error) {
        console.error("Encoding failed:", error);
        alert("Encoding failed");
      }
      setIsProcessing(false);
    };

    encodeFile();
  }, [fileToEncode, onEncoded]);

  const handleDownload = () => {
    if (!encodedImage) return;

    fetch(encodedImage)
      .then((res) => res.blob())
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${filename}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      });
  };

  return (
    <div className="">
      {encodedImage && (
        <div className="border border-dashed border-gray-300 flex flex-col gap-2 py-2 items-center justify-center">
          <img
            src={encodedImage}
            alt="Encoded"
            className="max-w-[200px] max-h-[200px] border border-gray-300 rounded select-none pointer-events-none"
          />
          <p className="text-xs text-gray-500 text-center mt-1">
            นำภาพนี้ไปอัปโหลดที่ Google Drive หรือเว็บฝากรูป จากนั้นกด Shared
            และนำ URL มาใส่ที่ Direct Link
          </p>
          <Button
            className="!p-2 !h-7 !gap-1 font-light"
            onClick={handleDownload}
            icon={<FaDownload className="text-xs font-light" />}
          >
            Download Image
          </Button>
        </div>
      )}
    </div>
  );
};

export default FileImageEncoder;
