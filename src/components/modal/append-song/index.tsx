import React, { useEffect, useState } from "react";
import { useAppControl } from "@/hooks/app-control-hook";
import Tabs from "../../common/tabs";
import AddSong from "./taps/add-song";
import AddTracklist from "./taps/add-tracklist";
import AddFormKaraokeExtreme from "./taps/add-form-karaoke-extreme";
import { readSong } from "@/lib/karaoke/read";
import {
  addTracklistsToDatabase,
  jsonTracklistToDatabase,
  saveTracklistToStorage,
} from "@/lib/storage/tracklist";
import {
  addSongKaraokeExtremeToStorage,
  createSongZip,
} from "@/lib/storage/song";

interface AppendSongModalProps {}

const AppendSongModal: React.FC<AppendSongModalProps> = ({}) => {
  const { setTracklistFile, setRemoveTracklistFile, addTracklist } =
    useAppControl();
  const [progress, setProgress] = useState<IProgressBar>();
  const [onLoadZip, setLoadZip] = useState<boolean>(false);
  const [onCommitToDB, setCommitToDB] = useState<boolean>(false);
  const [filename, setFilename] = useState<string>();
  const [musicFilename, setMusicFilename] = useState<string>();
  const [listCreateSong, setListCreateSong] = useState<
    SongFiltsEncodeAndDecode[]
  >([]);

  const onPrepareStorage = async (musicLibrary: Map<string, File>) => {
    setCommitToDB(true);
    await saveTracklistToStorage(musicLibrary, setProgress);
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
    const loaded = await addSongKaraokeExtremeToStorage(fileList, setProgress);
    if (loaded) {
      setLoadZip(false);
      await onPrepareStorage(loaded);
    }
  };

  // const loadTrackListFile = async () => {
  //   const file = await getTrackList();
  //   if (file) {
  //     setMusicFilename(file.name);
  //   }
  // };

  const onLoadFileJson = async (_: File, fileList: FileList) => {
    if (fileList.length === 0) {
      return;
    }
    const file = fileList.item(0);

    if (file?.type === "application/json") {
      const saved = await jsonTracklistToDatabase(file);
      if (saved) {
        setTracklistFile(file);
        setMusicFilename(file?.name);
      }
    }
  };

  const onRemoveFileJson = async () => {
    setRemoveTracklistFile();
    setMusicFilename(undefined);
  };

  const onAddSong = async () => {
    try {
      if (listCreateSong) {
        const tracklist = await createSongZip(listCreateSong);
        if (tracklist) {
          const added = await addTracklistsToDatabase(tracklist);
          if (added) {
            addTracklist(tracklist);
            return true;
          }
          return false;
        }
        return false;
      }
      return false;
    } catch (error) {
      return false;
    }
  };

  const bufferFileToDisplay = async (_: File, filelist: FileList) => {
    const readed = await readSong(filelist);
    setListCreateSong(readed);
  };

  useEffect(() => {
    // loadTrackListFile();
  }, []);

  return (
    <Tabs
      tabs={[
        {
          label: "เพิ่มเพลง",
          content: (
            <AddSong
              onCreate={onAddSong}
              onAddFile={bufferFileToDisplay}
              bufferFile={listCreateSong}
            />
          ),
        },
        {
          label: "ฐานข้อมูลเพลง",
          content: (
            <AddTracklist
              onAddFile={onLoadFileJson}
              onRemoveFile={onRemoveFileJson}
              filename={musicFilename}
            />
          ),
        },
        {
          label: "ติดตั้งเพลงจาก Karaoke extreme",
          content: (
            <AddFormKaraokeExtreme
              filename={filename}
              onAddFile={onLoadFileZip}
              process={{
                db_result: onCommitToDB,
                progress: progress,
                unzip: onLoadZip,
              }}
            />
          ),
        },
        // {
        //   label: "วิธีใช้โปรแกรม",
        //   content: (
        //     <div className="flex flex-col gap-1 p-2 w-full">
        //       <Label className="flex gap-1 items-center ">
        //         <FaDownload></FaDownload> โปรแกรมนำเข้าเพลง
        //       </Label>

        //       <span className="flex gap-2">
        //         <Button
        //           color="blue"
        //           className="text-white"
        //           shadow=""
        //           border=""
        //           blur=""
        //         >
        //           <FaWindows></FaWindows>
        //         </Button>
        //         <Button
        //           color="blue"
        //           padding=""
        //           className="text-white w-20 h-10"
        //           shadow=""
        //           border=""
        //           blur=""
        //         >
        //           <span className="">
        //             <SiMacos className="text-5xl"></SiMacos>
        //           </span>
        //         </Button>
        //       </span>
        //       <div className="pt-2">
        //         <hr />
        //       </div>
        //       <span className="text-sm">
        //         วิธีใช้ นำโปรแกรมไปวางไว้ที่ตำแหน่ง Karaoke Extreme
        //         และเปิดโปรแกรมนำเข้าเพลง <br />
        //       </span>
        //     </div>
        //   ),
        // },
      ]}
    ></Tabs>
  );
};

export default AppendSongModal;
