import React, { useState } from "react";
import {
  directoryOpen,
  FileWithDirectoryAndFileHandle,
} from "browser-fs-access";
import { ExtractFile } from "@/lib/zip";
import UpdateFile from "../common/upload";
import Button from "../common/button/button";

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
    <div className="flex items-center justify-center w-full">
      <Button color="blur-overlay" onClick={handleOpenFolder}>
        <div className="text-white">Open Folder Karaoke online</div>
      </Button>
    </div>
  );
};

export default FolderReader;
