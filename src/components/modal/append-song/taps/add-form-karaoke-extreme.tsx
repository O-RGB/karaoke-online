import Button from "@/components/common/button/button";
import Upload from "@/components/common/input-data/upload";
import Label from "@/components/common/label";
import Modal from "@/components/common/modal";
import ProgressBar from "@/components/common/progress-bar";
import {
  getAllKeyTracklist,
  getTracklistToJson,
} from "@/lib/storage/tracklist";
import React, { useEffect, useState } from "react";
import { BsFileZip } from "react-icons/bs";
import {
  FaCheck,
  FaFile,
  FaDownload,
  FaWindows,
  FaTimesCircle,
} from "react-icons/fa";
import { GrDocumentZip } from "react-icons/gr";
import { MdDelete } from "react-icons/md";
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
  // process?: {
  //   unzip?: boolean;
  //   db_result?: boolean;
  //   progress?: IProgressBar;
  //   isWait?: boolean;
  // };
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
  // const [open, setOpen] = useState<boolean>(false);

  // useEffect(() => {
  //   if (process?.isWait) {
  //     setOpen(true);
  //   } else {
  //     setOpen(false);
  //   }
  // }, [process?.isWait]);

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
              {/* {filenameTracklist ? (
                <>
                  <span className="border rounded-md  p-0.5 px-2 text-gray-400 flex gap-1 items-center">
                    <FaCheck className="text-green-500"></FaCheck>
                    {filenameTracklist}
                  </span>
                  <span
                    onClick={onRemoveFileTracklist}
                    className="border rounded-md p-0.5 px-2 text-gray-400 flex gap-1 items-center cursor-pointer"
                  >
                    <MdDelete className="text-red-500"></MdDelete>
                  </span>
                </>
              ) : (
                <span className="border rounded-md  p-0.5 px-2 text-gray-400 flex gap-1 items-center">
                  <FaTimesCircle className="text-red-500"></FaTimesCircle>
                  ยังไม่มีฐานข้อมูลเพลง
                </span>
              )} */}
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2 pt-2">
          <Label className="flex gap-1 items-center ">
            <FaDownload></FaDownload> โปรแกรมนำเข้าเพลง
          </Label>

          <span className="flex gap-2">
            <Button
              color="blue"
              className="text-white"
              shadow=""
              border=""
              blur=""
            >
              <FaWindows></FaWindows>
            </Button>
            <Button
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
          </span>
        </div>
      </div>
    </>
  );
};

export default AddFormKaraokeExtreme;
