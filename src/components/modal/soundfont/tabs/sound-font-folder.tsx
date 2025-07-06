import Button from "@/components/common/button/button";
import Label from "@/components/common/display/label";
import UpdateFile from "@/components/common/input-data/upload";
import TableList from "@/components/common/table/table-list";
import React, { FC, ReactNode, useEffect } from "react";
import { IAlertCommon } from "@/components/common/alert/types/alert.type";
import { SoundSystemMode } from "@/features/config/types/config.type";
import { BaseSynthEngine } from "@/features/engine/types/synth.type";
import { SoundfontPlayerManager } from "@/utils/indexedDB/db/player/table";
import { AiOutlineLoading3Quarters, AiOutlineRollback } from "react-icons/ai";
import { FaFolder } from "react-icons/fa";
import { FaCircleCheck } from "react-icons/fa6";
import { ImFilePlay } from "react-icons/im";
import { IoMdAddCircle } from "react-icons/io";
import { TbMusicPlus } from "react-icons/tb";
import useSongsStore from "@/features/songs/store/songs.store";
import { MdOutlineSettingsBackupRestore } from "react-icons/md";
import { DEFAULT_SOUND_FONT } from "@/config/value";

type SoundFontListItem = ListItem<File>;

interface SoundfontFolderProps extends IAlertCommon {
  loading: boolean;
  engine: BaseSynthEngine | undefined;
  soundFontStorage: SoundFontListItem[];
  soundFontExtreme: SoundFontListItem[];
  selected?: string;
  from?: SoundSystemMode;
  setLoading: (isLoad: boolean) => void;
  getSoundFontList: () => Promise<SoundFontListItem[]>;
  updateSoundFont: (idOrFilename: string, from: SoundSystemMode) => void;
  removeSF2Local: (id: number) => void;
  onClickDefault?: () => void;
}

const soundfontDb = new SoundfontPlayerManager();

const SoundfontUpload: FC<{
  engine: BaseSynthEngine | undefined;
  setLoading: (isLoad: boolean) => void;
  onUploadComplete: () => Promise<void>;
}> = ({ engine, setLoading, onUploadComplete }) => (
  <div className="space-y-1">
    <Label>เพิ่ม Soundfont</Label>
    <UpdateFile
      accept=".sf2"
      className="border border-blue-500 p-3 rounded-md hover:bg-gray-50 duration-300"
      onSelectFile={async (file) => {
        if (engine) {
          setLoading(true);
          await soundfontDb.add({ file, createdAt: new Date() });
          await onUploadComplete();
          setLoading(false);
        }
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
}

const CurrentlyPlaying: FC<CurrentlyPlayingProps> = ({
  loading,
  selected,
  from,
  onClickDefault,
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

    return <span className="text-xs text-gray-500 mt-1">{sourceText}</span>;
  };

  return (
    <div className="space-y-1">
      <Label>Soundfont ที่กำลังเล่น</Label>
      <div className="relative w-full">
        {!loading && (
          <div className="absolute -right-1 -top-1">
            <FaCircleCheck className="text-lg text-green-500" />
          </div>
        )}
        <div className="border flex flex-col items-center gap-1 p-2 px-4 rounded-md">
          <div>
            {loading ? (
              <AiOutlineLoading3Quarters className="animate-spin text-4xl" />
            ) : (
              <ImFilePlay className="text-4xl" />
            )}
          </div>
          <div className="text-sm text-wrap break-all text-center">
            {selected ?? "ยังไม่ได้เลือก"}
          </div>

          {getSourceLabel()}
        </div>
      </div>
      {DEFAULT_SOUND_FONT !== selected && (
        <Button
          className="w-full h-10"
          iconPosition="left"
          onClick={onClickDefault}
          color="blue"
          icon={
            <MdOutlineSettingsBackupRestore></MdOutlineSettingsBackupRestore>
          }
        >
          ค่าเริ่มต้น
        </Button>
      )}
    </div>
  );
};

interface SoundfontListViewProps {
  title: string;
  list: SoundFontListItem[];
  loading: boolean;
  onItemSelect: (fileName: string) => void;
  onItemDelete?: (id: number) => void;
  isSelected: (fileName: string) => boolean;
}

const SoundfontListView: FC<SoundfontListViewProps> = ({
  title,
  list,
  loading,
  onItemSelect,
  onItemDelete,
  isSelected,
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
    <div className="flex flex-col gap-1 h-full overflow-auto">
      <Label>
        <FaFolder className="inline-block mb-1" /> <span>{title}</span>
      </Label>
      <TableList
        listKey="id"
        hoverFocus={false}
        list={list}
        deleteItem={!!onItemDelete}
        onDeleteItem={onItemDelete}
        itemAction={(item: File) => (
          <Button
            padding=""
            className="w-7 h-7"
            disabled={loading}
            onClick={() => onItemSelect(item.name)}
            color="default"
            blur={false}
            icon={renderActionButtonIcon(item.name)}
          />
        )}
      />
    </div>
  );
};

const SoundfontFolder: FC<SoundfontFolderProps> = ({
  loading,
  engine,
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
  const soundManager = useSongsStore((state) => state.songsManager);
  return (
    <div className="flex flex-col lg:flex-row gap-4 w-full h-full relative">
      <div className="w-full lg:w-1/4 flex flex-col gap-4 h-full ">
        <SoundfontUpload
          engine={engine}
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
        />
      </div>

      <div className="w-full lg:w-9/12 grid lg:grid-cols-2 gap-4">
        <SoundfontListView
          title="โฟลเดอร์ Soundfont"
          list={soundFontStorage}
          loading={loading}
          onItemSelect={(fileName) =>
            updateSoundFont(fileName, "DATABASE_FILE_SYSTEM")
          }
          onItemDelete={removeSF2Local}
          isSelected={(fileName) =>
            selected === fileName && from === "DATABASE_FILE_SYSTEM"
          }
        />

        {soundManager?.currentMode === "EXTREME_FILE_SYSTEM" && (
          <SoundfontListView
            title="Karaoke Extreme Soundfont"
            list={soundFontExtreme}
            loading={loading}
            onItemSelect={(fileName) =>
              updateSoundFont(fileName, "EXTREME_FILE_SYSTEM")
            }
            isSelected={(fileName) =>
              selected === fileName && from === "EXTREME_FILE_SYSTEM"
            }
          />
        )}
      </div>
    </div>
  );
};

export default SoundfontFolder;
