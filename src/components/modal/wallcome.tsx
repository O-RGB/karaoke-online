import { loadFileSystem, loadFileZip, storageIsEmpty } from "@/lib/storage";
import React, { useEffect, useState } from "react";
import Modal from "../common/modal";
import Button from "../common/button/button";
import { FaComputer, FaRegFileZipper } from "react-icons/fa6";
import Upload from "../common/upload";
import ProgressBar from "../common/progress-bar";

interface WallcomeModalProps {
  setTracklistFile: (file: File) => Promise<void>;
  setMusicLibraryFile: (files: Map<string, File>) => void;
}

const WallcomeModal: React.FC<WallcomeModalProps> = ({
  setMusicLibraryFile,
  setTracklistFile,
}) => {
  const [progress, setProgress] = useState<IProgressBar>();
  const [open, setOpen] = useState<boolean>(false);
  const [fileSystem, setFileSystem] = useState<boolean>(true);
  var butSize = "w-full h-56 lg:h-80";
  const dataIsEmpty = async () => {
    const isEmpty = await storageIsEmpty();
    setTimeout(() => {
      setOpen(isEmpty);
    }, 100);
  };
  const handleClose = (delay: number = 0) => {
    setTimeout(() => {
      setOpen(false);
    }, delay);
  };

  const onLoadFileSystem = async () => {
    const loaded = await loadFileSystem();
    if (loaded) {
      setTracklistFile(loaded.tracklist);
      setMusicLibraryFile(loaded.musicLibrary);
      handleClose(1000);
    }
  };

  const onLoadFileZip = async (_: File, fileList: FileList) => {
    setFileSystem(false);
    const loaded = await loadFileZip(fileList, setProgress);
    if (loaded) {
      setTracklistFile(loaded.tracklist);
      setMusicLibraryFile(loaded.musicLibrary);
      handleClose(1000);
    }
  };

  useEffect(() => {
    dataIsEmpty();
  }, []);
  return (
    <Modal title="ตั้งค่าเพลง" isOpen={open} onClose={handleClose}>
      <div className="flex flex-col lg:flex-row gap-3 w-full h-full">
        {fileSystem && (
          <Button
            onClick={onLoadFileSystem}
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
        )}

        <Upload
          inputProps={{
            multiple: true,
          }}
          className={butSize}
          onSelectFile={onLoadFileZip}
        >
          <Button
            disabled={!fileSystem}
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
        {!fileSystem && (
          <ProgressBar
            progress={progress?.progress ?? 0}
            title={progress?.processing}
          ></ProgressBar>
        )}
      </div>
    </Modal>
  );
};

export default WallcomeModal;
