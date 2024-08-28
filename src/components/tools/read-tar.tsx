import { useState } from "react";
import { ExtractFile } from "@/lib/extract-file";

const ArchiveExtractor = () => {
  const [extractedFiles, setExtractedFiles] = useState<string[]>([]);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    var decoded = await ExtractFile(file);
    // var filenames: string[] = [];
    // Object.keys(decoded).map((key) => {
    //   const file: File = decoded[key];
    //   filenames.push(file.name);
    // });
    setExtractedFiles(decoded.map((data) => data.name));
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      {extractedFiles.length > 0 && (
        <ul>
          {extractedFiles.map((filename, index) => (
            <li key={index}>{filename}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ArchiveExtractor;
