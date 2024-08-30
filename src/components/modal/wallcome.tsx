import { storageIsEmpty } from "@/lib/storage";
import React, { useEffect, useState } from "react";
import Modal from "../common/modal";
import Button from "../common/button/button";
import { FaComputer, FaRegFileZipper } from "react-icons/fa6";
import Upload from "../common/upload";

interface WallcomeModalProps {
  onLoadFileSystem?: () => Promise<boolean>;
  onLoadZip?: (file: FileList) => Promise<boolean>;
}

const WallcomeModal: React.FC<WallcomeModalProps> = ({
  onLoadFileSystem,
  onLoadZip,
}) => {
  const [open, setOpen] = useState<boolean>(false);
  var butSize = "w-full h-56 lg:h-80";
  const dataIsEmpty = async () => {
    const isEmpty = await storageIsEmpty();
    setTimeout(() => {
      setOpen(isEmpty);
    }, 100);
  };
  const handleClose = () => {
    setOpen(false);
  };

  const handleSelectFileSystem = async () => {
    const res = await onLoadFileSystem?.();
    if (res) {
      setOpen(false);
    }
  };
  const handleSelectZipFile = async (file: File, filelist: FileList) => {
    const res = await onLoadZip?.(filelist);
    if (res) {
      setOpen(false);
    }
  };

  useEffect(() => {
    dataIsEmpty();
  }, []);
  return (
    <Modal title="ตั้งค่าเพลง" isOpen={open} onClose={handleClose}>
      <div className="flex flex-col lg:flex-row gap-3 w-full h-full">
        <Button
          onClick={handleSelectFileSystem}
          color="white"
          shadow=""
          className={butSize}
          icon={<FaComputer className="text-4xl" />}
        >
          <span>File System</span>
          <span className="text-sm text-gray-400">
            โหลด Folder เพลงจากคอมพิวเตอร์ <br />
            โดยไม่โหลดเข้า Ram <br />
            (รองรับ Google chrome เท่านั้น)
          </span>
        </Button>

        <Upload
          inputProps={{
            multiple: true,
          }}
          className={butSize}
          onSelectFile={handleSelectZipFile}
        >
          <Button
            color="white"
            shadow=""
            className={butSize}
            icon={<FaRegFileZipper className="text-4xl" />}
          >
            <span>Zip File</span>
            <span className="text-sm text-gray-400">
              โหลดเพลงจากไฟล์ .zip <br />
              โดยการโหลดเข้า Ram <br />
              (ต้องแบ่งไฟล์ Part ละไม่เกิน 2GB)
            </span>
          </Button>
        </Upload>
      </div>
    </Modal>
  );
};

export default WallcomeModal;
