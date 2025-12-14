import Button from "@/components/common/button/button";
import Label from "@/components/common/display/label";
import Upload from "@/components/common/input-data/upload";
import { PythonIndexReader } from "@/features/songs/modules/extreme/extreme-import";
import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  BsCheckCircleFill,
  BsCloudArrowUp,
  BsFileEarmarkCheck,
  BsXCircleFill,
} from "react-icons/bs";
import { MdDeleteForever } from "react-icons/md";
import { FaDownload } from "react-icons/fa";
import { extractFile } from "@/lib/zip";
import { FilesLocalSongsManager } from "@/utils/indexedDB/db/local-songs/table";
import { useSynthesizerEngine } from "@/features/engine/synth-store";
import { IAlertCommon } from "@/components/common/alert/types/alert.type";
import SwitchRadio from "@/components/common/input-data/switch/switch-radio";
import useConfigStore from "@/features/config/config-store";
import useSongsStore from "@/features/songs/store/songs.store";
import Link from "next/link";

// --- Component Props ---
interface AddExtremeAndManageProps extends IAlertCommon {}

// --- Component ---
const AddExtremeAndManage: React.FC<AddExtremeAndManageProps> = ({
  setAlert,
  closeAlert,
  setProcessing,
  closeProcessing,
}) => {
  const songsManager = useSongsStore((state) => state.songsManager);
  const soundfontBaseManager = useSongsStore(
    (state) => state.soundfontBaseManager
  );
  const setConfig = useConfigStore((state) => state.setConfig);
  // State สำหรับการประมวลผลและสถานะต่างๆ
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>("");

  // State สำหรับข้อมูลที่จัดเก็บใน IndexedDB
  const [isLoadingStoredData, setIsLoadingStoredData] = useState(true);
  const [storedMasterKeys, setStoredMasterKeys] = useState<IDBValidKey[]>([]);
  const [storedChunkKeys, setStoredChunkKeys] = useState<IDBValidKey[]>([]);

  // --- Hooks ---
  const pythonIndexReader = useMemo(() => new PythonIndexReader(), []);

  const isDataReadyForLoad = useMemo(
    () => storedMasterKeys.length > 0 && storedChunkKeys.length > 0,
    [storedMasterKeys, storedChunkKeys]
  );

  // --- Functions ---
  const fetchStoredData = useCallback(async () => {
    setIsLoadingStoredData(true);
    try {
      const [masterKeys, chunkKeys] = await Promise.all([
        pythonIndexReader.getMasterIndexFileId(),
        pythonIndexReader.getAllPreviewChunkIds(),
      ]);
      setStoredMasterKeys(masterKeys);
      setStoredChunkKeys(chunkKeys);
    } catch (error) {
      console.error("Failed to fetch stored index data:", error);
      setStatusMessage("❌ ไม่สามารถโหลดข้อมูล Index ที่มีอยู่ได้");
    } finally {
      setIsLoadingStoredData(false);
    }
  }, [pythonIndexReader]);

  useEffect(() => {
    fetchStoredData();
  }, [fetchStoredData]);

  const handleDeleteAllData = async () => {
    closeAlert?.();
    setIsProcessing(true);
    setStatusMessage("กำลังลบข้อมูล Index ทั้งหมด...");
    try {
      setStatusMessage("✅ ลบข้อมูล Index ทั้งหมดเรียบร้อยแล้ว");
      await fetchStoredData();
    } catch (error) {
      setStatusMessage(
        `❌ เกิดข้อผิดพลาดในการลบข้อมูล: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleZipFile = async (file: File) => {
    setProcessing?.({
      variant: "processing",
      title: "กำลังอ่านไฟล์",
      status: {
        progress: 0,
        text: "กำลัง Extract File",
        working: `${file.name}.${file.type}`,
      },
    });

    const filesDb = new FilesLocalSongsManager();
    const unzip = await extractFile(file);

    for (let index = 0; index < unzip.length; index++) {
      const file = unzip[index];
      console.log(file);
      const id = Number(file.name.split(".")[0]);
      await filesDb.add({ id, file: file });
    }

    closeProcessing?.();

    setAlert?.({
      description: `อ่านข้อมูลจากไฟล์ ${file.name} สำเร็จ`,
      title: "อ่านข้อมูลเรียบร้อยแล้ว",
      variant: "success",
    });
  };

  const handleMasterFile = useCallback(
    async (file: File) => {
      if (!file) return;
      setIsProcessing(true);
      setStatusMessage("กำลังอ่านไฟล์ master index...");
      try {
        await pythonIndexReader.importIndexFromZip(file);
        await pythonIndexReader.loadIndex();
        setStatusMessage("✅ บันทึก Master Index สำเร็จ!");
        await fetchStoredData();
      } catch (error) {
        setStatusMessage(
          `❌ เกิดข้อผิดพลาด: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
      } finally {
        setIsProcessing(false);
      }
    },
    [pythonIndexReader, fetchStoredData]
  );

  useEffect(() => {}, [songsManager?.currentMode]);

  const mode = songsManager?.currentMode;

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex justify-between items-center gap-2">
        <Label
          textSize={15}
          textColor="text-gray-800"
          headClass="bg-blue-500"
          description="นำเข้า, จัดการ และค้นหาเพลงจาก Index ที่สร้างจาก Python (V7)"
        >
          Import & Manage Index
        </Label>
        <div className="">
          <SwitchRadio<boolean>
            value={mode === "PYTHON_FILE_ENCODE"}
            onChange={(value) => {
              if (value) {
                songsManager?.switchMode("PYTHON_FILE_ENCODE");
                soundfontBaseManager?.setMode("PYTHON_FILE_ENCODE");
              } else {
                songsManager?.switchMode("DATABASE_FILE_SYSTEM");
                soundfontBaseManager?.setMode("DATABASE_FILE_SYSTEM");
              }
              setConfig({
                system: {
                  soundMode: value
                    ? "PYTHON_FILE_ENCODE"
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
          opacity: mode === "PYTHON_FILE_ENCODE" ? 1 : 0.5,
          pointerEvents: mode !== "PYTHON_FILE_ENCODE" ? "none" : "auto",
        }}
        className="space-y-4 w-full flex flex-col items-center"
      >
        <div className="p-4 rounded-lg border w-full">
          <div className="flex gap-2">
            <Link
              href={"https://next-karaoke-processor.vercel.app/"}
              target="_blank"
            >
              <Button
                disabled={isProcessing}
                icon={<FaDownload />}
                className="w-fit text-base py-2.5 text-nowrap"
              >
                โปรแกรม
              </Button>
            </Link>
            <Upload
              className="w-full"
              onSelectFile={handleZipFile}
              inputProps={{
                multiple: false,
                accept: ".zip,application/zip,application/x-zip-compressed",
                disabled: isProcessing,
              }}
            >
              <Button
                disabled={isProcessing}
                iconPosition="left"
                icon={<BsCloudArrowUp />}
                color="white"
                className="w-full text-base py-2.5"
              >
                เลือก ไฟล์เพลง (.zip)
              </Button>
            </Upload>
          </div>

          <div className="relative flex py-4 items-center">
            <div className="flex-grow border-t border-gray-300"></div>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>

          <div className="flex flex-col sm:flex-row lg:items-center gap-4">
            <Upload
              onSelectFile={handleMasterFile}
              inputProps={{
                multiple: false,
                accept: ".json",
                disabled: isProcessing,
              }}
            >
              <Button
                disabled={isProcessing}
                iconPosition="left"
                icon={<BsCloudArrowUp />}
                color="white"
                className="text-nowrap flex-shrink-0"
              >
                เลือก Index File (.zip)
              </Button>
            </Upload>

            <div className="w-full flex-grow bg-white border rounded-md p-2 min-h-[40px] flex items-center">
              {isDataReadyForLoad ? (
                <div className="flex items-center gap-2 text-green-600 font-medium">
                  <BsFileEarmarkCheck size={18} />
                  <span className="text-sm">พบข้อมูล Index ในระบบแล้ว</span>
                </div>
              ) : storedMasterKeys.length > 0 ? (
                <div className="flex items-center gap-2 text-orange-500">
                  <BsCheckCircleFill size={15} />
                  <span className="text-sm">
                    พบ Master Index, กรุณาอัปโหลด Chunk files
                  </span>
                </div>
              ) : (
                <span className="text-gray-400 text-sm italic">
                  ยังไม่ได้อัปโหลดไฟล์...
                </span>
              )}
            </div>
          </div>

          {statusMessage && (
            <div
              className={`mt-4 p-3 rounded-md text-sm text-center ${
                statusMessage.includes("❌")
                  ? "bg-red-100 text-red-800"
                  : "bg-green-100 text-green-800"
              }`}
            >
              <p>{statusMessage}</p>
            </div>
          )}
        </div>

        <div className="p-4 rounded-lg border w-full">
          <div className="flex flex-col lg:flex-row lg:justify-between gap-2 lg:items-center mb-4">
            <h3 className="font-semibold text-lg text-gray-800">
              ข้อมูล Index ในเครื่อง
            </h3>
            <Button
              color="danger"
              iconPosition="left"
              icon={<MdDeleteForever />}
              disabled={!isDataReadyForLoad || isProcessing}
              onClick={() =>
                setAlert?.({
                  variant: "warning",
                  title: "ยืนยันการลบข้อมูล Index ทั้งหมด",
                  description:
                    "การดำเนินการนี้จะลบไฟล์ Master Index และ Chunk Files ทั้งหมดออกจากฐานข้อมูล ไม่สามารถกู้คืนได้",
                  onOk: handleDeleteAllData,
                })
              }
            >
              ลบข้อมูลทั้งหมด
            </Button>
          </div>

          {isLoadingStoredData ? (
            <p className="text-gray-500 text-center p-4">กำลังโหลดข้อมูล...</p>
          ) : (
            <div className="p-4 border rounded-md bg-gray-50 space-y-2">
              <h4 className="font-semibold text-gray-700 mb-2">สถานะไฟล์</h4>
              <div
                className={`flex items-center gap-2 text-sm font-medium ${
                  storedMasterKeys.length > 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {storedMasterKeys.length > 0 ? (
                  <BsCheckCircleFill />
                ) : (
                  <BsXCircleFill />
                )}
                <span>Master Index (พบ {storedMasterKeys.length} ไฟล์)</span>
              </div>
              <div
                className={`flex items-center gap-2 text-sm font-medium ${
                  storedChunkKeys.length > 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {storedChunkKeys.length > 0 ? (
                  <BsCheckCircleFill />
                ) : (
                  <BsXCircleFill />
                )}
                <span>Chunk Files (พบ {storedChunkKeys.length} ไฟล์)</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddExtremeAndManage;
