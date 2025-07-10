import Button from "@/components/common/button/button";
import Label from "@/components/common/display/label";
import UpdateFile from "@/components/common/input-data/upload";
import TableList from "@/components/common/table/table-list";
import React, { FC, ReactNode } from "react";
import { IAlertCommon } from "@/components/common/alert/types/alert.type";
import { SoundSystemMode } from "@/features/config/types/config.type";
import { SoundfontPlayerManager } from "@/utils/indexedDB/db/player/table";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { FaFolder } from "react-icons/fa";
import { FaCircleCheck } from "react-icons/fa6";
import { ImFilePlay } from "react-icons/im";
import { IoMdAddCircle } from "react-icons/io";
import { TbMusicPlus } from "react-icons/tb";
import { MdOutlineSettingsBackupRestore } from "react-icons/md";
import { DEFAULT_SOUND_FONT } from "@/config/value";
import { ISoundfontPlayer } from "@/utils/indexedDB/db/player/types";
import useConfigStore from "@/features/config/config-store";

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
            {selected ?? DEFAULT_SOUND_FONT}
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
  const config = useConfigStore((state) => state.config);

  return (
    <div className="flex flex-col lg:flex-row gap-4 w-full h-full relative">
      <div className="w-full lg:w-1/4 flex flex-col gap-4 h-full ">
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
        />
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
          onItemSelect={(fileName, index, option) => {
            if (option.value.id) {
              updateSoundFont(String(option.value.id), "DATABASE_FILE_SYSTEM");
            }
          }}
          onItemDelete={removeSF2Local}
          isSelected={(id) =>
            selected === id && from === "DATABASE_FILE_SYSTEM"
          }
        />

        {config?.system?.soundMode === "EXTREME_FILE_SYSTEM" && (
          <SoundfontListView
            from="EXTREME_FILE_SYSTEM"
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
