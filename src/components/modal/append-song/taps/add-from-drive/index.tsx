import React, { useEffect, useState } from "react";
import DriveAction from "./action";
import SwitchRadio from "@/components/common/input-data/switch/switch-radio";
import Label from "@/components/common/label";
import { IoDownload, IoSend } from "react-icons/io5";
import {
  getLocalDriveTested,
  getLocalDriveUrl,
  getLocalSystemMode,
  getLocalTracklistDriveUrl,
} from "@/lib/local-storage";

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
  const [system, setSystem] = useState<string>("off");
  const [driveUrl, setDriveUrl] = useState<string>();
  const [tracklistUrl, setTrackListUrl] = useState<string>();
  const [onDriveTested, setDriveTested] = useState<boolean>(false);
  useEffect(() => {
    const isSaved = getLocalDriveUrl();
    const isTested = getLocalDriveTested();
    const systemMode = getLocalSystemMode();

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

    if (systemMode === "DRIVE") {
      setSystem("on");
    } else {
      setSystem("off");
    }
  }, []);
  return (
    <div className="flex flex-col gap-2">
      <DriveAction
        ok={onDriveTested}
        title="Google Apps Script URL"
        onSave={onAddUrlDrvie}
        onSaveButton="เชื่อมต่อ"
        buttonProps={{
          icon: <IoSend></IoSend>,
        }}
        inputProps={{
          value: driveUrl,
        }}
      ></DriveAction>
      <DriveAction
        ok={tracklistUrl ? true : false}
        title="Tracklist URL"
        onSave={onAddTrackListDrive}
        onSaveButton="โหลด"
        buttonProps={{
          icon: <IoDownload></IoDownload>,
        }}
        inputProps={{
          value: tracklistUrl,
        }}
      ></DriveAction>
      <div>
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
    </div>
  );
};

export default AddFromDrive;
