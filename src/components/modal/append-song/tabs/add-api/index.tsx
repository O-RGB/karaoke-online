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
    <>
      <div className="relative flex flex-col w-full h-full">
        <div className="flex justify-between items-center gap-2">
          <Label
            textSize={15}
            textColor="text-gray-800"
            headClass="bg-blue-500"
            description="เล่นเพลงทั้งหมดจาก Server กลาง  (การอัปเดตเพลงจะแล้วแต่อารมณ์ของ Admin)"
          >
            เล่นเพลงจาก API (อัพเดทล่าสุด กรกฎาคม 2568) <br />
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
            ></SwitchRadio>
          </div>
        </div>

        <NotificationProvider>
          {!token ? (
            <ApiLoginRegister></ApiLoginRegister>
          ) : (
            <Dashboard
              setAlert={setAlert}
              closeAlert={closeAlert}
              closeProcessing={closeProcessing}
              setProcessing={setProcessing}
            ></Dashboard>
          )}
        </NotificationProvider>
      </div>
    </>
  );
};

export default AddApiSong;
