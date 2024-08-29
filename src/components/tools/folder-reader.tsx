import React, { useState } from "react";
import {
  directoryOpen,
  FileWithDirectoryAndFileHandle,
} from "browser-fs-access";
import { ExtractFile } from "@/lib/extract-file";
import UpdateFile from "../common/upload";

interface FolderReaderProps {
  onSelectFileSystem?: (
    files: Map<string, FileWithDirectoryAndFileHandle>
  ) => void;
  setSongListFile: (file: File) => Promise<void>;
}

const FolderReader: React.FC<FolderReaderProps> = ({
  onSelectFileSystem,
  setSongListFile,
}) => {
  const [files, setFiles] = useState<FileWithDirectoryAndFileHandle[]>([]);

  const handleOpenFolder = async () => {
    try {
      // เปิดไดอะล็อกให้ผู้ใช้เลือกโฟลเดอร์
      const selectedFiles = await directoryOpen({
        recursive: true,
        id: "unique-folder-id",
      });

      // ตรวจสอบประเภทของผลลัพธ์
      if (Array.isArray(selectedFiles)) {
        console.log(selectedFiles);
        // กรองออกเป็นไฟล์
        let fileList = selectedFiles.filter(
          (item): item is FileWithDirectoryAndFileHandle => "name" in item
        );

        const filesMap = new Map();
        fileList.map((item) => {
          if (item.name.endsWith(".json")) {
            setSongListFile(item);
          }
          if (item.name.endsWith(".zip")) {
            let filename = item.name.replace(".zip", "");
            filesMap.set(filename, item);
          }
        });

        onSelectFileSystem?.(filesMap);
        setFiles(fileList);
      }
    } catch (error) {
      console.error("Error reading folder:", error);
    }
  };

  return (
    <div className="flex items-center justify-center w-full ">
      <button
        onClick={handleOpenFolder}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        Open Folder Karaoke online
      </button>
    </div>
  );
};

export default FolderReader;
