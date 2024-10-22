import React, { useEffect, useState } from "react";
import DriveAction from "./action";
import SwitchRadio from "@/components/common/input-data/switch/switch-radio";
import Label from "@/components/common/label";
import { IoDownload, IoSend } from "react-icons/io5";
import { getLocalTracklistDriveUrl } from "@/lib/local-storege/local-storage";
import useConfigStore from "@/stores/config-store";

interface AddFromDriveProps {
  onAddUrlDrvie?: (value: string) => Promise<boolean>;
  onAddTrackListDrive?: (value: string) => Promise<boolean>;
  onSystemChange: (value: string) => void;
  getSystem?: () => boolean;
}

const AddFromDrive: React.FC<AddFromDriveProps> = ({
  onAddUrlDrvie,
  onAddTrackListDrive,
  onSystemChange,
  getSystem,
}) => {
  const config = useConfigStore((state) => state.config);
  const [system, setSystem] = useState<string>("off");
  const [driveUrl, setDriveUrl] = useState<string>();
  const [tracklistUrl, setTrackListUrl] = useState<string>();
  const [onDriveTested, setDriveTested] = useState<boolean>(false);
  useEffect(() => {
    const isSaved = config.system?.url;
    const isTested = config.system?.urlTested;
    const systemMode = config.system?.drive;

    const url = getLocalTracklistDriveUrl();
    if (url) {
      setTrackListUrl(url);
    }

    if (isSaved) {
      setDriveUrl(isSaved);
    } else {
      setDriveUrl(undefined);
    }

    if (isTested) {
      setDriveTested(true);
    } else {
      setDriveTested(false);
    }

    if (systemMode === true) {
      setSystem("on");
    } else {
      setSystem("off");
    }
  }, []);

  const handleAddUrlDrive = async (value: string) => {
    const res = await onAddUrlDrvie?.(value);
    if (res) {
      setDriveUrl(value);
    } else {
      setSystem("off");
      setDriveUrl(undefined);
      onSystemChange("off");
      // setLocalDriveTested(false);
      // setLocalDriveUrl("");
    }
    return res ?? false;
  };

  return (
    <div className="flex flex-col gap-2 h-full">
      <DriveAction
        ok={onDriveTested}
        title="ลิงก์ Google Apps Script"
        onSave={handleAddUrlDrive}
        onSaveButton={"เชื่อมต่อ"}
        onSavedButton="เชื่อมต่อแล้ว"
        buttonProps={{
          icon: <IoSend></IoSend>,
        }}
        inputProps={{
          value: driveUrl,
          placeholder: "https:...",
        }}
      ></DriveAction>
      <DriveAction
        ok={tracklistUrl ? true : false}
        title="ไฟล์รายชื่อเพลง"
        onSave={onAddTrackListDrive}
        onSaveButton="ดาวน์โหลด"
        buttonProps={{
          icon: <IoDownload></IoDownload>,
        }}
        inputProps={{
          value: tracklistUrl,
          placeholder: "https:...",
        }}
      ></DriveAction>
      <div className="flex flex-col gap-1">
        <Label>เปิดการใช้งานโหลดเพลงจาก Drive (ไม่โหลดเพลงจากเครื่อง)</Label>
        <SwitchRadio
          disabled={driveUrl ? false : true}
          value={system}
          onChange={onSystemChange}
          options={[
            {
              children: "เปิดใช้งาน",
              value: "on",
            },
            {
              children: "ปิดใช้งาน",
              value: "off",
            },
          ]}
        ></SwitchRadio>
      </div>

      <div className="text-blue-500">
        หากใครสนใจทดสอบโหลดเพลงจาก Google drive ต้องติดต่อ Admin
      </div>
    </div>
  );
};

export default AddFromDrive;
