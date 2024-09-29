"use client";
import Button from "@/components/common/button/button";
import { createContext, FC, useEffect, useState } from "react";
import { AiOutlineFile } from "react-icons/ai";

type DragDropContextType = {
  isDragging: boolean;
  filesDragging: FileList | undefined;
};

type DragDropProviderProps = {
  children: React.ReactNode;
};

export const DragDropContext = createContext<DragDropContextType>({
  isDragging: false,
  filesDragging: undefined,
});

export const DragDropProvider: FC<DragDropProviderProps> = ({ children }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [filesDragging, setFilesDragging] = useState<FileList>();

  useEffect(() => {
    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
    };

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = e.dataTransfer?.files;
      if (files) {
        setFilesDragging(files);
      }
    };

    window.addEventListener("dragenter", handleDragEnter);
    window.addEventListener("dragover", handleDragOver);
    window.addEventListener("drop", handleDrop);

    return () => {
      window.removeEventListener("dragenter", handleDragEnter);
      window.removeEventListener("dragover", handleDragOver);
      window.removeEventListener("drop", handleDrop);
    };
  }, []);

  return (
    <DragDropContext.Provider value={{ isDragging, filesDragging }}>
      <div
        className={`fixed w-screen h-screen ${
          isDragging ? "opacity-100" : "opacity-0"
        } duration-300`}
      >
        <div className="flex items-center justify-center h-full">
          <Button
            blur={"bg-white/30"}
            className="text-white"
            style={{
              padding: "50px",
            }}
            icon={<AiOutlineFile className="text-2xl"></AiOutlineFile>}
            iconPosition="top"
          >
            ลากไฟล์ .emk หรือ ncn เพื่อเล่นเพลง
          </Button>
        </div>
      </div>

      {children}
    </DragDropContext.Provider>
  );
};
