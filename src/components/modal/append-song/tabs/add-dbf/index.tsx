import Button from "@/components/common/button/button";
import Label from "@/components/common/display/label";
import FileSystemManager from "@/utils/file/file-system";
import useSongsStore from "@/features/songs/store/songs.store";
import SwitchRadio from "@/components/common/input-data/switch/switch-radio";
import useConfigStore from "@/features/config/config-store";
import React, { useEffect, useState } from "react";
import { BsFolder, BsFolderCheck } from "react-icons/bs";
import { MdBuild, MdDeleteForever } from "react-icons/md";
import { IAlertCommon } from "@/components/common/alert/types/alert.type";
import { DircetoryLocalSongsManager } from "@/utils/indexedDB/db/local-songs/table";

interface AddDBFSongProps extends IAlertCommon {}

const AddDBFSong: React.FC<AddDBFSongProps> = ({
  setAlert,
  closeAlert,
  setProcessing,
}) => {
  const [name, setName] = useState<string>();

  const songsManager = useSongsStore((state) => state.songsManager);
  const soundfontBaseManager = useSongsStore(
    (state) => state.soundfontBaseManager
  );
  const setConfig = useConfigStore((state) => state.setConfig);

  const rebuildIndex = async () => {
    closeAlert?.();
    if (songsManager) {
      await songsManager?.manager?.buildIndex(setProcessing);
    }
  };

  const onSelectFileSystem = async () => {
    const fsManager = FileSystemManager.getInstance();

    if (!songsManager?.manager) return;
    const extreme = songsManager?.manager;

    const onLoadIndex = songsManager?.isReady();
    if (!onLoadIndex) {
      await extreme.buildIndex(setProcessing);
    } else {
      await fsManager.getRootHandle();
      await songsManager?.reloadInit();
      const isLastReady = songsManager?.isReady();
      if (isLastReady) {
        const indexLoaded = await extreme.loadIndex();
        if (!indexLoaded) {
          await extreme.buildIndex(setProcessing);
        }
      }
    }
    await detectPath();
  };

  const detectPath = async () => {
    const database = new DircetoryLocalSongsManager();
    const isSelected = await database.get(1);
    if (isSelected?.handle) {
      if (isSelected.handle) {
        setName(isSelected.handle.name);
      } else {
        setName(undefined);
      }
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
    if (songsManager?.currentMode === "EXTREME_FILE_SYSTEM") detectPath();
  }, [songsManager?.currentMode]);

  const mode = songsManager?.currentMode;

  return (
    <>
      <div className="flex flex-col h-full space-y-4">
        <div className="flex justify-between items-center">
          <Label
            textSize={15}
            textColor="text-gray-800"
            headClass="bg-blue-500"
            description="อ่านตำแหน่ง Karaoke Extreme โดยตรงจากคอมพิวเตอร์ของคุณ (Google Chrome เท่านั้น)"
          >
            Import Karaoke Extreme
          </Label>
          <div>
            <SwitchRadio<boolean>
              value={mode === "EXTREME_FILE_SYSTEM"}
              onChange={async (value) => {
                if (value) {
                  await songsManager?.switchMode("EXTREME_FILE_SYSTEM");
                  soundfontBaseManager?.setMode("EXTREME_FILE_SYSTEM");
                } else {
                  await songsManager?.switchMode("DATABASE_FILE_SYSTEM");
                  soundfontBaseManager?.setMode("DATABASE_FILE_SYSTEM");
                }
                setConfig({
                  system: {
                    soundMode: value
                      ? "EXTREME_FILE_SYSTEM"
                      : "DATABASE_FILE_SYSTEM",
                  },
                });
              }}
              options={[
                { value: true, label: "เปิด", children: "" },
                { value: false, label: "ปิด", children: "" },
              ]}
            ></SwitchRadio>
          </div>
        </div>

        <div
          style={{
            opacity: mode === "EXTREME_FILE_SYSTEM" ? 1 : 0.5,
            pointerEvents: mode !== "EXTREME_FILE_SYSTEM" ? "none" : "auto",
          }}
          className="space-y-4 w-full flex flex-col items-center"
        >
          <img
            src="/manual/add-songs/file-system-api.png"
            alt="File System API Manual"
            className="max-h-[200px] object-contain self-center"
          />

          <div className="p-4 rounded-lg border w-full">
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
      </div>
    </>
  );
};

export default AddDBFSong;
