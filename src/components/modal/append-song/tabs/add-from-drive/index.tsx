import React, { useEffect, useState } from "react";
import DriveAction from "./action";
import SwitchRadio from "@/components/common/input-data/switch/switch-radio";
import Label from "@/components/common/display/label";
import { IoDownload, IoSend } from "react-icons/io5";
import { getLocalTracklistDriveUrl } from "@/lib/local-storege/local-storage";
import useConfigStore from "@/stores/config-store";
import Button from "@/components/common/button/button";
import { GrUpdate } from "react-icons/gr";
import Tags from "@/components/common/display/tags";
import { BsYoutube } from "react-icons/bs";
import Link from "next/link";
import { FaGoogleDrive } from "react-icons/fa";

interface AddFromDriveProps {
  onAddUrlDrvie?: (value: string) => Promise<boolean>;
  onAddTrackListDrive?: (value: string) => Promise<boolean>;
  onSystemChange: (value: string) => void;
  getSystem?: () => boolean;
  driveCheckForUpdate: () => Promise<void>;
}

const AddFromDrive: React.FC<AddFromDriveProps> = ({
  onAddUrlDrvie,
  onAddTrackListDrive,
  onSystemChange,
  getSystem,
  driveCheckForUpdate,
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
    }
    return res ?? false;
  };

  return (
    <div className="flex flex-col gap-2 h-full">
      <div className="flex justify-between">
        <Label
          textSize={15}
          textColor="text-gray-800"
          headClass="bg-blue-500"
          description="เชื่อมต่อเพลงและอัปโหลดเพลงไปที่ Drive"
        >
          เชื่อมต่อ Drive
        </Label>
        <div className="flex gap-1">
          <Link
            href={"https://drive.google.com/drive/folders/11z9hlAAJVgGOiuJnkxA1gdsIJjDf3BpY?usp=sharing"}
            target="_blank"
            className="w-fit"
          >
            <Button
              blur={false}
              color="blue"
              iconPosition="left"
              className="text-white w-fit"
              icon={<FaGoogleDrive className="text-white" />}
            >
              ลิงก์ Drive
            </Button>
          </Link>
          <Link
            href={"https://www.youtube.com/watch?v=jgLmRHOPLO8"}
            target="_blank"
            className="w-fit"
          >
            <Button
              blur={false}
              color="red"
              iconPosition="left"
              className="text-white w-fit"
              icon={<BsYoutube className="text-white" />}
            >
              วิธีใช้งาน
            </Button>
          </Link>
        </div>
      </div>
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
      <div className="flex flex-col gap-1 w-fit">
        <Label>อัปเดตเพลงจาก Google Drive</Label>
        <Button
          disabled={!config.system?.drive}
          color="blue"
          padding="px-4"
          className="h-8 text-white"
          onClick={() => {
            driveCheckForUpdate();
          }}
          iconPosition="left"
          icon={<GrUpdate></GrUpdate>}
          blur={false}
        >
          อัปเดตเพลง
        </Button>
      </div>
      <div className="py-2">
        <hr className="pb-2" />
        <Label
          textSize={15}
          textColor="text-gray-800"
          headClass="bg-blue-500"
          description="สำหรับเชื่อมต่อเพลง Extheme ที่อยู่บน Drive"
        >
          เชื่อมต่อ Extreme Drive
        </Label>
      </div>
      <DriveAction
        ok={tracklistUrl ? true : false}
        title="ดาวน์โหลด Extheme Drive"
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

      {/* <div className="text-blue-500">
        หากใครสนใจทดสอบโหลดเพลงจาก Google drive ต้องติดต่อ Admin
      </div> */}
    </div>
  );
};

export default AddFromDrive;
