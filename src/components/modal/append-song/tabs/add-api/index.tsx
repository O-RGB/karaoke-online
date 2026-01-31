import { IAlertCommon } from "@/components/common/alert/types/alert.type";
import Label from "@/components/common/display/label";
import SwitchRadio from "@/components/common/input-data/switch/switch-radio";
import useConfigStore from "@/features/config/config-store";
import useSongsStore from "@/features/songs/store/songs.store";
import React from "react";

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
          description="ขณะนี้ระบบ API ถูกปิดให้บริการชั่วคราว"
        >
          เล่นเพลงจาก API Server
        </Label>

        <div>
          <SwitchRadio<boolean>
            disabled
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

      {/* Description */}
      <div className="text-sm text-gray-600 mb-4">
        ฟีเจอร์นี้ถูกออกแบบมาเพื่อรองรับการเล่นเพลงผ่าน API Server
        แต่ขณะนี้ระบบจำเป็นต้องปิดให้บริการชั่วคราว
      </div>

      {/* Server Status Notice */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
        <div className="flex items-start gap-3">
          <div className="text-xl">🛑</div>
          <div className="flex-1">
            <h4 className="font-semibold text-gray-800 mb-2">
              ระบบ API เพลงปิดให้บริการ
            </h4>
            <p className="text-sm text-gray-700 mb-2">
              ขณะนี้ระบบ API เพลงถูกปิดให้บริการชั่วคราว
              เนื่องจากภาระค่าใช้จ่ายในการดูแลเซิร์ฟเวอร์
            </p>
            <p className="text-sm text-gray-700 mb-2">
              หากท่านยังต้องการใช้งานฟีเจอร์นี้
              และอยากให้ระบบกลับมาเปิดให้บริการอีกครั้ง
              สามารถร่วมสนับสนุนค่าใช้จ่ายในการดูแลเซิร์ฟเวอร์ได้
            </p>
            <p className="text-sm text-gray-700">
              สนใจสอบถามรายละเอียดเพิ่มเติม
              สามารถติดต่อพูดคุยได้ที่เพจผู้พัฒนาโดยตรง ทุกการสนับสนุนมีความหมาย
              และช่วยให้ระบบนี้ไปต่อได้จริง ๆ ❤️
            </p>
          </div>
        </div>
      </div>

      {/* Legal / Disclaimer */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start gap-2">
          <div className="text-xl">⚠️</div>
          <div className="flex-1">
            <h4 className="font-semibold text-gray-800 mb-2">
              หมายเหตุเกี่ยวกับลิขสิทธิ์
            </h4>
            <p className="text-xs text-gray-600">
              โปรแกรมนี้พัฒนาขึ้นเพื่อการศึกษาและใช้งานส่วนตัวเท่านั้น
              ไม่มีเจตนาละเมิดลิขสิทธิ์
              และไม่มีการเรียกเก็บค่าใช้จ่ายจากผู้ใช้งาน
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddApiSong;
