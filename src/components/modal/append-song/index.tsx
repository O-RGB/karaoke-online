import React, { useEffect, useState } from "react";
import Tabs from "../../common/tabs";
import AddSong from "./tabs/add-song";
import AddFormKaraokeExtreme from "./tabs/add-form-karaoke-extreme";
import { readSong } from "@/lib/karaoke/read";
import {
  addTracklistsToDatabase,
  getAllKeyTracklist,
  getTracklistTest,
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
import { testUrl, useDownloadWithProgress } from "@/lib/fetch/fetch-lib";
import AddFromDrive from "./tabs/add-from-drive";
import {
  getLocalLastUpdated,
  setLocalLastUpdated,
  setLocalTracklistDriveTested,
} from "@/lib/local-storege/local-storage";
import useConfigStore from "@/features/config/config-store";
import useTracklistStore from "@/features/tracklist/tracklist-store";
import { Fetcher } from "@/utils/api/fetch";
import {
  base64ByteToFile,
  base64ToBlob,
  fileToBase64,
} from "@/utils/file/file";
import Modal from "@/components/common/modal";
import TableList from "@/components/common/table/table-list";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { FaCheck } from "react-icons/fa";
import { GrDatabase } from "react-icons/gr";
import AddFromApi from "./tabs/add-from-api";

interface AppendSongModalProps { }

interface FileResponse {
  fileId: string;
  fileName: string;
  base64Data: string;
  contentType: string;
  size: number;
}

const AppendSongModal: React.FC<AppendSongModalProps> = ({ }) => {
  const config = useConfigStore((state) => state.config);
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

  const [addToDrviePasswrod, setDrivePassword] = useState<string>();
  const [updatedModal, setUpdatedModal] = useState<boolean>(false);
  const [updateing, setUploading] = useState<boolean>(false);
  const [updateList, setUpdateList] = useState<ListItem<SearchResult>[]>([]);

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
    setProgress({
      progress: 0,
      title: "กำลัง Extract zip...",
      show: true,
      loading: true,
    });
    const loaded = await extractMusicZip(fileList, setProgress);
    if (loaded) {
      await onPrepareStorage(loaded);
      getMusicLibraryCount();
    }
  };

  // Tracklist Json
  const onLoadFileJson = async (file: File, tracklistStore: TracklistFrom) => {
    if (!file) {
      return;
    }

    if (file?.type === "application/json") {
      setProgress({
        progress: 0,
        title: "กำลังอ่านไฟล์...",
        show: true,
        loading: true,
      });

      const saved = await jsonTracklistToDatabase(
        file,
        tracklistStore,
        setProgress
      );

      if (saved) {
        setProgress({
          progress: 100,
          title: "บันทึกรายชื่อเพลงสำเร็จ",
          show: true,
        });
        console.log("UPLOAD: Tracklist Loaded lenght", saved.length);
        addTracklist(saved);
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
        setConfig({ system: { url: "", urlTested: false } });
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
        setConfig({ system: { url: value, urlTested: true } });
        onAddTrackListDrive(value, "DRIVE_EXTHEME");
        return true;
      } else {
        setProgress({
          progress: 0,
          title: "เชื่อมต่อไม่สำเร็จ",
          show: true,
          error: "ไม่สามารถระบุ Google Apps script",
        });
        setConfig({ system: { url: "", urlTested: false } });

        return false;
      }
    } catch (error) {
      setProgress({
        progress: 0,
        title: "เกิดข้อผิดพลาด",
        show: true,
        error: "Error uploading file: " + JSON.stringify(error),
      });
      setConfig({ system: { url: "", urlTested: false } });

      return false;
    }
  };


  const onAddTrackListDriveCustom2 = async (value: string,
    tracklistStore: TracklistFrom) => {
    const download = await useDownloadWithProgress(value, "tracklist")
    if (download) {
      await onLoadFileJson(download, tracklistStore);
      setLocalTracklistDriveTested(value);
      return true;
    } else {
      return false
    }
  }
  const onAddTrackListFormCom = async (value: File,
    tracklistStore: TracklistFrom) => {
    await onLoadFileJson(value, tracklistStore);
    setLocalTracklistDriveTested("");
    return true
  }

  const onAddTrackListDrive = async (
    value: string,
    tracklistStore: TracklistFrom
  ) => {
    setProgress({
      progress: 0,
      title: "กำลังดาวน์โหลด...",
      show: true,
      loading: true,
    });

    const formdata = new FormData();
    formdata.append("fun", "TRACKLIST");

    try {
      const response = await fetch(value, { body: formdata, method: "POST" });
      const data = await response.json();

      const fileResponse: FileResponse | undefined = data.files?.length > 0 ? data.files[0] : undefined;

      if (fileResponse && fileResponse.base64Data) {
        const blob = base64ToBlob(fileResponse.base64Data, fileResponse.contentType);
        const file = new File([blob], "tracklist.json", { type: blob.type });

        if (file) {
          await onLoadFileJson(file, tracklistStore);
          setLocalTracklistDriveTested(value);
          return true;
        }
      }

      setProgress({
        progress: 0,
        title: "ดาวน์โหลดไม่สำเร็จ",
        show: true,
        error: "ไม่สามารถติดต่อกับ Server",
      });
      return false;
    } catch (error) {
      setProgress({
        progress: 0,
        title: "ดาวน์โหลดไม่สำเร็จ",
        show: true,
        error: JSON.stringify(error),
      });
      return false;
    }
  };

  const onSystemChange = async (value: string) => {
    setProgress({
      progress: 0,
      title: "กำลังเปลี่ยนฐานข้อมูล...",
      show: true,
      loading: true,
    });
    if (value === "on") {
      try {
        setTracklist([]);
        const tl = await getTracklistTest(["DRIVE", "DRIVE_EXTHEME"]);
        setTracklist(tl.results);
        setConfig({ system: { drive: true, uploadToDrive: false } });
        setProgress({
          progress: 100,
          title: "เปลี่ยนฐานข้อมูลเป็น Drive",
          show: true,
        });
      } catch (error) {
        setProgress({
          progress: 0,
          title: "เกิดข้อผิดพลาด",
          show: true,
          error: JSON.stringify(error),
        });
        setConfig({ system: { drive: false } });
      }
    } else {
      try {
        const tl = await getTracklistTest(["CUSTOM", "EXTHEME"]);
        setTracklist(tl.results);
        setConfig({ system: { drive: false, uploadToDrive: false } });
        setProgress({
          progress: 100,
          title: "เปลี่ยนฐานข้อมูลเป็น System",
          show: true,
        });
      } catch (error) {
        setProgress({
          progress: 0,
          title: "เกิดข้อผิดพลาด",
          show: true,
          error: JSON.stringify(error),
        });
        setConfig({ system: { drive: false } });
      }
    }
  };

  const driveCheckForUpdate = async (showUpdatedList: boolean = false) => {
    setUploading(true);
    setUpdatedModal(true);
    const url = config.system?.url;
    if (!url) {
      return;
    }
    const sheetsIndex = getLocalLastUpdated() ?? "0";
    const checkUpdate = await Fetcher(
      url,
      {
        lastIndex: sheetsIndex,
      },
      "CHECK_UPDATE"
    );
    const { update, lastRow, data } = checkUpdate;
    if (!update) {
      setLocalLastUpdated(lastRow);
      const searchObj: SearchResult[] = data.map(
        (data: any) =>
        ({
          id: data[0],
          name: data[1],
          artist: data[2],
          type: data[3],
          fileId: data[4],
          from: data[5],
        } as SearchResult)
      );

      const driveAdded = await addTracklistsToDatabase(searchObj, "DRIVE");
      addTracklist(searchObj);

      if (showUpdatedList) {
        const tfefg: ListItem[] = searchObj.map((data: SearchResult) => ({
          row: (
            <span className="flex gap-2 items-center">
              <span>{data.name}</span>
              <span>{data.artist}</span>
            </span>
          ),
          value: data.fileId,
        }));
        setUpdateList(tfefg);
      }
    }

    setUploading(false);
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
        const tracklist = await createSongZip(files, "CUSTOM");
        setProgress({
          progress: 50,
          title: "กำลังเพิ่มลงฐานข้อมูล",
          show: true,
          loading: true,
        });
        if (tracklist?.tracklist) {
          const system = config.system;
          if (
            system?.uploadToDrive &&
            system.drive &&
            system.url &&
            tracklist.superZip
          ) {
            setProgress({
              progress: 75,
              title: "กำลังเพิ่มไปที่ Drive",
              show: true,
              loading: true,
            });
            const fileBase64 = await fileToBase64(tracklist.superZip);
            const response = await Fetcher(
              system.url,
              {
                base64: fileBase64,
                tracklist: tracklist.tracklist,
                password: addToDrviePasswrod,
              },
              "SAVE"
            );

            if (response.fileName) {
              setProgress({
                progress: 80,
                title: "เพิ่มไปที่ Drive แล้ว",
                show: true,
                loading: true,
              });

              setProgress({
                progress: 90,
                title: "กำลังเพิ่มฐานข้อมูล",
                show: true,
                loading: true,
              });

              await driveCheckForUpdate();

              setProgress({
                progress: 95,
                title: "เพิ่มฐานข้อมูลสำเร็จ",
                show: true,
                loading: true,
              });
            } else if (response.error) {
              setProgress({
                progress: 0,
                title: "ผิดพลาด",
                error: response.error,
                show: true,
              });
              return false;
            }
          }

          const added = await addTracklistsToDatabase(
            tracklist.tracklist,
            "CUSTOM"
          );

          if (added) {
            setProgress({ progress: 100, title: "สำเร็จ", show: true });
            if (system?.drive === false) {
              addTracklist(tracklist.tracklist);
            }

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
      <Modal
        width={500}
        title="รายการอัปเดต"
        isOpen={updatedModal}
        closable={!updateing}
        onClose={() => {
          setUpdateList([]);
          setUpdatedModal(false);
        }}
      >
        <div className="h-full">
          {updateing ? (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2">
              <AiOutlineLoading3Quarters className="animate-spin text-lg text-gray-500"></AiOutlineLoading3Quarters>
              กำลังตรวจสอบ
            </div>
          ) : (
            <>
              {updateList.length === 0 ? (
                <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                  <FaCheck className="text-lg text-gray-500"></FaCheck>
                  เพลงของคุณเป็นเวอร์ชันล่าสุดแล้ว
                </div>
              ) : (
                <TableList
                  listKey="updated-data"
                  list={updateList}
                  deleteItem={false}
                ></TableList>
              )}
            </>
          )}
        </div>
      </Modal>
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
                onOpenAddToDrive={setDrivePassword}
              />
            ),
          },
          {
            icon: <GrDatabase></GrDatabase>,
            label: "เพลง API",
            content: <AddFromApi />,
          },
          {
            icon: <SiGoogledrive></SiGoogledrive>,
            label: "เพิ่มจาก Drive",
            content: (
              <AddFromDrive
                onAddTrackListDrive={(v) => onAddTrackListDriveCustom2(v, "DRIVE_EXTHEME")}
                onAddTrackListFormCom={(v) => onAddTrackListFormCom(v, "DRIVE_EXTHEME")}
                driveCheckForUpdate={() => driveCheckForUpdate(true)}
                onSystemChange={onSystemChange}
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
                onAddFileTracklist={(file) => {
                  onLoadFileJson(file, "EXTHEME");
                }}
                onRemoveFileTracklist={onRemoveFileJson}
                filenameTracklist={musicFilename}
                filename={filename}
                onAddFile={onLoadFileZip}
              />
            ),
          },
        ]}
      ></Tabs>
    </>
  );
};

export default AppendSongModal;
