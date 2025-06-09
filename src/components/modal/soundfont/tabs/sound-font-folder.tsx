import Button from "@/components/common/button/button";
import Label from "@/components/common/display/label";
import UpdateFile from "@/components/common/input-data/upload";
import TableList from "@/components/common/table/table-list";
import { BaseSynthEngine } from "@/features/engine/types/synth.type";
import { SoundfontPlayerManager } from "@/utils/indexedDB/db/player/table";

import { ISoundfontPlayer } from "@/utils/indexedDB/db/player/types";
import React from "react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { FaCircleCheck } from "react-icons/fa6";
import { ImFilePlay } from "react-icons/im";
import { IoMdAddCircle } from "react-icons/io";
import { TbMusicPlus } from "react-icons/tb";

interface SoundfontFolderProps {
  loading: boolean;
  engine: BaseSynthEngine | undefined;
  soundFontStorage: ListItem<ISoundfontPlayer>[];
  setLoading: (isLoad: boolean) => void;
  getSoundFontList: () => Promise<ListItem<ISoundfontPlayer>[]>;
  updateSoundFont: (file: File) => void;
  removeSF2Local: (id: number) => void;
}
const soundfont = new SoundfontPlayerManager();

const SoundfontFolder: React.FC<SoundfontFolderProps> = ({
  loading,
  engine,
  soundFontStorage,
  setLoading,
  getSoundFontList,
  removeSF2Local,
  updateSoundFont,
}) => {
  return (
    <div className="flex flex-col lg:flex-row gap-4 h-full w-full">
      <div className="w-full lg:w-1/4 flex flex-col gap-2 h-fit lg:h-full">
        <div className="flex flex-col gap-1">
          <Label>เพิ่ม Soundfont</Label>
          <UpdateFile
            accept=".sf2"
            className="border border-blue-500 p-3 rounded-md hover:bg-gray-50 duration-300"
            onSelectFile={async (file) => {
              if (engine) {
                setLoading(true);
                await soundfont.add({ file, createdAt: new Date() });
                await getSoundFontList();
                setLoading(false);
              }
            }}
          >
            <span className="w-full  text-sm flex items-center gap-2">
              <span>
                <TbMusicPlus className="text-blue-500"></TbMusicPlus>
              </span>
              <span>อัปโหลดไฟล์</span>
              <Label>ไม่เกิน 2 Gb.</Label>
            </span>
          </UpdateFile>
        </div>
        <div className="flex flex-col gap-1 ">
          <Label>Soundfont ที่กำลังเล่น</Label>
          <div className="relative w-fit lg:w-full">
            <div className="absolute -right-1 -top-1">
              <FaCircleCheck className="text-lg text-green-500"></FaCircleCheck>
            </div>
            <div className=" border flex gap-2 flex-col items-center p-2 px-4 rounded-md ">
              <div>
                {loading ? (
                  <AiOutlineLoading3Quarters className="animate-spin text-4xl"></AiOutlineLoading3Quarters>
                ) : (
                  <ImFilePlay className="text-4xl"></ImFilePlay>
                )}
              </div>
              <div className="text-sm text-wrap break-all">
                {engine?.soundfontName}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-9/12 flex flex-col gap-1 h-full">
        <div className="">
          <Label>โฟลเดอร์ Soundfont</Label>
          <TableList
            height={"100%"}
            listKey={"id"}
            hoverFocus={false}
            list={soundFontStorage}
            itemAction={(value) => (
              <Button
                padding=""
                className="w-7 h-7"
                disabled={loading}
                onClick={async () => {
                  if (engine?.soundfontName !== value) {
                    const loadSf = await soundfont.get(value);
                    if (loadSf?.file) {
                      updateSoundFont(loadSf.file);
                    }
                  }
                }}
                color="default"
                blur={false}
                icon={
                  loading ? (
                    <AiOutlineLoading3Quarters className="animate-spin"></AiOutlineLoading3Quarters>
                  ) : engine?.soundfontName === value ? (
                    <FaCircleCheck className="text-green-500"></FaCircleCheck>
                  ) : (
                    <IoMdAddCircle></IoMdAddCircle>
                  )
                }
              ></Button>
            )}
            onDeleteItem={(value) => removeSF2Local(value)}
          ></TableList>
        </div>
      </div>
    </div>
  );
};

export default SoundfontFolder;
