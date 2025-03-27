"use client";
import { useState } from "react";

export default function Home() {
  const [fontFile, setFontFile] = useState<File | null>(null);
  const [fontUrl, setFontUrl] = useState<string | null>(null);

  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setFontFile(file);
      setFontUrl(url);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4"
      style={{ fontFamily: fontFile ? "customFont" : "sans-serif" }}
    >
      {fontUrl && (
        <style>
          {`
            @font-face {
              font-family: 'customFont';
              src: url(${fontUrl}) format('truetype');
            }
          `}
        </style>
      )}
      <h1 className="text-3xl font-bold mb-4">Upload a Font</h1>
      <input
        type="file"
        accept=".ttf,.otf"
        onChange={handleUpload}
        className="mb-4"
      />
      {fontFile && <p className="mt-2">Current font: {fontFile.name}</p>}
      <p className="mt-4">This text changes based on the uploaded font.</p>
    </div>
  );
}
