import { IAlertCommon } from "@/components/common/alert/types/alert.type";
import Label from "@/components/common/display/label";
import SwitchRadio from "@/components/common/input-data/switch/switch-radio";
import useConfigStore from "@/features/config/config-store";
import useSongsStore from "@/features/songs/store/songs.store";
import React from "react";
import ApiLoginRegister from "./karaoke-api-system/login";
import Dashboard from "./karaoke-api-system/dashboard";
import { NotificationProvider } from "./karaoke-api-system/common/notification-provider";

interface AddApiSongProps extends IAlertCommon {}

const AddApiSong: React.FC<AddApiSongProps> = ({
  setAlert,
  closeAlert,
  closeProcessing,
  setProcessing,
}) => {
  const token = useConfigStore((state) => state.config.token);
  const songsManager = useSongsStore((state) => state.songsManager);
  const soundfontBaseManager = useSongsStore(
    (state) => state.soundfontBaseManager
  );
  const setConfig = useConfigStore((state) => state.setConfig);
  const mode = songsManager?.currentMode;

  return (
    <div className="relative flex flex-col w-full h-full">
      {/* Header Section */}
      <div className="flex justify-between items-center gap-4 mb-4 pb-4 border-b border-gray-200">
        <Label
          textSize={15}
          textColor="text-gray-800"
          headClass="bg-blue-500"
          description="เปิดให้ใช้งานช่วงเทศกาลปีใหม่เท่านั้น"
        >
          เล่นเพลงจาก API Server
        </Label>
        <div>
          <SwitchRadio<boolean>
            value={mode === "PYTHON_API_SYSTEM"}
            onChange={async (value) => {
              if (value) {
                await songsManager?.switchMode("PYTHON_API_SYSTEM");
                soundfontBaseManager?.setMode("PYTHON_API_SYSTEM");
              } else {
                await songsManager?.switchMode("DATABASE_FILE_SYSTEM");
                soundfontBaseManager?.setMode("DATABASE_FILE_SYSTEM");
              }
              setConfig({
                system: {
                  soundMode: value
                    ? "PYTHON_API_SYSTEM"
                    : "DATABASE_FILE_SYSTEM",
                },
              });
            }}
            options={[
              { value: true, label: "เปิด", children: "" },
              { value: false, label: "ปิด", children: "" },
            ]}
          />
        </div>
      </div>
      <div className="text-sm text-gray-600 mb-4">
        สามารถกดสวิตช์ด้านบนเพื่อเปิด/ปิดการใช้งานได้ทันที
        ถ้าปิดอยู่ก็สามารถเปิดใช้งานได้เลย
      </div>
      {/* Source Attribution */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
        <div className="flex items-start gap-2">
          <div className="text-xl">⚠️</div>
          <div className="flex-1">
            <h4 className="font-semibold text-gray-800 mb-2">
              แหล่งที่มาของเพลง
            </h4>
            <p className="text-sm text-gray-700 mb-2">
              เพลงทั้งหมดในระบบได้มาจาก{" "}
              <a
                href="https://mawtoload.com/extreme-karaoke-download-free/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Mawtoload.com
              </a>
            </p>
            <p className="text-xs text-gray-600">
              โปรแกรมนี้พัฒนาขึ้นเพื่อการศึกษาและใช้งานส่วนตัวเท่านั้น
              ไม่มีเจตนาละเมิดลิขสิทธิ์ใดๆ
              ไม่มีการเรียกเก็บค่าใช้จ่ายจากผู้ใช้งาน
            </p>
          </div>
        </div>
      </div>

      {/* Login/Dashboard Section - Currently Commented */}
      {/* <NotificationProvider>
        {!token ? (
          <ApiLoginRegister />
        ) : (
          <Dashboard
            setAlert={setAlert}
            closeAlert={closeAlert}
            closeProcessing={closeProcessing}
            setProcessing={setProcessing}
          />
        )}
      </NotificationProvider> */}
    </div>
  );
};

export default AddApiSong;
