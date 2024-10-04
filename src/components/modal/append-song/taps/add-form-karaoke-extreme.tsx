import Button from "@/components/common/button/button";
import Upload from "@/components/common/input-data/upload";
import Label from "@/components/common/label";
import ProgressBar from "@/components/common/progress-bar";
import React from "react";
import { BsFileZip } from "react-icons/bs";
import { FaCheck, FaFile, FaDownload, FaWindows } from "react-icons/fa";
import { GrDocumentZip } from "react-icons/gr";
import { SiMacos } from "react-icons/si";

interface AddFormKaraokeExtremeProps {
  onAddFile?: (file: File, filelist: FileList) => void;
  filename?: string;
  process?: {
    unzip?: boolean;
    db_result?: boolean;
    progress?: IProgressBar;
  };
}

const AddFormKaraokeExtreme: React.FC<AddFormKaraokeExtremeProps> = ({
  onAddFile,
  process,
  filename,
}) => {
  return (
    <>
      <div className="flex flex-col h-full">
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
        </div>

        <div>
          <Label>การประมวลผล</Label>
          <div className="flex flex-col w-full p-6 border rounded-md">
            <div className="flex items-center justify-between h-5">
              <div>
                {process?.unzip && (
                  <span className="flex items-center gap-1">
                    <Label>
                      <BsFileZip></BsFileZip>
                    </Label>
                    <Label className="pb-0.5">Extracting...</Label>
                  </span>
                )}
                {!process?.unzip && process?.db_result && (
                  <span className="flex items-center gap-1">
                    <Label>
                      <FaCheck></FaCheck>
                    </Label>
                    <Label className="pb-0.5">บันทึกเพลงเรียบร้อย</Label>
                  </span>
                )}
              </div>

              {!process?.unzip && process?.progress?.processing && (
                <span className="flex items-center gap-1">
                  <Label>
                    <FaFile></FaFile>
                  </Label>
                  <Label className="pb-0.5">
                    {process?.progress?.processing}
                  </Label>
                </span>
              )}
            </div>
            <div>
              <ProgressBar
                progress={process?.progress?.progress ?? 0}
                title={process?.progress?.processing}
              ></ProgressBar>
            </div>

            {process?.progress?.error && (
              <div className="pt-2">
                <Label>{process?.progress?.error}</Label>
              </div>
            )}
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
