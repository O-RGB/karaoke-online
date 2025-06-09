import React, { useEffect, useState } from "react";
import Upload from "../common/input-data/upload";
import { FaCheck, FaImage } from "react-icons/fa";
import { RiDeleteBin6Line } from "react-icons/ri";
import { useWallpaperStore } from "@/features/wallpaper-store";
import Tabs from "../common/tabs";
import { IWallpaperDisplay } from "@/utils/indexedDB/db/display/types";

interface WallpaperModalProps {}

const WallpaperModal: React.FC<WallpaperModalProps> = ({}) => {
  const {
    addWallpaper,
    getAllWallpaper,
    changeWallpaper,
    deleteWallpaper,
    wallpaper,
    wallpaperId,
  } = useWallpaperStore();
  const [wallpaperList, setWallpaperList] = useState<IWallpaperDisplay[]>([]);

  const setAllWallaper = async () => {
    const res = await getAllWallpaper();
    setWallpaperList(res ?? []);
  };

  const onChangeWallaper = (wallpaperId: number) => {
    changeWallpaper(wallpaperId);
  };

  const onDeleteWallaper = (wallpaperId: number) => {
    deleteWallpaper(wallpaperId);
    setAllWallaper();
  };

  const onAddWallpaper = (file: File, filelist: FileList) => {
    addWallpaper(file);
    setAllWallaper();
  };

  useEffect(() => {
    setAllWallaper();
  }, []);
  useEffect(() => {}, [wallpaper]);

  return (
    <>
      <Tabs
        tabs={[
          {
            content: (
              <>
                <Upload
                  accept="image/jpeg,image/png,video/mp4"
                  onSelectFile={onAddWallpaper}
                  className="border p-3 rounded-md hover:bg-gray-50 duration-300 flex justify-between"
                >
                  <span className="w-full text-sm flex items-center gap-2">
                    <FaImage></FaImage>
                    <span>อัปโหลดไฟล์รูปภาพหรือวิดีโอ</span>
                  </span>
                </Upload>
                <div className="grid grid-cols-4 lg:grid-cols-3 gap-3 pt-4 max-h-[500px] overflow-auto">
                  {wallpaperList.map((data, i) => {
                    const src = URL.createObjectURL(data.file);
                    const isSet = data.id === wallpaperId;
                    let classBox =
                      "relative cursor-pointer hover:opacity-80 duration-300";
                    let imageBox =
                      "w-full h-36 rounded-md overflow-hidden object-cover border-4";
                    return (
                      <div
                        onClick={() => onChangeWallaper(data.id)}
                        key={`wallpaper-list-${i}`}
                        className={classBox}
                      >
                        {isSet && (
                          <div className="absolute top-3 right-3 w-5 h-5 rounded-full shadow-md bg-green-500/70 blur-overlay flex items-center justify-center">
                            <FaCheck className="text-white text-xs"></FaCheck>
                          </div>
                        )}
                        <div
                          onClick={() => onDeleteWallaper(data.id)}
                          className="z-20 absolute bottom-3 right-3 w-5 h-5 rounded-full shadow-md bg-red-500/70 hover:bg-red-500 duration-300 blur-overlay flex items-center justify-center"
                        >
                          <RiDeleteBin6Line className="text-white text-xs"></RiDeleteBin6Line>
                        </div>
                        {data.file.type === "video/mp4" ? (
                          <video
                            autoPlay
                            loop
                            muted
                            playsInline
                            disableRemotePlayback
                            src={src}
                            className={`${imageBox} ${
                              isSet ? "border-green-500" : ""
                            }`}
                          />
                        ) : (
                          <img
                            src={src}
                            className={`${imageBox} ${
                              isSet ? "border-green-500" : ""
                            }`}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            ),
            label: "",
            icon: "",
          },
        ]}
      ></Tabs>
    </>
  );
};

export default WallpaperModal;
