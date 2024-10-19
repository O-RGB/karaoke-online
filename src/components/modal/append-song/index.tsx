import React, { useEffect, useState } from "react";
import Tabs from "../../common/tabs";
import AddSong from "./tabs/add-song";
import AddFormKaraokeExtreme from "./tabs/add-form-karaoke-extreme";
import { readSong } from "@/lib/karaoke/read";
import {
  addTracklistsToDatabase,
  getAllKeyTracklist,
  jsonTracklistToDatabase,
  saveTracklistToStorage,
} from "@/lib/storage/tracklist";
import {
  extractMusicZip,
  createSongZip,
  getAllKeysSong,
} from "@/lib/storage/song";
import { PiMusicNotesPlusBold } from "react-icons/pi";
import { SiGoogledrive } from "react-icons/si";
import { TbMicrophone2 } from "react-icons/tb";
import ProcessingModal from "../../common/processing/processing";
import { testUrl } from "@/lib/fetch/test-api";
import AddFromDrive from "./tabs/add-from-drive";
import {
  setLocalDriveTested,
  setLocalDriveUrl,
  setLocalTracklistDriveTested,
} from "@/lib/local-storege/local-storage";
import useConfigStore from "@/stores/config-store";
import useTracklistStore from "@/stores/tracklist-store";

interface AppendSongModalProps {}

const AppendSongModal: React.FC<AppendSongModalProps> = ({}) => {
  const setConfig = useConfigStore((state) => state.setConfig);
  const setTracklist = useTracklistStore((state) => state.setTracklist);
  const addTracklist = useTracklistStore((state) => state.addTracklist);
  const removeTracklist = useTracklistStore((state) => state.removeTracklist);

  const [progress, setProgress] = useState<IProgressBar>();
  const [filename, setFilename] = useState<string>();
  const [musicFilename, setMusicFilename] = useState<string>();
  const [listCreateSong, setListCreateSong] = useState<
    SongFiltsEncodeAndDecode[]
  >([]);

  const [tracklistCount, setTracklistCount] = useState<number>(0);
  const [musicLibraryCount, setMusicLibraryCount] = useState<number>(0);

  // Count Item
  const getTracklistCount = async () => {
    const tracklist = await getAllKeyTracklist();
    setTracklistCount(tracklist.length);
    return tracklist;
  };
  const getMusicLibraryCount = async () => {
    const musicLibrary = await getAllKeysSong();
    setMusicLibraryCount(musicLibrary.length);
    return musicLibrary;
  };

  // Zip Loader
  const onPrepareStorage = async (musicLibrary: Map<string, File>) => {
    setProgress({ progress: 0, title: "กำลังโหลดเข้า Database", show: true });
    await saveTracklistToStorage(musicLibrary, setProgress);
  };

  const onLoadFileZip = async (_: File, fileList: FileList) => {
    if (fileList.length === 0) {
      return;
    }
    setFilename(fileList.item(0)?.name);
    setProgress({ progress: 0, title: "กำลัง Extract zip...", show: true });
    const loaded = await extractMusicZip(fileList, setProgress);
    if (loaded) {
      await onPrepareStorage(loaded);
      getMusicLibraryCount();
    }
  };

  // Tracklist Json
  const onLoadFileJson = async (
    file: File,
    tracklistDrive: boolean = false
  ) => {
    if (!file) {
      return;
    }

    if (file?.type === "application/json") {
      setProgress({ progress: 0, title: "กำลังอ่านไฟล์...", show: true });
      const saved = await jsonTracklistToDatabase(
        file,
        tracklistDrive,
        setProgress
      );

      if (saved) {
        setProgress({
          progress: 100,
          title: "บันทึกรายชื่อเพลงสำเร็จ",
          show: true,
        });
        // setTracklistFile(file);
        setTracklist(saved);
        setMusicFilename(file?.name);
      } else {
        setProgress({
          progress: 0,
          title: "เกิดข้อผิดพลาด",
          show: true,
          error: "การบันทึกลงฐานข้อมูลรายชื่อเพลงไม่สำเร็จ",
        });
      }
      getTracklistCount();
      return true;
    }
    setProgress({
      progress: 0,
      title: "ดาวน์โหลดไม่สำเร็จ",
      show: true,
      error: "File Type ไม่ถูกต้อง",
    });
    return false;
  };

  const onRemoveFileJson = async () => {
    removeTracklist();
    setMusicFilename(undefined);
  };

  const bufferFileToDisplay = async (_: File, filelist: FileList) => {
    const readed = await readSong(filelist);
    setListCreateSong(readed);
  };

  // Drive Modal
  const onAddUrlDrvie = async (value: string) => {
    try {
      if (!value) {
        setProgress({
          progress: 0,
          title: "เกิดข้อผิดพลาด",
          show: true,
          error: "ไม่มี Google Url",
        });
        setLocalDriveUrl("");
        setLocalDriveTested(false);
        return false;
      }
      setProgress({
        progress: 0,
        title: "กำลังเชื่อมต่อ",
        show: true,
        loading: true,
      });
      const res = await testUrl(value);
      if (res) {
        setProgress({
          progress: 100,
          title: "เชื่อมต่อสำเร็จ",
          show: true,
        });
        setLocalDriveTested(true);
        setLocalDriveUrl(value);
        return true;
      } else {
        setProgress({
          progress: 0,
          title: "เชื่อมต่อไม่สำเร็จ",
          show: true,
          error: "ไม่สามารถระบุ Google Apps script",
        });
        setLocalDriveUrl("");
        setLocalDriveTested(false);
        return false;
      }
    } catch (error) {
      setProgress({
        progress: 0,
        title: "เกิดข้อผิดพลาด",
        show: true,
        error: "Error uploading file: " + JSON.stringify(error),
      });
      setLocalDriveUrl("");
      setLocalDriveTested(false);
      return false;
    }
  };

  const onAddTrackListDrive = async (
    value: string,
    tracklistDrive: boolean = false
  ) => {
    setProgress({
      progress: 0,
      title: "กำลังดาวน์โหลด...",
      show: true,
      loading: true,
    });
    return fetch(value)
      .then(async (response) => {
        let file: File | undefined = undefined;
        if (response.ok == true) {
          const fileBlob = await response.blob();
          file = new File([fileBlob], "song.json", {
            type: fileBlob.type,
          });
        }

        if (file) {
          await onLoadFileJson(file, tracklistDrive);
          setLocalTracklistDriveTested(value);
          return true;
        }
        setProgress({
          progress: 0,
          title: "ดาวน์โหลดไม่สำเร็จ",
          show: true,
          error: "ไม่สามารถติดต่อกับ Server",
        });
        return false;
      })
      .catch((error) => {
        setProgress({
          progress: 0,
          title: "ดาวน์โหลดไม่สำเร็จ",
          show: true,
          error: JSON.stringify(error),
        });
        return false;
      });
  };

  const onSystemChange = (value: string) => {
    if (value === "on") {
      setConfig({ system: { drive: true } });
    } else {
      setConfig({ system: { drive: true } });
    }
  };

  // Custom Add Song
  const onAddSong = async (files: SongFiltsEncodeAndDecode[]) => {
    setProgress({
      progress: 0,
      title: "กำลังเตรียมไฟล์...",
      show: true,
      loading: true,
    });
    try {
      if (files.length > 0) {
        setProgress({
          progress: 0,
          title: "Compressing files...",
          show: true,
          loading: true,
        });
        const tracklist = await createSongZip(files);
        setProgress({
          progress: 50,
          title: "กำลังเพิ่มลงฐานข้อมูล",
          show: true,
          loading: true,
        });
        if (tracklist) {
          const added = await addTracklistsToDatabase(tracklist);
          if (added) {
            setProgress({ progress: 100, title: "สำเร็จ", show: true });
            addTracklist(tracklist);
            return true;
          }
          setProgress({
            progress: 0,
            title: "เกิดข้อผิดพลาด",
            show: true,
            error: "ไม่สามารถเพิ่มลงฐานข้อมูล",
          });
          return false;
        }
        setProgress({
          progress: 0,
          title: "เกิดข้อผิดพลาด",
          show: true,
          error: "ไม่ะบ",
        });
        return false;
      }
      setProgress({
        progress: 0,
        title: "เกิดข้อผิดพลาด",
        show: true,
        error: "ไม่สามารถอ่านไฟล์บีบอัด",
      });
      return false;
    } catch (error) {
      return false;
    }
  };

  useEffect(() => {
    getTracklistCount();
    getMusicLibraryCount();
  }, []);

  return (
    <>
      <ProcessingModal
        process={progress}
        onClose={() => {
          setProgress({ show: false });
        }}
      ></ProcessingModal>
      <Tabs
        onTabChange={() => {
          setListCreateSong([]);
        }}
        tabs={[
          {
            icon: <PiMusicNotesPlusBold></PiMusicNotesPlusBold>,
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
            icon: <SiGoogledrive></SiGoogledrive>,
            label: "เพิ่มจาก Drive",
            content: (
              <AddFromDrive
                onSystemChange={onSystemChange}
                onAddTrackListDrive={(value) =>
                  onAddTrackListDrive(value, true)
                }
                onAddUrlDrvie={onAddUrlDrvie}
              />
            ),
          },
          {
            icon: <TbMicrophone2></TbMicrophone2>,
            label: "เพิ่มจาก Extreme",
            content: (
              <AddFormKaraokeExtreme
                musicLibraryCount={musicLibraryCount}
                tracklistCount={tracklistCount}
                onAddFileTracklist={onLoadFileJson}
                onRemoveFileTracklist={onRemoveFileJson}
                filenameTracklist={musicFilename}
                filename={filename}
                onAddFile={onLoadFileZip}
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
    </>
  );
};

export default AppendSongModal;
