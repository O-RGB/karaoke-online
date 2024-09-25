import {
  getSongBySuperKey,
  loadFileSystem,
  loadFileZip,
  storageIsEmpty,
} from "@/lib/storage";
import React, { useEffect, useState } from "react";
import Modal from "../common/modal";
import Button from "../common/button/button";
import { FaComputer, FaRegFileZipper } from "react-icons/fa6";
import Upload from "../common/input-data/upload";
import ProgressBar from "../common/progress-bar";
import SongStorageProcessor from "./song-storage";
import { TRACKLIST_FILENAME } from "@/config/value";
import { IoDocumentText } from "react-icons/io5";
interface WallcomeModalProps {
  setTracklistFile: (file: File) => Promise<void>;
  setMusicLibraryFile: (files: Map<string, File>) => void;
  musicLibrary?: Map<string, File>;
}

const WallcomeModal: React.FC<WallcomeModalProps> = ({
  setMusicLibraryFile,
  setTracklistFile,
  musicLibrary,
}) => {
  var butSize = "w-full h-56 lg:h-80";

  const [progress, setProgress] = useState<IProgressBar>();
  const [onZipFinish, setZipFinsh] = useState<boolean>(false);
  const [fileSystem, setFileSystem] = useState<boolean>(true);
  const [songFile, setSongFile] = useState<File>();
  const [open, setOpen] = useState<boolean>(false);

  const dataIsEmpty = async () => {
    const isEmpty = await storageIsEmpty();
    setTimeout(() => {
      setOpen(isEmpty);
    }, 100);
    if (!isEmpty) {
      loadTracklistStorage();
    }
  };
  const handleClose = (delay: number = 0) => {
    setTimeout(() => {
      setOpen(false);
    }, delay);
  };

  const loadTracklistStorage = async () => {
    const file = await getSongBySuperKey(TRACKLIST_FILENAME);
    if (file) {
      setTracklistFile(file);
    }
  };

  // const onLoadFileSystem = async () => {
  //   const loaded = await loadFileSystem();
  //   if (loaded) {
  //     // setTracklistFile(loaded.tracklist);
  //     // setSongFile(loaded.tracklist);
  //     setMusicLibraryFile(loaded);
  //     handleClose(1000);
  //   }
  // };

  const onLoadMusicLibrary = async (_: File, fileList: FileList) => {
    if (fileList.length === 1) {
      const file = fileList.item(0);
      if (file?.type === "application/json") {
        setTracklistFile(file);
        setSongFile(file);
      }
    }
  };

  const onLoadFileZip = async (_: File, fileList: FileList) => {
    setFileSystem(false);
    const loaded = await loadFileZip(fileList, setProgress);
    if (loaded) {
      setMusicLibraryFile(loaded);
      handleClose(1000);
      setZipFinsh(true);
    }
  };

  useEffect(() => {
    dataIsEmpty();
  }, []);
  return (
    <>
      <SongStorageProcessor
        tracklist={songFile}
        musicLibrary={musicLibrary}
        visible={onZipFinish}
      ></SongStorageProcessor>
      <Modal
        title="ตั้งค่าเพลง"
        isOpen={open}
        onClose={handleClose}
        footer={<></>}
      >
        {!fileSystem ? (
          <>
            {progress?.error ? (
              <div className="text-sm text-red-500">
                Error: {progress.error}
              </div>
            ) : (
              <ProgressBar
                progress={progress?.progress ?? 0}
                title={progress?.processing}
              ></ProgressBar>
            )}
          </>
        ) : (
          <div className="flex gap-2">
            <Upload
              inputProps={{
                multiple: true,
              }}
              className={butSize}
              onSelectFile={onLoadMusicLibrary}
            >
              <Button
                border=""
                color="white"
                shadow=""
                className={butSize}
                icon={<IoDocumentText className="text-4xl" />}
              >
                SONG
              </Button>
            </Upload>
            <Upload
              inputProps={{
                multiple: true,
              }}
              className={butSize}
              onSelectFile={onLoadFileZip}
            >
              <Button
                border=""
                // onClick={onLoadFileSystem}
                color="white"
                shadow=""
                className={butSize}
                icon={<FaComputer className="text-4xl" />}
              >
                SONG
              </Button>
            </Upload>
          </div>
        )}

        {/* <div className="flex flex-col lg:flex-row gap-3 w-full h-full">
          {fileSystem && (
            <Button
              border=""
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
          <div className="w-full">
            <Upload
              inputProps={{
                multiple: true,
              }}
              className={butSize}
              onSelectFile={onLoadFileZip}
            >
              <Button
                border=""
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
              <>
                {progress?.error ? (
                  <div className="text-sm text-red-500">
                    Error: {progress.error}
                  </div>
                ) : (
                  <ProgressBar
                    progress={progress?.progress ?? 0}
                    title={progress?.processing}
                  ></ProgressBar>
                )}
              </>
            )}
          </div>
        </div> */}
      </Modal>
    </>
  );
};

export default WallcomeModal;
