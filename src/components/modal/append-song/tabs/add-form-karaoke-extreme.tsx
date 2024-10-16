import Button from "@/components/common/button/button";
import Upload from "@/components/common/input-data/upload";
import Label from "@/components/common/label";
import Link from "next/link";
import React from "react";
import { BsYoutube } from "react-icons/bs";
import { FaDownload, FaWindows } from "react-icons/fa";
import { GrDocumentZip } from "react-icons/gr";
import { SiMacos } from "react-icons/si";
import { TbJson } from "react-icons/tb";

interface AddFormKaraokeExtremeProps {
  onCloseProcess?: () => void;
  onAddFile?: (file: File, filelist: FileList) => void;
  filename?: string;
  onAddFileTracklist: (file: File) => void;
  onRemoveFileTracklist: () => void;
  filenameTracklist?: string;
  tracklistCount: number;
  musicLibraryCount: number;
}

const AddFormKaraokeExtreme: React.FC<AddFormKaraokeExtremeProps> = ({
  onAddFile,
  onCloseProcess,
  // process,
  filename,
  tracklistCount,
  musicLibraryCount,
  onAddFileTracklist,
  onRemoveFileTracklist,
}) => {
  return (
    <>
      <div className="flex flex-col h-full">
        <div className="flex flex-col gap-2">
          <div className="w-full">
            <Label>เลือกไฟล์รวมเพลง (.zip)</Label>
            <Upload
              accept=".zip"
              className="border p-3 rounded-md hover:bg-gray-50 duration-300 flex justify-between"
              onSelectFile={onAddFile}
              inputProps={{}}
            >
              <span className="w-full text-sm flex items-center gap-2">
                <GrDocumentZip></GrDocumentZip>
                <span>อัปโหลดไฟล์</span>
              </span>
              <Label>{filename}</Label>
            </Upload>
            <div className="flex gap-1 w-full justify-end pt-1 text-[10px]">
              <Label>
                {" "}
                บันทึกแล้ว {musicLibraryCount.toLocaleString()} รายชื่อ
              </Label>
            </div>
          </div>
          <div className="w-full">
            <Label>เลือกไฟล์ฐานข้อมูลเพลง (.json) </Label>
            <Upload
              accept=".json"
              className="border p-3 rounded-md hover:bg-gray-50 duration-300 flex justify-between"
              onSelectFile={onAddFileTracklist}
              inputProps={{}}
            >
              <span className="w-full text-sm flex items-center gap-2">
                <TbJson></TbJson>
                <span>อัปโหลดไฟล์</span>
              </span>
              {/* <Label>{filenameTracklist}</Label> */}
            </Upload>
            <div className="flex gap-1 w-full justify-end pt-1 text-[10px]">
              <Label>
                บันทึกแล้ว {tracklistCount.toLocaleString()} รายชื่อ
              </Label>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2 pt-2">
          <Label className="flex gap-1 items-center ">
            <FaDownload></FaDownload> โปรแกรมนำเข้าเพลง
          </Label>

          <span className="flex gap-2">
            <Link
              href={"https://drive.google.com/file/d/1TM9liOAZayz7VJ35jIbLN0z11BlD9mNT/view?usp=sharing"}
              target="_blank"
              className="w-fit"
            >
              <Button
                color="blue"
                className="text-white"
                shadow=""
                border=""
                blur=""
              >
                <FaWindows></FaWindows>
              </Button>
            </Link>
            <Button
              disabled
              color="blue"
              padding=""
              className="text-white w-20 h-10"
              shadow=""
              border=""
              blur=""
            >
              <span className="">
                <SiMacos className="text-5xl"></SiMacos>
              </span>
            </Button>
          </span>
          <div className="pt-2">
            <hr />
          </div>
          <span className="text-sm">
            วิธีใช้ นำโปรแกรมไปวางไว้ที่ตำแหน่ง Karaoke Extreme
            และเปิดโปรแกรมนำเข้าเพลง <br />
            <Link
              href={"https://www.youtube.com/watch?v=dVPB-dVmG1I"}
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
                วิธีเพิ่มเพลง
              </Button>
            </Link>
          </span>
        </div>
      </div>
    </>
  );
};

export default AddFormKaraokeExtreme;
