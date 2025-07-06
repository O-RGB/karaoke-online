import Button from "@/components/common/button/button";
import Label from "@/components/common/display/label";
import Upload from "@/components/common/input-data/upload";
import { PythonIndexReader } from "@/features/songs/modules/extreme/extreme-import";
import { ITrackData, MasterIndex } from "@/features/songs/types/songs.type";
import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  BsCheckCircleFill,
  BsCloudArrowUp,
  BsFileEarmarkCheck,
  BsXCircleFill,
} from "react-icons/bs";
import { MdDeleteForever } from "react-icons/md";
import { AlertDialogProps } from "@/components/common/alert/notification";
import JSZip from "jszip";
import { FaFileArchive } from "react-icons/fa";
import { FaFileZipper } from "react-icons/fa6";
import { extractFile } from "@/lib/zip";
import { FilesLocalSongsManager } from "@/utils/indexedDB/db/local-songs/table";
import { SoundfontFileSystemManager } from "@/features/soundfont/modules/soundfont-file-system";
import FileSystemManager from "@/utils/file/file-system";
import { useSynthesizerEngine } from "@/features/engine/synth-store";
import { IAlertCommon } from "@/components/common/alert/types/alert.type";

// --- Component Props ---
interface AddExtremeAndManageProps extends IAlertCommon {}

// --- Component ---
const AddExtremeAndManage: React.FC<AddExtremeAndManageProps> = ({
  setAlert,
  closeAlert,
  setProcessing,
}) => {
  const engine = useSynthesizerEngine((state) => state.engine);
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
    closeAlert?.(); // ปิด Alert Dialog ก่อน
    setIsProcessing(true);
    setStatusMessage("กำลังลบข้อมูล Index ทั้งหมด...");
    try {
      // สมมติว่ามีฟังก์ชัน clearAllLocalSongData ใน reader
      //   await pythonIndexReader.clearAllLocalSongData();
      setStatusMessage("✅ ลบข้อมูล Index ทั้งหมดเรียบร้อยแล้ว");
      await fetchStoredData(); // โหลดข้อมูลใหม่ (ซึ่งควรจะเป็นค่าว่าง)
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
    const filesDb = new FilesLocalSongsManager();
    const unzip = await extractFile(file);

    for (let index = 0; index < unzip.length; index++) {
      const file = unzip[index];
      console.log(file);
      const id = Number(file.name.split(".")[0]);
      await filesDb.add({ id, file: file });
    }

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
        const fileContent = await file.text();
        const masterData = JSON.parse(fileContent) as MasterIndex;

        await pythonIndexReader.saveMasterIndex(masterData);
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

  const handleChunkFiles = useCallback(
    async (selectedFile: File, fileList: FileList) => {
      if (!fileList || fileList.length === 0) return;
      setIsProcessing(true);
      setStatusMessage(`กำลังประมวลผล ${fileList.length} chunk files...`);
      try {
        const filesArray = Array.from(fileList);
        const processingPromises = filesArray.map(async (file) => {
          const chunkId = parseInt(file.name.replace(".json", ""), 10);
          if (isNaN(chunkId)) {
            console.warn(`ข้ามไฟล์ที่มีชื่อไม่ถูกต้อง: ${file.name}`);
            return;
          }
          const fileContent = await file.text();
          const chunkData = JSON.parse(fileContent);
          await pythonIndexReader.savePreviewChunk(chunkId, chunkData);
        });
        await Promise.all(processingPromises);
        setStatusMessage(
          `✅ บันทึก Chunk Files ทั้ง ${fileList.length} ไฟล์สำเร็จ!`
        );
        await fetchStoredData();
      } catch (error) {
        setStatusMessage(
          `❌ เกิดข้อผิดพลาดในการประมวลผล: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
      } finally {
        setIsProcessing(false);
      }
    },
    [pythonIndexReader, fetchStoredData]
  );

  return (
    <div className="flex flex-col h-full space-y-4">
      <Label
        textSize={15}
        textColor="text-gray-800"
        headClass="bg-blue-500"
        description="นำเข้า, จัดการ และค้นหาเพลงจาก Index ที่สร้างจาก Python (V7)"
      >
        Import & Manage Python Index (V7)
      </Label>

      <div className="p-4 rounded-lg border">
        <Upload
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
            icon={<FaFileZipper />}
            color="blue"
            className="w-full text-base py-2.5"
          >
            นำเข้าไฟล์เพลง
          </Button>
        </Upload>

        <div className="relative flex py-4 items-center">
          <div className="flex-grow border-t border-gray-300"></div>
          {/* <span className="flex-shrink mx-4 text-gray-400 text-sm">หรือ</span> */}
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
              1. เลือก Master File
            </Button>
          </Upload>
          <Upload
            onSelectFile={handleChunkFiles}
            inputProps={{
              multiple: true,
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
              2. เลือก Chunk Files
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

      <div className="p-4 rounded-lg border">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-lg text-gray-800">
            ข้อมูล Index ในเครื่อง
          </h3>
          <Button
            color="red"
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
                storedMasterKeys.length > 0 ? "text-green-600" : "text-red-600"
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
  );
};

export default AddExtremeAndManage;
