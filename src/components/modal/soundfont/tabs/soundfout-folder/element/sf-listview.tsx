import Button from "@/components/common/button/button";
import Label from "@/components/common/display/label";
import TableList from "@/components/common/table/table-list";
import { SoundSystemMode } from "@/features/config/types/config.type";
import { ISoundfontPlayer } from "@/utils/indexedDB/db/player/types";
import { ReactNode } from "react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { FaFolder } from "react-icons/fa";
import { FaCircleCheck } from "react-icons/fa6";
import { IoMdAddCircle } from "react-icons/io";

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

export const SoundfontListView: React.FC<SoundfontListViewProps> = ({
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
