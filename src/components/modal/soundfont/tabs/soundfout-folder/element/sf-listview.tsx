import Button from "@/components/common/button/button";
import Label from "@/components/common/display/label";
import Tags from "@/components/common/display/tags";
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
  isSelected: (sf: ISoundfontPlayer) => boolean;
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
  const renderActionButtonIcon = (sf: ISoundfontPlayer): ReactNode => {
    if (loading) {
      return <AiOutlineLoading3Quarters className="animate-spin" />;
    }
    if (isSelected(sf)) {
      return <FaCircleCheck className="!text-green-500" />;
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
          <>
            <Button
              disabled={loading}
              onClick={() => onItemSelect(item.file.name, index, option)}
              color="white"
              icon={renderActionButtonIcon(item)}
            />
          </>
        )}
      />
    </div>
  );
};
