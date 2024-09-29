import React, { useEffect, useState } from "react";
import Modal from "../common/modal";
import { BsDatabaseAdd } from "react-icons/bs";
import { saveSongToStorage } from "@/lib/storage";
import ProgressBar from "../common/progress-bar";

interface SongStorageProcessorProps {
  musicLibrary?: Map<string, File>;
  visible?: boolean;
}

const SongStorageProcessor: React.FC<SongStorageProcessorProps> = ({
  musicLibrary,
  visible,
}) => {
  const [progress, setProgress] = useState<IProgressBar>();
  const [onFinish, setFinsh] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);

  const breakCloseUser = progress ? onFinish : undefined;

  const handleClose = () => {
    if (breakCloseUser) {
      setOpen(false);
    }
  };

  const onPrepareStorage = async () => {
    if (musicLibrary) {
      const onStorage = await saveSongToStorage(musicLibrary, setProgress);
      setFinsh(onStorage.result);
    }
  };

  useEffect(() => {
    if (musicLibrary) {
      setOpen(true);
    }
  }, [musicLibrary]);

  useEffect(() => {
    if (visible !== undefined) {
      setOpen(visible);
    }
  }, [visible]);

  const title = (
    <div className="flex gap-3 items-center">
      <BsDatabaseAdd className="text-2xl"></BsDatabaseAdd>
      <span>เก็บเพลงไว้ในเบราว์เซอร์?</span>
    </div>
  );

  function Question() {
    return (
      <div>
        <span className="font-bold">ในครั้งต่อไปไม่ต้องโหลดเพลงเข้าอีก </span>
        คุณต้องการเก็บเพลงทั้งหมดที่โหลดเข้ามาไว้ในฐานข้อมูล{" "}
        <span>
          <a
            target="_blank"
            href="https://web.dev/articles/indexeddb?hl=th#what"
            className="underline text-blue-500"
          >
            IndexedDB
          </a>
        </span>{" "}
        หรือไม่?
      </div>
    );
  }
  function LoadToDatabase() {
    return (
      <>
        <div>
          {progress?.error ? (
            <div className="text-sm text-red-500">Error: {progress.error}</div>
          ) : (
            <ProgressBar
              progress={progress?.progress ?? 0}
              title={progress?.processing}
            ></ProgressBar>
          )}
        </div>
      </>
    );
  }

  return (
    <Modal
      closable={breakCloseUser}
      cancelProps={{
        disabled: breakCloseUser,
      }}
      okButtonProps={{
        disabled: breakCloseUser,
      }}
      onOk={onPrepareStorage}
      title={title}
      isOpen={open}
      onClose={handleClose}
      width="500px"
    >
      <>
        {!progress ? <Question></Question> : <LoadToDatabase></LoadToDatabase>}
      </>
    </Modal>
  );
};

export default SongStorageProcessor;
