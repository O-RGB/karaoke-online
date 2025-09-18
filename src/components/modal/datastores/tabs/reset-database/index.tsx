import React from "react";
import useSongsStore from "@/features/songs/store/songs.store";
import { IAlertCommon } from "@/components/common/alert/types/alert.type";
import { useSynthesizerEngine } from "@/features/engine/synth-store";
import { DatabaseService } from "@/utils/indexedDB/service";

interface ResetDatabaseProps extends IAlertCommon {}

const ResetDatabase: React.FC<ResetDatabaseProps> = ({
  setProcessing,
  setAlert,
}) => {
  const uninsatll = useSynthesizerEngine((state) => state.uninsatll);
  const timer = useSynthesizerEngine((state) => state.timer);
  const songsManager = useSongsStore((state) => state.songsManager);
  const soundfontBaseManager = useSongsStore(
    (state) => state.soundfontBaseManager
  );

  const deleteAllSetting = async () => {
    try {
      timer?.terminateWorker();
      setProcessing?.({
        title: "Reset System",
        status: {
          progress: 0,
          text: "กำลังรีเซ็ตระบบใหม่ทั้งหมด",
          working: "เตรียมตัวหยุดการทำงาน",
        },
        variant: "processing",
      });
      setTimeout(() => {
        uninsatll();
        setProcessing?.({
          title: "Reset System",
          status: {
            progress: 20,
            text: "กำลังรีเซ็ตระบบใหม่ทั้งหมด",
            working: "หยุดการทำงาน Engine",
          },
          variant: "processing",
        });
      }, 500);
      setTimeout(() => {
        songsManager?.uninstall();
        setProcessing?.({
          title: "Reset System",
          status: {
            progress: 40,
            text: "กำลังรีเซ็ตระบบใหม่ทั้งหมด",
            working: "หยุดการทำงาน Songs Manager",
          },
          variant: "processing",
        });
      }, 500);
      setTimeout(() => {
        soundfontBaseManager?.uninstall();
        setProcessing?.({
          title: "Reset System",
          status: {
            progress: 60,
            text: "กำลังรีเซ็ตระบบใหม่ทั้งหมด",
            working: "หยุดการทำงาน Soundfont Manager",
          },
          variant: "processing",
        });
      }, 500);
      const service = new DatabaseService();
      setProcessing?.({
        title: "Reset System",
        status: {
          progress: 80,
          text: "กำลังรีเซ็ตระบบใหม่ทั้งหมด",
          working: "ถอนการติดตั้ง Database",
        },
        variant: "processing",
      });
      await service.uninstall();

      localStorage.clear();
      setProcessing?.({
        title: "Reset System",
        status: {
          progress: 100,
          text: "สำเร็จ",
          working: "รีเซ็ตระบบเรียบร้อยแล้ว",
        },
        variant: "success",
        onClose() {
          window.location.reload();
        },
      });
    } catch (error) {
      setProcessing?.({
        title: "Reset System",
        status: {
          progress: 100,
          text: "ผิดพลาด",
          working: `เกิดข้อผิดพลาดเกี่ยวกับ ${JSON.stringify(error)}`,
        },
        onClose() {
          window.location.reload();
        },
        variant: "error",
      });
    }
  };

  return (
    <>
      <div className="w-full max-w-md mx-auto  p-4 border border-red-300 rounded-lg bg-red-50 shadow-md">
        <h2 className="text-lg font-semibold text-red-700 mb-2">
          ⚠️ รีเซ็ตระบบทั้งหมด
        </h2>
        <p className="text-sm text-red-600 mb-4">
          การกระทำนี้จะลบข้อมูลทั้งหมดในระบบของคุณ รวมถึงไฟล์เพลง การตั้งค่า
          Engine และฐานข้อมูลภายใน <strong>ถาวร</strong>
          <br />
          โปรดตรวจสอบให้แน่ใจก่อนดำเนินการ
        </p>
        <button
          onClick={() => {
            setAlert?.({
              title: "ยืนยันการลบข้อมูล",
              description: "ระบบจะไม่สามารถกู้การตั้งค่าทั้งหมดของคุณได้",
              onOk: deleteAllSetting,
              variant: "error",
            });
          }}
          className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-md transition duration-200 shadow"
        >
          ลบข้อมูลทั้งหมด (ถาวร)
        </button>
      </div>
    </>
  );
};

export default ResetDatabase;
