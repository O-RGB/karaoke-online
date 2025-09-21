import Button from "@/components/common/button/button";
import Label from "@/components/common/display/label";
import { DEFAULT_SOUND_FONT } from "@/config/value";
import { SoundSystemMode } from "@/features/config/types/config.type";
import { ReactNode } from "react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { FaCircleCheck } from "react-icons/fa6";
import { GrDocumentSound } from "react-icons/gr";
import { MdOutlineSettingsBackupRestore } from "react-icons/md";

interface CurrentlyPlayingProps {
  loading: boolean;
  selected: string | undefined;
  from?: SoundSystemMode;
  onClickDefault?: () => void;
  addButton?: React.ReactNode;
}

export const CurrentlyPlaying: React.FC<CurrentlyPlayingProps> = ({
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
