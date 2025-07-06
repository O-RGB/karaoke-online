import Button from "@/components/common/button/button";
import Label from "@/components/common/display/label";
import FileSystemManager from "@/utils/file/file-system";
import useSongsStore from "@/features/songs/store/songs.store";
import React, { useEffect, useState } from "react";
import { BsFolder, BsFolderCheck } from "react-icons/bs";
import { MdBuild, MdDeleteForever } from "react-icons/md";
import { IAlertCommon } from "@/components/common/alert/types/alert.type";

interface AddDBFSongProps extends IAlertCommon {}

const AddDBFSong: React.FC<AddDBFSongProps> = ({
  setAlert,
  closeAlert,
  setProcessing,
}) => {
  const [name, setName] = useState<string>();

  const songsManager = useSongsStore((state) => state.songsManager);

  const rebuildIndex = async () => {
    closeAlert?.();
    if (songsManager) {
      await songsManager?.manager?.buildIndex(setProcessing);
    }
  };

  const onSelectFileSystem = async () => {
    const onLoadIndex = songsManager?.isReady();
    if (!onLoadIndex) {
      await songsManager?.manager?.buildIndex(setProcessing);
    } else {
      const fsManager = FileSystemManager.getInstance();
      await fsManager.getRootHandle();
      await songsManager?.reloadInit();
      const isLastReady = songsManager?.isReady();
      if (isLastReady) {
        const indexLoaded = await songsManager?.manager?.loadIndex();
        if (!indexLoaded) {
          await songsManager?.manager?.buildIndex(setProcessing);
        }
      }
    }
    await detectPath();
  };

  const detectPath = async () => {
    const fsManager = FileSystemManager.getInstance(false);
    const root = fsManager.getRootHandleSync();
    if (root) {
      setName(root.name);
    } else {
      setName(undefined);
    }
  };

  const handleDelete = async () => {
    const fsManager = FileSystemManager.getInstance();
    fsManager.clearDirectory();
    setName(undefined);
    closeAlert?.();
  };

  useEffect(() => {
    detectPath();
  }, []);

  return (
    <>
      <div className="flex flex-col h-full space-y-4">
        <div>
          <Label
            textSize={15}
            textColor="text-gray-800"
            headClass="bg-blue-500"
            description="อ่านตำแหน่ง Karaoke Extreme โดยตรงจากคอมพิวเตอร์ของคุณ (Google Chrome เท่านั้น)"
          >
            Import Karaoke Extreme
          </Label>
        </div>

        <img
          src="/manual/add-songs/file-system-api.png"
          alt="File System API Manual"
          className="max-h-[200px] object-contain self-center"
        />

        <div className="p-4 rounded-lg border">
          <div className="flex flex-col sm:flex-row lg:items-center gap-4">
            <Button
              disabled={!!name}
              iconPosition="left"
              icon={<BsFolder />}
              color="white"
              onClick={onSelectFileSystem}
              className="text-nowrap flex-shrink-0"
            >
              เลือก
            </Button>

            <div className="w-full flex-grow bg-white border rounded-md p-2 min-h-[40px] flex items-center">
              {name ? (
                <div className="flex items-center gap-2 text-blue-500 ">
                  <BsFolderCheck size={18} />
                  <span className="text-sm">{name}</span>
                </div>
              ) : (
                <span className="text-gray-400 text-sm italic">
                  ยังไม่ได้เลือกโฟลเดอร์...
                </span>
              )}
            </div>
          </div>

          {name && (
            <div className="mt-4 pt-4 border-t flex flex-col sm:flex-row lg:items-center lg:justify-end gap-3">
              <p className="text-sm text-gray-600 mr-auto mb-2 sm:mb-0 ">
                จัดการโฟลเดอร์:
              </p>

              <Button
                className="h-9"
                color="white"
                iconPosition="left"
                icon={<MdBuild />}
                onClick={() =>
                  setAlert?.({
                    variant: "info",
                    title: "ยืนยันการสร้าง Index ใหม่",
                    description: "หากเริ่มต้นไฟล์เก่าจะโดนลบทันที",
                    onOk: rebuildIndex,
                  })
                }
              >
                สร้าง Index ใหม่
              </Button>
              <Button
                color="red"
                className="h-9"
                iconPosition="left"
                icon={<MdDeleteForever />}
                onClick={() =>
                  setAlert?.({
                    variant: "warning",
                    title: "ยืนยันการลบโฟลเดอร์",
                    description:
                      "หากลบโฟลเดอร์แล้วจะไม่สามารถกู้คืนไฟล์เดิมได้",
                    onOk: handleDelete,
                  })
                }
              >
                ลบการเชื่อมต่อ
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AddDBFSong;
