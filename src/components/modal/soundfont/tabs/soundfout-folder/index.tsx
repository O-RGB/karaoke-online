import Button from "@/components/common/button/button";
import Label from "@/components/common/display/label";
import React, { FC, useEffect, useState } from "react";
import { IAlertCommon } from "@/components/common/alert/types/alert.type";
import { SoundSystemMode } from "@/features/config/types/config.type";
import { SoundfontPlayerManager } from "@/utils/indexedDB/db/player/table";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { remoteHost } from "@/config/value";
import { ISoundfontPlayer } from "@/utils/indexedDB/db/player/types";
import useConfigStore from "@/features/config/config-store";
import { usePeerHostStore } from "@/features/remote/store/peer-js-store";
import { useQRCode } from "next-qrcode";
import { SoundfontUpload } from "./element/upload";
import { CurrentlyPlaying } from "./element/current-playing";
import { SoundfontListView } from "./element/sf-listview";
import { IoMdWifi } from "react-icons/io";

const soundfontDb = new SoundfontPlayerManager();

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

interface FileDownload {
  id: string;
  fileName: string;
  progress: number;
}

interface FileToAssemble {
  id: string;
  fileName: string;
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
  setAlert,
  setProcessing,
  closeProcessing,
  closeAlert,
}) => {
  const { initializePeer, peers, disconnect, setOnFileProgress, assembleFile } =
    usePeerHostStore();

  const [fileTransfersLoading, setFileTransfersLoading] =
    useState<boolean>(false);
  const config = useConfigStore((state) => state.config);
  const { Canvas } = useQRCode();

  const [hostUrl, setHostUrl] = useState<string>();
  const [hostId, setHostId] = useState<string>();
  const fullRemoteUrl =
    hostUrl && hostId ? `${hostUrl}/fileTransfers/${hostId}` : "";

  const [downloads, setDownloads] = useState<Record<string, FileDownload>>({});
  const [pendingAssembly, setPendingAssembly] = useState<FileToAssemble[]>([]);

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
      setOnFileProgress((value) => {
        setDownloads((prevDownloads) => ({
          ...prevDownloads,
          [value.transferId]: {
            id: value.transferId,
            fileName: value.fileName,
            progress: value.progress,
          },
        }));

        if (value.progress < 100 || value.status === "PROCESSING") {
          setProcessing?.({
            title: "กำลังโหลดไฟล์",
            variant: "processing",
            status: {
              progress: value.progress,
              text: `กำลังรับไฟล์: ${value.fileName}`,
            },
          });
        }

        if (value.status === "ERROR" || value.error) {
          closeProcessing?.();
          setAlert?.({
            title: "เกิดข้อผิดพลาด",
            variant: "error",
            description: `${value.error || "ไม่สามารถรับไฟล์ได้"}`,
          });
          setDownloads((prev) => {
            const newDownloads = { ...prev };
            delete newDownloads[value.transferId];
            return newDownloads;
          });
        }

        if (value.status === "READY_FOR_ASSEMBLY") {
          closeProcessing?.();

          setPendingAssembly((prev) => [
            ...prev,
            { id: value.transferId, fileName: value.fileName },
          ]);

          setDownloads((prev) => {
            const newDownloads = { ...prev };
            delete newDownloads[value.transferId];
            return newDownloads;
          });

          setAlert?.({
            title: "ดาวน์โหลดสำเร็จ",
            variant: "info",
            description: `ไฟล์ '${value.fileName}' พร้อมที่จะรวมแล้ว กดปุ่ม 'รวมไฟล์' เพื่อใช้งาน`,
            onOk() {
              closeAlert?.();
              handleAssembleFile(value.transferId, value.fileName);
            },
          });
        }

        if (value.status === "ASSEMBLING") {
          setProcessing?.({
            title: "กำลังประมวลผล",
            variant: "processing",
            status: {
              progress: 100,
              text: "กำลังรวมชิ้นส่วนไฟล์เข้าด้วยกัน...",
            },
          });
        }

        if (value.status === "COMPLETE") {
          getSoundFontList();

          setTimeout(() => {
            setDownloads((prev) => {
              const newDownloads = { ...prev };
              delete newDownloads[value.transferId];
              return newDownloads;
            });
            closeProcessing?.();
            setAlert?.({
              title: "รับไฟล์สำเร็จ!",
              variant: "success",
              description: `ไฟล์ ${value.fileName} ถูกบันทึกแล้ว`,
            });
          }, 1000);
        }
      });
    }
  }, [
    setOnFileProgress,
    getSoundFontList,
    setProcessing,
    closeProcessing,
    setAlert,
  ]);

  const handleAssembleFile = async (transferId: string, fileName: string) => {
    setProcessing?.({
      title: "กำลังรวมไฟล์",
      variant: "processing",
      status: {
        progress: undefined,
        text: `กำลังรวมชิ้นส่วนไฟล์: ${fileName}...`,
      },
    });

    try {
      await assembleFile(transferId);
      setPendingAssembly((prev) => prev.filter((f) => f.id !== transferId));
    } catch (error: any) {
      closeProcessing?.();
      setAlert?.({
        title: "เกิดข้อผิดพลาดในการรวมไฟล์",
        variant: "error",
        description: error.message || "ไม่สามารถรวมไฟล์ได้ กรุณาลองใหม่",
      });
    }
  };

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
              <Button
                className="w-full"
                disabled={!!fullRemoteUrl || fileTransfersLoading}
                icon={
                  fileTransfersLoading ? (
                    <AiOutlineLoading3Quarters className="animate-spin" />
                  ) : (
                    <IoMdWifi />
                  )
                }
                onClick={onOpenPeer}
              >
                รับไฟล์
              </Button>
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
          </div>
        )}

        {/* {pendingAssembly.length > 0 && (
          <div className="p-4 border rounded-lg bg-yellow-50 space-y-3">
            <Label>ไฟล์ที่พร้อมใช้งาน (รอรวมไฟล์)</Label>
            {pendingAssembly.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between gap-2 p-2 bg-white rounded-md border"
              >
                <span className="text-sm truncate" title={file.fileName}>
                  {file.fileName}
                </span>
                <Button
                  color="green"
                  onClick={() => handleAssembleFile(file.id, file.fileName)}
                >
                  รวมไฟล์
                </Button>
              </div>
            ))}
          </div>
        )} */}
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
