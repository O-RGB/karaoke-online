import Button from "@/components/common/button/button";
import Label from "@/components/common/display/label";
import FileSystemManager from "@/utils/file/file-system";
import useSongsStore from "@/features/songs/store/songs.store";
import SwitchRadio from "@/components/common/input-data/switch/switch-radio";
import useConfigStore from "@/features/config/config-store";
import React, { useEffect, useState, useRef } from "react";
import { BsFolderCheck } from "react-icons/bs";
import { MdBuild, MdDeleteForever } from "react-icons/md";
import { IAlertCommon } from "@/components/common/alert/types/alert.type";
import { DircetoryLocalSongsManager } from "@/utils/indexedDB/db/local-songs/table";
import { DBFSongsSystemReader } from "@/features/songs/modules/extreme/extreme-file-system";
import { useOrientation } from "@/hooks/orientation-hook";

interface AddDBFSongProps extends IAlertCommon {}

const AddDBFSong: React.FC<AddDBFSongProps> = ({
  setAlert,
  closeAlert,
  setProcessing,
  closeProcessing,
}) => {
  const { isMobile } = useOrientation();
  const [name, setName] = useState<string>();
  const readerRef = useRef<DBFSongsSystemReader | null>(null);

  const songsManager = useSongsStore((state) => state.songsManager);
  const soundfontBaseManager = useSongsStore(
    (state) => state.soundfontBaseManager
  );
  const setConfig = useConfigStore((state) => state.setConfig);

  const runStep3_SaveMaster = async () => {
    const reader = readerRef.current;
    if (!reader) return;
    try {
      setProcessing?.({
        status: {
          progress: 95,
          working: "Saving master index file...",
          text: "Step 3: Saving Master File",
        },
      });
      await reader.saveMasterData(setProcessing);
      await songsManager?.reloadInit();
      closeProcessing?.();
      setAlert?.({
        variant: "success",
        title: "สร้าง Index สำเร็จ!",
        description: "ข้อมูลเพลงทั้งหมดพร้อมใช้งานแล้ว",
        onOk: closeAlert,
      });
    } catch (error: any) {
      handleError(error);
    }
  };

  const runStep2_SaveChunks = async () => {
    const reader = readerRef.current;
    if (!reader) return;
    try {
      setProcessing?.({
        status: {
          progress: 75,
          working: "Saving song data chunks...",
          text: "Step 2: Saving Chunks",
        },
      });
      await reader.saveData(setProcessing);
      closeProcessing?.();
      setAlert?.({
        variant: "info",
        title: "ขั้นตอนที่ 3: บันทึก Master File",
        description: "ขั้นตอนสุดท้ายคือการบันทึกไฟล์ Index หลัก",
        okLabel: "ดำเนินการต่อ",
        onOk: runStep3_SaveMaster,
      });
    } catch (error: any) {
      handleError(error);
    }
  };

  const runStep1_PrimeAndRead = async () => {
    // สร้าง instance ใหม่ทุกครั้งที่เริ่ม
    if (songsManager?.manager instanceof DBFSongsSystemReader) {
      readerRef.current = songsManager.manager;
    } else {
      console.error("Manager is not a DBF Reader");
      handleError(new Error("Song manager is not configured correctly."));
      return;
    }
    const reader = readerRef.current;

    try {
      setProcessing?.({
        status: {
          progress: 0,
          working: "Preparing file system...",
          text: "Step 1: Initializing",
        },
      });
      const fsManager = FileSystemManager.getInstance();
      await fsManager.createFile("Data/preview_chunk_v6/.placeholder", "");
      await fsManager.deleteFile("Data/preview_chunk_v6/.placeholder");
      await detectPath();
      await reader.readDBF(setProcessing);
      closeProcessing?.();
      setAlert?.({
        variant: "info",
        title: "ขั้นตอนที่ 2: บันทึกข้อมูล Chunks",
        description:
          "ข้อมูลเพลงถูกประมวลผลเรียบร้อยแล้ว ขั้นตอนต่อไปคือการบันทึกข้อมูลลงในไฟล์ย่อย (Chunks)",
        okLabel: "ดำเนินการต่อ",
        onOk: runStep2_SaveChunks,
      });
    } catch (error: any) {
      handleError(error);
    }
  };

  const startBuildProcess = () => {
    setAlert?.({
      variant: "info",
      title: "เริ่มต้นสร้าง Index ใหม่?",
      description:
        "กระบวนการนี้จะสร้าง Index สำหรับค้นหาเพลงใหม่ทั้งหมด คุณต้องการเริ่มต้นหรือไม่?",
      okLabel: "เริ่มต้น",
      onOk: runStep1_PrimeAndRead,
    });
  };

  const handleError = (error: Error) => {
    console.error("Build process failed:", error);
    setAlert?.({
      variant: "error",
      title: "เกิดข้อผิดพลาด",
      description: error.message,
      onOk: closeAlert,
    });
    closeProcessing?.();
  };

  const detectPath = async () => {
    const database = new DircetoryLocalSongsManager();
    const isSelected = await database.get(1);
    if (isSelected?.handle?.name) {
      setName(isSelected.handle.name);
    } else {
      setName(undefined);
    }
  };

  const handleDelete = async () => {
    const fsManager = FileSystemManager.getInstance();
    await fsManager.clearDirectory();
    setName(undefined);
    readerRef.current = null;
    closeAlert?.();
  };

  useEffect(() => {
    if (songsManager?.currentMode === "EXTREME_FILE_SYSTEM") detectPath();
  }, [songsManager?.currentMode]);

  const mode = songsManager?.currentMode;

  return (
    <>
      <div className="flex flex-col h-full space-y-4 relative">
        <div className="flex justify-between items-center gap-2">
          <Label
            textSize={15}
            textColor="text-gray-800"
            headClass="bg-blue-500"
            description="อ่านตำแหน่ง Karaoke Extreme โดยตรงจากคอมพิวเตอร์ของคุณ (Google Chrome เท่านั้น)"
          >
            Import Karaoke Extreme
          </Label>
          <div style={{ opacity: isMobile ? 0.5 : 1 }}>
            <SwitchRadio<boolean>
              disabled={isMobile}
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

        {isMobile && (
          <div className="absolute w-full h-[80%]">
            <div className="text-3xl text-red-500  flex justify-center items-center w-full h-full">
              ไม่รองรับในมือถือ
            </div>
          </div>
        )}

        <div
          style={{
            opacity: isMobile || mode === "EXTREME_FILE_SYSTEM" ? 1 : 0.5,
            pointerEvents:
              isMobile || mode !== "EXTREME_FILE_SYSTEM" ? "none" : "auto",
          }}
          className="space-y-4 w-full flex flex-col items-center"
        >
          <img
            src="/manual/add-songs/file-system-api.png"
            alt="File System API Manual"
            className="max-h-[200px] object-contain self-center"
          />

          <div className="p-4 rounded-lg border w-full">
            <div className="w-full flex-grow bg-white border rounded-md p-2 min-h-[40px] flex items-center mb-4">
              {name ? (
                <div className="flex items-center gap-2 text-blue-500 ">
                  <BsFolderCheck size={18} />
                  <span className="text-sm font-semibold">{name}</span>
                </div>
              ) : (
                <span className="text-gray-400 text-sm italic">
                  ยังไม่ได้เลือกโฟลเดอร์...
                </span>
              )}
            </div>

            <div className="pt-4 border-t flex flex-col sm:flex-row lg:items-center lg:justify-end gap-3">
              <p className="text-sm text-gray-600 mr-auto mb-2 sm:mb-0 ">
                จัดการโฟลเดอร์:
              </p>

              <Button
                className="h-9"
                color="white"
                iconPosition="left"
                icon={<MdBuild />}
                onClick={startBuildProcess}
              >
                สร้าง Index ใหม่
              </Button>

              {name && (
                <Button
                  className="h-9"
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
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddDBFSong;
