import React from "react";
import Upload from "../common/input-data/upload";
import Button from "../common/button/button";
import { useWallpaper } from "@/hooks/wallpaper.hook";

interface WallpaperModalProps {}

const WallpaperModal: React.FC<WallpaperModalProps> = ({}) => {
  const { changeWallpaper } = useWallpaper();

  return (
    <>
      <Upload onSelectFile={changeWallpaper}>
        <Button>อัปโหลดรูปภาพ</Button>
      </Upload>
    </>
  );
};

export default WallpaperModal;
