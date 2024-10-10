// components/FileUpload.tsx
"use client";
import React, { useState } from "react";

const FileUpload: React.FC = () => {
  const [fileId, setFileId] = useState<string>();
  const [file, setFile] = useState<File | null>(null);
  const [base64, setBase64] = useState<string>("");

  // Function to handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      convertToBase64(selectedFile);
    }
  };

  // Function to convert file to base64
  const convertToBase64 = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64data = reader.result as string; // Type assertion
      setBase64(base64data.split(",")[1]); // Get base64 part
    };
    reader.readAsDataURL(file); // Read the file and convert to base64
  };

  function QueryPost(params: any): FormData {
    const formData = new FormData();
    Object.keys(params).map((key) => {
      if (params[key] !== undefined) {
        if (Array.isArray(params[key])) {
          formData.append(key, JSON.stringify(params[key]));
        } else {
          formData.append(key, params[key]);
        }
      }
    });

    return formData;
  }

  // Function to handle file upload
  const handleUpload = async () => {
    if (base64 && file) {
      const form = QueryPost({
        file: base64,
        fileName: file.name,
      });
      try {
        console.log({
          file: base64,
          fileName: file.name,
        });
        const response = await fetch(
          "https://script.google.com/macros/s/AKfycbwigJ1jlBZdXhIvmxTmt9orru9t3xRda8CxqUHSISl3a-8pzv_2sp_aTUcJfVeEq-uR/exec",
          {
            method: "POST",
            body: form,
          }
        );

        const result = await response.json();
        console.log(result); // Handle the response from the server
      } catch (error) {
        console.error("Error uploading file:", error);
      }
    } else {
      alert("No file selected");
    }
  };

  const handleGetFile = async () => {
    const form = QueryPost({
      fun: "LOAD",
      index: 8,
    });
    try {
      const response = await fetch(
        "https://script.google.com/macros/s/AKfycbysqusweMz1-fSqpGfyTgWkVtBbpSHfDqUvKZXQoWkg6tJF0OgEvtHkjNo8NFm1vPNu/exec",
        {
          method: "POST",
          body: form,
        }
      );

      const result = await response.json();
      console.log(result); // Handle the response from the server
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  return (
    <div className="fixed z-50">
      {/* <input type="file" onChange={handleFileChange} />
      {file && (
        <div>
          <p>Selected file: {file.name}</p>
          <button onClick={handleUpload}>Upload</button>
        </div>
      )}
      {base64 && (
        <div>
          <h3>Base64 String:</h3>
          <textarea value={base64} readOnly rows={5} cols={50}></textarea>
        </div>
      )}
      <br /> */}
      test get file by id
      <div className="flex gap-2 border bg-white text-black">
        {/* <input
          type="text"
          onChange={(e) => {
            const value = e.target.value;
            setFileId(value);
          }}
        /> */}
        <button type="button" onClick={handleGetFile}>
          get
        </button>
      </div>
    </div>
  );
};

export default FileUpload;
