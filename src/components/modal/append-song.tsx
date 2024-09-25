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
  };

  const onLoadFileZip = async (_: File, fileList: FileList) => {
    setLoadZip(true);
    const loaded = await loadFileZip(fileList, setProgress);
    if (loaded) {
      setLoadZip(false);
      await onPrepareStorage(loaded);
    }
  };

  return (
    <>
      <div className="flex flex-col gap-4  ">
        <Upload onSelectFile={onLoadFileZip} inputProps={{}}>
          <Button>
            <div>เลือกไฟล์</div>
          </Button>
        </Upload>

        <div className="text-sm text-gray-700">
          <span className="font-semibold">onCommitToDB:</span>
          <span className="text-gray-500 break-words">
            {JSON.stringify(onCommitToDB)}
          </span>
        </div>

        <div className="text-sm text-gray-700">
          <span className="font-semibold">onLoadZip:</span>
          <span className="text-gray-500 break-words">
            {JSON.stringify(onLoadZip)}
          </span>
        </div>

        <div className="text-sm text-gray-700">
          <span className="font-semibold">Progress:</span>
          <span
            className={`font-bold ${
              progress?.progress ? "text-green-500" : "text-red-500"
            }`}
          >
            {progress?.progress || "No progress"}
          </span>
        </div>

        <div className="text-sm text-gray-700">
          <span className="font-semibold">Processing:</span>
          <span
            className={`font-bold ${
              progress?.processing ? "text-green-500" : "text-red-500"
            }`}
          >
            {progress?.processing}
          </span>
        </div>

        <div className="text-sm text-gray-700">
          <span className="font-semibold">Error:</span>
          <span className="text-red-500">{progress?.error || "No errors"}</span>
        </div>
      </div>
    </>
  );
};

export default AppendSongModal;
