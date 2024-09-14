import { loadFileZip, saveSongToStorage } from "@/lib/storage";
import React, { useEffect, useState } from "react";
import Upload from "../common/input-data/upload";
import Button from "../common/button/button";

interface AppendSongModalProps {}

const AppendSongModal: React.FC<AppendSongModalProps> = ({}) => {
  const [progress, setProgress] = useState<IProgressBar>();
  const [onLoadZip, setLoadZip] = useState<boolean>(false);
  const [onCommitToDB, setCommitToDB] = useState<boolean>(false);

  const onPrepareStorage = async (musicLibrary: Map<string, File>) => {
    setCommitToDB(true);
    const onStorage = await saveSongToStorage(
      musicLibrary,
      undefined,
      setProgress
    );
    setCommitToDB(false);
    setProgress(undefined);
    setLoadZip(false);
    console.log("fin");
  };

  const onLoadFileZip = async (_: File, fileList: FileList) => {
    setLoadZip(true);
    const loaded = await loadFileZip(fileList, setProgress);
    if (loaded) {
      setLoadZip(false);
      await onPrepareStorage(loaded.musicLibrary);
    }
  };

  return (
    <>
      <div className="flex flex-col gap-2">
        onCommitToDB: [{JSON.stringify(onCommitToDB)}] <br />
        onLoadZip: [{JSON.stringify(onLoadZip)}] <br />
        progress: [{progress?.progress}] <br />
        processing: [{progress?.processing}] <br />
        error: [{progress?.error}] <br />
      </div>
      <Upload onSelectFile={onLoadFileZip} inputProps={{}}>
        <Button>
          <div className="">เลือกไฟล์</div>
        </Button>
      </Upload>
    </>
  );
};

export default AppendSongModal;
