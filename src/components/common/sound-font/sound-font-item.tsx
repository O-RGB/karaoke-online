import React from "react";
import { GrDocumentSound } from "react-icons/gr";
import Button from "../button/button";
import { MdDelete } from "react-icons/md";

interface SoundFontItemProps {
  title: string;
  id: string;
  onDelete?: (fileId: string) => void;
}

const SoundFontItem: React.FC<SoundFontItemProps> = ({
  title,
  id,
  onDelete,
}) => {
  const onClickDelete = () => {
    onDelete?.(id);
  };
  return (
    <>
      <div className="flex gap-2 items-center justify-center p-2 bg-white w-full select-none">
        <GrDocumentSound></GrDocumentSound>
        <div className="w-full">{title}</div>
        <Button
          onClick={onClickDelete}
          icon={<MdDelete className="text-white" />}
        ></Button>
      </div>
    </>
  );
};

export default SoundFontItem;
