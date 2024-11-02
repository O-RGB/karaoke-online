"use client";
import { Fetcher } from "@/utils/api/fetch";
import React, { useState } from "react";

interface TestUploadedProps {}

const TestUploaded: React.FC<TestUploadedProps> = () => {
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0]);
    }
  };

  const testload = async () => {
    const res = await Fetcher(
      "https://script.google.com/macros/s/AKfycbwptoKkyMQ2xzcwOVAqTjujFUd8WDd6Q6QWqNzbBa0iQG1P_Wzp9WpCUhxWfbC9e8CM/exec",
      { index: 1, custom: false },
      "LOAD"
    );

    console.log(res);
  };

  const uploadFile = async () => {
    if (!file) return;

    try {
      // Convert file to ArrayBuffer
      const fileBytes = await file.arrayBuffer();
      const byteArray = Array.from(new Uint8Array(fileBytes));

      const response = await Fetcher(
        "https://script.google.com/macros/s/AKfycbwzDVQWPv2-KkYzPxnbYtuGKPtKDhJHr9P17_2dH9Oq20iNv7Y6rS3wJk_4agmE5FCg/exec",
        { fileBytes: byteArray },
        "SAVE"
      );

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      console.log("File uploaded successfully!");
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  return (
    <>
      <input type="file" onChange={handleFileChange} />
      <button onClick={uploadFile}>Upload File</button>

      <button onClick={testload}>test load file </button>
    </>
  );
};

export default TestUploaded;
