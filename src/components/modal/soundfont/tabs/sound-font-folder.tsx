import Button from "@/components/common/button/button";
import Label from "@/components/common/display/label";
import UpdateFile from "@/components/common/input-data/upload";
import TableList from "@/components/common/table/table-list";
import React, { FC, ReactNode, useEffect, useState } from "react";
import { IAlertCommon } from "@/components/common/alert/types/alert.type";
import { SoundSystemMode } from "@/features/config/types/config.type";
import { SoundfontPlayerManager } from "@/utils/indexedDB/db/player/table";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { FaFolder } from "react-icons/fa";
import { FaCircleCheck } from "react-icons/fa6";
import { ImFilePlay } from "react-icons/im";
import { IoMdAddCircle, IoMdWifi } from "react-icons/io";
import { TbMusicPlus } from "react-icons/tb";
import {
  MdNetworkCell,
  MdNetworkLocked,
  MdNetworkWifi,
  MdOutlineNetworkWifi,
  MdOutlineSettingsBackupRestore,
} from "react-icons/md";
import { DEFAULT_SOUND_FONT, remoteHost } from "@/config/value";
import { ISoundfontPlayer } from "@/utils/indexedDB/db/player/types";
import useConfigStore from "@/features/config/config-store";
import { usePeerHostStore } from "@/features/remote/store/peer-js-store";
import { useQRCode } from "next-qrcode";
import { BiUpload } from "react-icons/bi";
import { GrDocumentSound } from "react-icons/gr";

interface SoundfontFolderProps extends IAlertCommon {
  loading: boolean;
  soundFontStorage: ListItem<ISoundfontPlayer>[];
  soundFontExtreme: ListItem<ISoundfontPlayer>[];
  selected?: string;
  from?: SoundSystemMode;
  setLoading: (isLoad: boolean) => void;
  getSoundFontList: () => Promise<ListItem<ISoundfontPlayer>[]>;
  updateSoundFont: (idOrFilename: string, from: SoundSystemMode) => void;
  removeSF2Local?: (id: ISoundfontPlayer, index: number) => void;
  onClickDefault?: () => void;
}

const soundfontDb = new SoundfontPlayerManager();

const SoundfontUpload: FC<{
  setLoading: (isLoad: boolean) => void;
  onUploadComplete: () => Promise<void>;
}> = ({ setLoading, onUploadComplete }) => (
  <div className="space-y-1">
    <Label>เพิ่ม Soundfont</Label>
    <UpdateFile
      accept=".sf2"
      className="border border-blue-500 p-3 rounded-md hover:bg-gray-50 duration-300"
      onSelectFile={async (file) => {
        setLoading(true);
        await soundfontDb.add({ file, createdAt: new Date() });
        await onUploadComplete();
        setLoading(false);
      }}
    >
      <span className="w-full text-sm flex items-center gap-2">
        <TbMusicPlus className="text-blue-500" />
        <span>อัปโหลดไฟล์</span>
        <Label>ไม่เกิน 2 Gb.</Label>
      </span>
    </UpdateFile>
  </div>
);
interface CurrentlyPlayingProps {
  loading: boolean;
  selected: string | undefined;
  from?: SoundSystemMode;
  onClickDefault?: () => void;
  addButton?: React.ReactNode;
}

const CurrentlyPlaying: FC<CurrentlyPlayingProps> = ({
  loading,
  selected,
  from,
  onClickDefault,
  addButton,
}) => {
  const getSourceLabel = (): ReactNode => {
    let sourceText = "";
    switch (from) {
      case "DATABASE_FILE_SYSTEM":
        sourceText = "(จากในเครื่อง)";
        break;
      case "EXTREME_FILE_SYSTEM":
        sourceText = "(จาก Extreme)";
        break;
      default:
        return null;
    }

    return <span className="text-xs text-gray-500">{sourceText}</span>;
  };

  return (
    <div className="space-y-1 ">
      <Label>Soundfont ที่กำลังเล่น</Label>
      <div className="flex flex-row lg:flex-col gap-2">
        <div className="relative w-full ">
          {!loading && (
            <div className="absolute -right-1 -top-1">
              <FaCircleCheck className="text-lg text-green-500" />
            </div>
          )}
          <div className="bg-gray-100 shadow-sm flex flex-col items-center gap-1 p-4 px-4 rounded-md">
            <div>
              {loading ? (
                <AiOutlineLoading3Quarters className="animate-spin text-4xl" />
              ) : (
                <GrDocumentSound className="text-4xl" />
              )}
            </div>
            <div className="text-center">
              <div className="text-sm text-wrap break-all line-clamp-1">
                {selected ?? DEFAULT_SOUND_FONT}
              </div>
              {getSourceLabel()}
            </div>
          </div>
        </div>
        <div className="w-[50%] lg:w-full space-y-1">
          <Button
            disabled={DEFAULT_SOUND_FONT === selected}
            className="w-full h-8 lg:h-10"
            iconPosition="right"
            onClick={onClickDefault}
            color="gray"
            icon={
              <MdOutlineSettingsBackupRestore></MdOutlineSettingsBackupRestore>
            }
          >
            ค่าเริ่มต้น
          </Button>

          {addButton}
        </div>
      </div>
    </div>
  );
};

interface SoundfontListViewProps {
  title: string;
  list: ListItem<ISoundfontPlayer>[];
  loading: boolean;
  onItemSelect: (
    fileName: string,
    index: number,
    option: ListItem<ISoundfontPlayer>
  ) => void;
  onItemDelete?: (value: ISoundfontPlayer, index: number) => void;
  isSelected: (fileName: string) => boolean;
  from?: SoundSystemMode;
}

const SoundfontListView: FC<SoundfontListViewProps> = ({
  title,
  list,
  loading,
  onItemSelect,
  onItemDelete,
  isSelected,
  from,
}) => {
  const renderActionButtonIcon = (fileName: string): ReactNode => {
    if (loading) {
      return <AiOutlineLoading3Quarters className="animate-spin" />;
    }
    if (isSelected(fileName)) {
      return <FaCircleCheck className="text-green-500" />;
    }
    return <IoMdAddCircle />;
  };

  return (
    <div className="flex flex-col gap-1 h-full w-full overflow-auto">
      <Label>
        <FaFolder className="inline-block mb-1" /> <span>{title}</span>
      </Label>
      <TableList<ISoundfontPlayer>
        listKey={`id-${from}`}
        hoverFocus={false}
        list={list}
        deleteItem={!!onItemDelete}
        onDeleteItem={onItemDelete}
        itemAction={(item: ISoundfontPlayer, index: number, option) => (
          <Button
            padding=""
            className="w-7 h-7"
            disabled={loading}
            onClick={() => onItemSelect(item.file.name, index, option)}
            color="default"
            blur={false}
            icon={renderActionButtonIcon(
              from === "EXTREME_FILE_SYSTEM" ? item.file.name : `${item.id}`
            )}
          />
        )}
      />
    </div>
  );
};

interface FileDownload {
  id: string;
  fileName: string;
  progress: number;
}

const SoundfontFolder: FC<SoundfontFolderProps> = ({
  loading,
  selected,
  from,
  soundFontStorage,
  soundFontExtreme,
  setLoading,
  getSoundFontList,
  removeSF2Local,
  updateSoundFont,
  onClickDefault,
}) => {
  const {
    initializePeer,
    peers,
    disconnect,
    setOnFileProgress,
    onFileProgress,
  } = usePeerHostStore();

  const [fileTransfersLoading, setFileTransfersLoading] =
    useState<boolean>(false);
  const config = useConfigStore((state) => state.config);
  const { Canvas } = useQRCode();

  const [hostUrl, setHostUrl] = useState<string>();
  const [hostId, setHostId] = useState<string>();
  const fullRemoteUrl =
    hostUrl && hostId ? `${hostUrl}/fileTransfers/${hostId}` : "";

  const [downloads, setDownloads] = useState<Record<string, FileDownload>>({});

  const onOpenPeer = async () => {
    setFileTransfersLoading(true);
    try {
      const peerId = await initializePeer("SUPER");
      setHostId(peerId);
    } catch (error) {
      console.error("Failed to initialize peer:", error);
    } finally {
      setFileTransfersLoading(false);
    }
  };

  useEffect(() => {
    if (peers.SUPER?.id) {
      setHostId(peers.SUPER.id);
    }
    if (typeof window !== "undefined") {
      setHostUrl(remoteHost);
    }
  }, [peers.SUPER]);
  useEffect(() => {
    if (setOnFileProgress) {
      // อัปเดต Callback ให้รับ fileBlob (เป็น optional)
      setOnFileProgress((transferId, progress, fileName, fileBlob) => {
        setDownloads((prevDownloads) => ({
          ...prevDownloads,
          [transferId]: {
            id: transferId,
            fileName: fileName,
            progress: progress,
          },
        }));

        if (progress === 100 && fileBlob) {
          console.log(`File ${fileName} received. Saving to DB...`);

          soundfontDb
            .add({
              file: new File([fileBlob], fileName),
            })
            .then((data) => {
              getSoundFontList();
            });
        }
      });
    }
  }, [setOnFileProgress, getSoundFontList]);

  useEffect(() => {
    return () => {
      if (usePeerHostStore.getState().peers.SUPER) {
        disconnect("SUPER");
      }
    };
  }, [disconnect]);

  return (
    <div className="flex flex-col lg:flex-row gap-4 w-full h-full relative">
      <div className="w-full lg:w-1/4 flex flex-col justify-between gap-4">
        <div className="space-y-2">
          <SoundfontUpload
            setLoading={setLoading}
            onUploadComplete={async () => {
              getSoundFontList();
            }}
          />
          <CurrentlyPlaying
            onClickDefault={onClickDefault}
            loading={loading}
            selected={selected}
            from={from}
            addButton={
              <>
                <Button
                  disabled={!!fullRemoteUrl || fileTransfersLoading}
                  className="w-full h-8 lg:h-10"
                  icon={
                    fileTransfersLoading ? (
                      <AiOutlineLoading3Quarters className="animate-spin"></AiOutlineLoading3Quarters>
                    ) : (
                      <IoMdWifi></IoMdWifi>
                    )
                  }
                  iconPosition="right"
                  onClick={onOpenPeer}
                  color="blue"
                >
                  รับไฟล์
                </Button>
              </>
            }
          />
        </div>
        {fullRemoteUrl && (
          <div className="p-4 border rounded-lg bg-gray-50 space-y-4">
            <Label>Wifi File Transfer</Label>
            <div className="flex flex-row gap-2 items-center">
              <a href={fullRemoteUrl} target="_blank" rel="noopener noreferrer">
                <Canvas
                  text={fullRemoteUrl}
                  options={{
                    errorCorrectionLevel: "M",
                    margin: 3,
                    scale: 4,
                    width: 100,
                  }}
                />
              </a>
              <span className="text-xs text-gray-400 mt-1">
                Scan สำหรับส่งไฟล์ .sf2 เท่านั้น (กรณีใช้ส่งให้ทีวี หรือ IPhone
                ที่ไม่สามารถส่งไฟล์ผ่าน USB ได้) ความเร็วขึ้นอยู่กัน Internet
                ของคุณ
              </span>
            </div>
            {/* --- ส่วนแสดง Progress --- */}
            <div className="space-y-2 pt-2 border-t">
              <h3 className="text-sm font-semibold text-gray-600">
                ไฟล์ที่กำลังรับ:
              </h3>
              {Object.keys(downloads).length === 0 ? (
                <p className="text-xs text-gray-400">ยังไม่มีไฟล์...</p>
              ) : (
                <div className="space-y-3">
                  {Object.values(downloads).map((file) => (
                    <div key={file.id}>
                      <div className="flex justify-between items-center text-xs mb-1">
                        <span className="font-medium text-gray-700 truncate pr-2">
                          {file.fileName}
                        </span>
                        <span
                          className={`font-semibold ${
                            file.progress === 100
                              ? "text-green-600"
                              : "text-blue-600"
                          }`}
                        >
                          {file.progress}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full transition-all duration-300 ease-in-out ${
                            file.progress === 100
                              ? "bg-green-500"
                              : "bg-blue-500"
                          }`}
                          style={{ width: `${file.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div
        className={`grid ${
          config?.system?.soundMode === "EXTREME_FILE_SYSTEM"
            ? "lg:grid-cols-2"
            : "grid-cols-1"
        } w-full lg:w-9/12 gap-4`}
      >
        <SoundfontListView
          title="โฟลเดอร์ Soundfont"
          list={soundFontStorage}
          loading={loading}
          from="DATABASE_FILE_SYSTEM"
          onItemSelect={(fileName: any, index: any, option: any) => {
            if (option.value.id) {
              updateSoundFont(String(option.value.id), "DATABASE_FILE_SYSTEM");
            }
          }}
          onItemDelete={removeSF2Local}
          isSelected={(id: string) =>
            selected === id && from === "DATABASE_FILE_SYSTEM"
          }
        />

        {config?.system?.soundMode === "EXTREME_FILE_SYSTEM" && (
          <SoundfontListView
            from="EXTREME_FILE_SYSTEM"
            title="Karaoke Extreme Soundfont"
            list={soundFontExtreme}
            loading={loading}
            onItemSelect={(fileName: any) =>
              updateSoundFont(fileName, "EXTREME_FILE_SYSTEM")
            }
            isSelected={(fileName: string) =>
              selected === fileName && from === "EXTREME_FILE_SYSTEM"
            }
          />
        )}
      </div>
    </div>
  );
};

export default SoundfontFolder;
