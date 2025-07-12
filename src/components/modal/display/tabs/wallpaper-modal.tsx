import React, { useEffect, useState } from "react";
import Tabs from "../../../common/tabs";
import Upload from "../../../common/input-data/upload";
import useConfigStore from "@/features/config/config-store";
import { FaCamera, FaCheck, FaImage } from "react-icons/fa";
import { RiDeleteBin6Line } from "react-icons/ri";
import { IWallpaperDisplay } from "@/utils/indexedDB/db/display/types";
import { WallpaperDisplayManager } from "@/utils/indexedDB/db/display/table";
import Button from "../../../common/button/button";
import { WALLPAPER } from "@/config/value";

interface WallpaperModalProps {}

const WallpaperModal: React.FC<WallpaperModalProps> = ({}) => {
  const wallpaperDisplayManager = new WallpaperDisplayManager();
  const setConfig = useConfigStore((state) => state.setConfig);
  const wId = useConfigStore((state) => state.config.themes?.wallpaperId);
  const wCam = useConfigStore((state) => state.config.themes?.wallpaperCamera);

  const [wallpaperList, setWallpaperList] = useState<IWallpaperDisplay[]>([]);

  const getWallpapers = async () => {
    const wallpapers = await wallpaperDisplayManager.getAll();
    setWallpaperList(wallpapers);
  };

  const onChangeWallaper = (id: number) => {
    setConfig({ themes: { wallpaperId: id } });
  };

  const onDeleteWallaper = async (id: number) => {
    if (wId === id) setConfig({ themes: { wallpaperId: undefined } });
    await wallpaperDisplayManager.delete(id);
    await getWallpapers();
  };

  const onAddWallpaper = async (file: File, filelist: FileList) => {
    const wid = await wallpaperDisplayManager.add({ file });
    setConfig({ themes: { wallpaperId: wid as number } });
    await getWallpapers();
  };

  const openCamera = () => {
    setConfig({ themes: { wallpaperCamera: !wCam } });
  };

  useEffect(() => {
    getWallpapers();
  }, [wId]);

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
                  className="border border-blue-500 p-3 rounded-md hover:bg-gray-50 duration-300 flex justify-between"
                >
                  <span className="w-full text-sm flex items-center gap-2">
                    <FaImage></FaImage>
                    <span>อัปโหลดไฟล์รูปภาพหรือวิดีโอ</span>
                  </span>
                </Upload>
                <div className="grid grid-cols-4 lg:grid-cols-3 gap-3 pt-4 max-h-[500px] overflow-auto">
                  <div onClick={openCamera} className="w-full h-36 flex">
                    <Button
                      color={wCam ? "blue" : "white"}
                      className="w-full"
                      icon={<FaCamera></FaCamera>}
                    >
                      camera
                    </Button>
                  </div>
                  <div
                    onClick={() =>
                      setConfig({ themes: { wallpaperId: undefined } })
                    }
                    className={`w-full h-36 rounded-md overflow-hidden ${
                      wId ? "" : "border-4 border-green-500"
                    }`}
                  >
                    <img src={WALLPAPER} className="w-full h-full" alt="" />
                  </div>
                  {wallpaperList.map((data, i) => {
                    const src = URL.createObjectURL(data.file);
                    const isSet = data.id === wId;
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
