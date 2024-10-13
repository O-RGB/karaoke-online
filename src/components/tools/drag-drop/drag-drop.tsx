"use client";
import Button from "@/components/common/button/button";
import { useDragDrop } from "@/hooks/drag-drop-hook";
import { onSelectTestMusic } from "@/lib/karaoke/read";

import { FC, useEffect } from "react";
import { AiOutlineFile } from "react-icons/ai";

type DragDropProps = {
  setSongPlaying: (song: SongFilesDecode) => void;
};

export const DragDrop: FC<DragDropProps> = ({ setSongPlaying }) => {
  const { isDragging, filesDragging } = useDragDrop();

  const decodeFile = async (files: FileList) => {
    const song = await onSelectTestMusic(undefined, files);
    if (song) {
      setSongPlaying(song);
    }
  };

  useEffect(() => {
    if (filesDragging) {
      decodeFile(filesDragging);
    }
  }, [filesDragging]);

  return (
    <div
      className={`fixed w-screen h-screen ${
        isDragging ? "opacity-100" : "opacity-0"
      } duration-300 bg-red-600`}
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
  );
};
