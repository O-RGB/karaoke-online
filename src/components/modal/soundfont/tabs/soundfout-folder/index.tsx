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

interface SoundfontFolderProps extends IAlertCommon {
  loading: boolean;
  sfStorage: ListItem<ISoundfontPlayer>[];
  sfExtreme: ListItem<ISoundfontPlayer>[];
  selected?: ISoundfontPlayer;
  setLoading: (isLoad: boolean) => void;
  getSoundFontList: () => Promise<ListItem<ISoundfontPlayer>[]>;
  updateSoundFont: (sf: ISoundfontPlayer, from: SoundSystemMode) => void;
  removeSF2Local?: (sf: ISoundfontPlayer, index: number) => void;
  onClickDefault?: () => void;
}

const SoundfontFolder: FC<SoundfontFolderProps> = ({
  loading,
  selected,
  sfStorage,
  sfExtreme,
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
        }

        if (value.status === "READY_FOR_ASSEMBLY") {
          closeProcessing?.();

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

  useEffect(() => {}, [selected]);

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
          list={sfStorage}
          loading={loading}
          from="DATABASE_FILE_SYSTEM"
          onItemSelect={(
            fileName: string,
            index: number,
            option: ListItem<ISoundfontPlayer>
          ) => {
            updateSoundFont(option.value, "DATABASE_FILE_SYSTEM");
          }}
          onItemDelete={removeSF2Local}
          isSelected={(sf: ISoundfontPlayer) => selected?.keyId === sf.keyId}
        />
        {config?.system?.soundMode === "EXTREME_FILE_SYSTEM" && (
          <SoundfontListView
            from="EXTREME_FILE_SYSTEM"
            title="Karaoke Extreme Soundfont"
            list={sfExtreme}
            loading={loading}
            onItemSelect={(
              fileName: string,
              index: number,
              option: ListItem<ISoundfontPlayer>
            ) => updateSoundFont(option.value, "EXTREME_FILE_SYSTEM")}
            isSelected={(sf: ISoundfontPlayer) => selected?.file.name === sf.file.name}
          />
        )}
      </div>
    </div>
  );
};

export default SoundfontFolder;
