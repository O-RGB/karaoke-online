import { loadFileZip, saveSongToStorage } from "@/lib/storage";
import React, { useEffect, useState } from "react";
import Upload from "../common/input-data/upload";
import Button from "../common/button/button";
import Label from "../common/label";
import { FaFile, FaFileZipper } from "react-icons/fa6";
import { GrDocumentZip } from "react-icons/gr";
import ProgressBar from "../common/progress-bar";
import { BsFileZip } from "react-icons/bs";
import { FaCheck, FaDownload, FaPython, FaWindows } from "react-icons/fa";
import { RiInstallLine } from "react-icons/ri";
import { SiMacos } from "react-icons/si";

interface AppendSongModalProps {}

const AppendSongModal: React.FC<AppendSongModalProps> = ({}) => {
  const [progress, setProgress] = useState<IProgressBar>();
  const [onLoadZip, setLoadZip] = useState<boolean>(false);
  const [onCommitToDB, setCommitToDB] = useState<boolean>(false);
  const [filename, setFilename] = useState<string>();

  const onPrepareStorage = async (musicLibrary: Map<string, File>) => {
    setCommitToDB(true);
    await saveSongToStorage(musicLibrary, setProgress);
    setCommitToDB(false);
    setProgress(undefined);
    setLoadZip(false);
  };

  const onLoadFileZip = async (_: File, fileList: FileList) => {
    if (fileList.length === 0) {
      return;
    }

    setLoadZip(true);
    setFilename(fileList.item(0)?.name);
    const loaded = await loadFileZip(fileList, setProgress);
    if (loaded) {
      setLoadZip(false);
      await onPrepareStorage(loaded);
    }
  };

  return (
    <div className="grid grid-cols-5 gap-4">
      <div className="col-span-5 lg:col-span-3 flex flex-col gap-4">
        <div className="w-full">
          <Label>เลือกไฟล์เพลง (.zip)</Label>
          <Upload
            accept=".zip"
            className="border p-3 rounded-md hover:bg-gray-50 duration-300 flex justify-between"
            onSelectFile={onLoadFileZip}
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
                {onLoadZip && (
                  <span className="flex items-center gap-1">
                    <Label>
                      <BsFileZip></BsFileZip>
                    </Label>
                    <Label className="pb-0.5">Extracting...</Label>
                  </span>
                )}
                {!onLoadZip && onCommitToDB && (
                  <span className="flex items-center gap-1">
                    <Label>
                      <FaCheck></FaCheck>
                    </Label>
                    <Label className="pb-0.5">บันทึกเพลงเรียบร้อย</Label>
                  </span>
                )}
              </div>

              {!onLoadZip && progress?.processing && (
                <span className="flex items-center gap-1">
                  <Label>
                    <FaFile></FaFile>
                  </Label>
                  <Label className="pb-0.5">{progress?.processing}</Label>
                </span>
              )}
            </div>
            <div>
              <ProgressBar
                progress={progress?.progress ?? 0}
                title={progress?.processing}
              ></ProgressBar>
            </div>

            {progress?.error && (
              <div className="pt-2">
                <Label>{progress?.error}</Label>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="col-span-5 lg:col-span-2 flex flex-col gap-1 p-2">
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
  );
};

export default AppendSongModal;
