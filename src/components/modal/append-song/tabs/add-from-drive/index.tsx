import React, { useEffect, useState } from "react";
import DriveAction from "./action";
import SwitchRadio from "@/components/common/input-data/switch/switch-radio";
import Label from "@/components/common/display/label";
import { IoDownload, IoSend } from "react-icons/io5";
import { getLocalTracklistDriveUrl } from "@/lib/local-storege/local-storage";
import useConfigStore from "@/features/config/config-store";
import Button from "@/components/common/button/button";
import { GrUpdate } from "react-icons/gr";
import { BsYoutube } from "react-icons/bs";
import Link from "next/link";
import { FaCat, FaGoogleDrive } from "react-icons/fa";
import { FiFilePlus } from "react-icons/fi";
import UpdateFile from "@/components/common/input-data/upload";
import { TbMusicPlus } from "react-icons/tb";
import { SiJson } from "react-icons/si";

interface AddFromDriveProps {
  onAddUrlDrvie?: (value: string) => Promise<boolean>;
  onAddTrackListDrive?: (value: string) => Promise<boolean>;
  onAddTrackListFormCom?: (file: File) => Promise<boolean>
  onSystemChange: (value: string) => void;
  driveCheckForUpdate: () => Promise<void>;
}

const AddFromDrive: React.FC<AddFromDriveProps> = ({
  onAddUrlDrvie,
  onAddTrackListDrive,
  onAddTrackListFormCom,
  onSystemChange,
  driveCheckForUpdate,
}) => {
  const config = useConfigStore((state) => state.config);
  const [system, setSystem] = useState<string>("off");
  const [driveUrl, setDriveUrl] = useState<string>();
  const [tracklistUrl, setTrackListUrl] = useState<string>();
  const [onDriveTested, setDriveTested] = useState<boolean>(false);
  const [openAdSetting, setOpenAd] = useState<boolean>(false)
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
      <div className="md:flex justify-between">
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
            href={
              "https://drive.google.com/drive/folders/1wqib6TiFHcnJwXZuUN2cNc32DDYvvODl?usp=sharing"
            }
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
              {/* ลิงก์ Drive */}
            </Button>
          </Link>

          <Link
            href={"https://www.youtube.com/watch?v=p422bTCAGRQ"}
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
              {/* วิธีใช้งาน */}
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
        <Label>กรณีไฟล์ขนาดใหญ่เกินไป</Label>
        <Button color={openAdSetting ? "default" : "blue"} icon={<FiFilePlus></FiFilePlus>} onClick={() => { setOpenAd((p) => !p) }} iconPosition="left" padding="px-4" className="h-8">ติดตั้งเพลงเอง</Button>
      </div>

      {openAdSetting && <div>
        <div className="flex flex-col gap-1">
          <Label>เพิ่มจากเครื่อง</Label>
          <UpdateFile
            accept=".json"
            className="border border-blue-500 p-3 rounded-md hover:bg-gray-50 duration-300"
            onSelectFile={onAddTrackListFormCom}
          >
            <span className="w-full  text-sm flex items-center gap-2">
              <span>
                <SiJson className="text-blue-500"></SiJson>
              </span>
              <span>อัปโหลดไฟล์</span>
              <Label>ไม่เกิน 500 Gb.</Label>
            </span>
          </UpdateFile>
        </div>
        <DriveAction
          ok={tracklistUrl ? true : false}
          title="กรณีไม่สามารถเชื่อมต่อได้เพราะ File ขนาดใหญ่เกินไป"
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

      </div>}

      {/* <div className="text-blue-500">
        หากใครสนใจทดสอบโหลดเพลงจาก Google drive ต้องติดต่อ Admin
      </div> */}
    </div>
  );
};

export default AddFromDrive;


<div className="py-2">
  <div className="md:flex justify-between">
    <Label
      textSize={15}
      textColor="text-gray-800"
      headClass="bg-blue-500"
      description="สำหรับเชื่อมต่อเพลง Extheme ที่อยู่บน Drive"
    >
      เชื่อมต่อ Extreme Drive
    </Label>
    <div className="flex gap-1">
      <Link
        href={
          "https://drive.google.com/drive/folders/1wqib6TiFHcnJwXZuUN2cNc32DDYvvODl?usp=sharing"
        }
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
          {/* ลิงก์ Drive */}
        </Button>
      </Link>
      <Link
        href={"https://catbox.moe/#"}
        target="_blank"
        className="w-fit"
      >
        <Button
          blur={false}
          color="amber"
          iconPosition="left"
          className="text-white w-fit"
          icon={<FaCat className="text-white" />}
        >
          {/* ลิงก์ Drive */}
        </Button>
      </Link>
      <Link
        href={"https://youtu.be/pHzYj_EksNI"}
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
          {/* วิธีใช้งาน */}
        </Button>
      </Link>
    </div>
  </div>
</div>