import Button from "@/components/common/button/button";
import Label from "@/components/common/label";
import Modal from "@/components/common/modal";
import SongDetail from "@/components/common/song/song-detail";
import React, { useEffect } from "react";
import { FaPlus } from "react-icons/fa";
import { RiDeleteBin5Line } from "react-icons/ri";

interface DuplicateSongModalProps extends Omit<ModalProps, "children"> {
  valid?: ValidSong;
  onAdded?: (valid: ValidSong) => void;
  onRemove?: (valid: ValidSong) => void;
}

const DuplicateSongModal: React.FC<DuplicateSongModalProps> = ({
  valid,
  onAdded,
  onRemove,
  ...props
}) => {
  useEffect(() => {}, [valid]);

  return (
    <Modal {...props} overFlow="overflow-auto">
      <div className="grid grid-cols-4  gap-3 md:gap-4 h-full md:py-2">
        <div className="col-span-4 md:col-span-2 order-last md:order-first  h-full flex flex-col">
          <div className="flex items-center w-full bg-gray-200 p-2 rounded-t-md">
            <Label className="text-gray-700 font-bold">เพลงใหม่</Label>
          </div>
          <div className="flex flex-col border-b border-x border-gray-200 rounded-b-md gap-2 h-full p-2">
            {valid && (
              <SongDetail
                tagsClassName={`${
                  valid.isSame.length > 0 ? "!bg-yellow-500" : ""
                }`}
                song={valid.item}
              ></SongDetail>
            )}
            <div className="flex flex-col h-full w-full justify-end gap-2">
              <Button
                blur={false}
                onClick={() => (valid ? onAdded?.(valid) : undefined)}
                color="blue"
                className="text-white w-full"
                icon={<FaPlus></FaPlus>}
                iconPosition="left"
              >
                เพิ่มต่อไป
              </Button>
              <Button
                onClick={() => (valid ? onRemove?.(valid) : undefined)}
                blur={false}
                color="red"
                className="text-white w-full"
                icon={<RiDeleteBin5Line></RiDeleteBin5Line>}
                iconPosition="left"
              >
                ลบออก
              </Button>
            </div>
          </div>
        </div>
        <div className="col-span-4 md:col-span-2  h-full flex flex-col">
          <div className="flex items-center w-full bg-gray-200 p-2 rounded-t-md">
            <Label className="text-gray-700 font-bold">เพลงที่มีอยู่แล้ว</Label>
          </div>
          <div className="flex flex-col border-b border-x border-gray-200 rounded-b-md gap-2 h-full p-2">
            {valid &&
              valid.isSame.map((data) => <SongDetail song={data}></SongDetail>)}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default DuplicateSongModal;
