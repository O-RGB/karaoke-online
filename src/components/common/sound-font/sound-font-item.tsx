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
      <div className="flex gap-2 items-center justify-center  bg-white w-full select-none border p-2 pl-3 rounded-md">
        <GrDocumentSound></GrDocumentSound>
        <div className="w-full">{title}</div>
        <Button
          shadow={false}
          onClick={onClickDelete}
          icon={<MdDelete />}
        ></Button>
      </div>
    </>
  );
};

export default SoundFontItem;
