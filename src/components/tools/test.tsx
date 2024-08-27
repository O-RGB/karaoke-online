import { ExtractFile } from "@/lib/extract-file";
import React from "react";
import { useState } from "react";
import { FaFile } from "react-icons/fa";

const FetchFileComponent: React.FC = () => {
  const [fileType, setFileType] = useState<number>(0);
  const [fileId, setFileId] = useState<string>("");

  const [extractedFiles, setExtractedFiles] = useState<string[]>([]);

  const fetchFile = async () => {
    try {
      const response = await fetch("http://127.0.0.1:5000/get-file", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ type: fileType, fileId }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      var decoded = await ExtractFile(new File([blob], fileId));
      var filenames: string[] = [];
      Object.keys(decoded).map((key) => {
        const file: File = decoded[key];
        filenames.push(file.name);
      });
      setExtractedFiles(filenames);
      //   setFileUrl(url);
    } catch (error) {
      console.error("Error fetching file:", error);
    }
  };

  return (
    <div className="bg-white p-2 flex flex-col gap-1">
      <label htmlFor="" className="text-sm text-gray-500">
        Type:
      </label>
      <input
        type="number"
        className="border"
        value={fileType}
        onChange={(e) => setFileType(parseInt(e.target.value))}
        placeholder="Enter type (0 or 1)"
      />
      <label htmlFor="" className="text-sm text-gray-500">
        FileID:
      </label>
      <input
        type="text"
        className="border"
        value={fileId}
        onChange={(e) => setFileId(e.target.value)}
        placeholder="Enter fileId"
      />
      <button onClick={fetchFile}>Fetch File</button>
      Extracted File:
      <div className="p-2 border">
        {extractedFiles.map((data, index) => {
          return (
            <React.Fragment key={`extracted-file-${index}`}>
              <div className="flex gap-1 items-center ">
                <FaFile className="text-lg"></FaFile>
                {data}
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default FetchFileComponent;
