import Upload from "@/components/common/input-data/upload";
import Label from "@/components/common/label";
import React from "react";
import { FaCheck, FaTimesCircle } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { TbJson } from "react-icons/tb";

interface AddTracklistProps {
  onAddFile: (file: File, filelist: FileList) => void;
  onRemoveFile: () => void;
  filename?: string;
}

const AddTracklist: React.FC<AddTracklistProps> = ({
  onAddFile,
  onRemoveFile,
  filename,
}) => {
  return (
    <>
      <div className="w-full">
        <Label>เลือกไฟล์ฐานข้อมูลเพลง (.json) </Label>
        <Upload
          accept=".json"
          className="border p-3 rounded-md hover:bg-gray-50 duration-300 flex justify-between"
          onSelectFile={onAddFile}
          inputProps={{}}
        >
          <span className="w-full text-sm flex items-center gap-2">
            <TbJson></TbJson>
            <span>อัปโหลดไฟล์</span>
          </span>
          <Label>{filename}</Label>
        </Upload>
        <div className="flex gap-1 w-full justify-end pt-1 text-[10px]">
          {filename ? (
            <>
              <span className="border rounded-md  p-0.5 px-2 text-gray-400 flex gap-1 items-center">
                <FaCheck className="text-green-500"></FaCheck>
                {filename}
              </span>
              <span
                onClick={onRemoveFile}
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
          )}
        </div>
      </div>
    </>
  );
};

export default AddTracklist;
