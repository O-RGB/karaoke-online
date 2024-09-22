import React from "react";
import Upload from "../common/input-data/upload";
import Button from "../common/button/button";
import { imageToBase64 } from "@/lib/image";
import { useAppControl } from "@/hooks/app-control-hook";

interface WallpaperModalProps {}

const WallpaperModal: React.FC<WallpaperModalProps> = ({}) => {
  const { wallpaper, changeWallpaper } = useAppControl();

  return (
    <>
      <Upload onSelectFile={changeWallpaper}>
        <Button>อัปโหลดรูปภาพ</Button>
      </Upload>
    </>
  );
};

export default WallpaperModal;
