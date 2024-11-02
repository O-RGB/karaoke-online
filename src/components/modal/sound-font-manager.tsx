"use client";
import React, { useEffect, useState } from "react";
import { setSoundFont } from "@/lib/spssasynth/sound-font";
import UpdateFile from "../common/input-data/upload";
import { TbMusicPlus } from "react-icons/tb";

import { FaRegFileAudio } from "react-icons/fa";
import Button from "../common/button/button";
import { IoMdAddCircle } from "react-icons/io";
import { RiDeleteBin5Line } from "react-icons/ri";
import { FaCircleCheck } from "react-icons/fa6";
import { ImFilePlay } from "react-icons/im";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import Label from "../common/display/label";
import {
  deleteSoundFontStorage,
  getAllKeySoundfont,
  getSoundFontStorage,
  saveSoundFontStorage,
} from "@/lib/storage/soundfont";
import { useSpessasynthStore } from "../../stores/spessasynth-store";
import TableList from "../common/table/table-list";

interface SoundfontManagerProps {}

const SoundfontManager: React.FC<SoundfontManagerProps> = ({}) => {
  const synth = useSpessasynthStore((state) => state.synth);
  const player = useSpessasynthStore((state) => state.player);
  const defaultSoundFont = useSpessasynthStore(
    (state) => state.defaultSoundFont
  );
  const SFname = useSpessasynthStore((state) => state.SFname);
  const setSoundFontName = useSpessasynthStore(
    (state) => state.setSoundFontName
  );
  const [soundFontStorage, setSoundFontStorage] = useState<
    ListItem<IDBValidKey>[]
  >([]);
  const [loading, setLoading] = useState<boolean>(false);

  const getSoundFontList = async () => {
    let sf = await getAllKeySoundfont();
    const lists = sf.map(
      (data) =>
        ({
          row: data.toString(),
          value: data,
        } as ListItem<IDBValidKey>)
    );
    setSoundFontStorage(lists);
    return lists;
  };

  const getSoundfontLocal = async () => {
    const sf = await getSoundFontList();
    if (sf.length === 0) {
      let file: File | undefined = defaultSoundFont;
      if (file && synth) {
        setSoundFont(file, synth);
        setSoundFontName(file.name);
      }
    }
  };

  const removeSF2Local = async (filename: string) => {
    await deleteSoundFontStorage(filename);
    await getSoundfontLocal();
  };

  const updateSoundFont = async (file: File) => {
    setLoading(true);
    if (player) player.pause();
    if (file && synth) {
      await setSoundFont(file, synth);
      setSoundFontName(file.name);
    }

    setTimeout(() => {
      if (player) player.play();
      setLoading(false);
    }, 2000);
  };

  useEffect(() => {
    getSoundFontList();
  }, []);

  return (
    <div>
      <div className=" border border-white w-full grid grid-cols-5 gap-4 overflow-hidden">
        <div className="w-full col-span-5 lg:col-span-2 flex flex-col gap-2">
          <div className="flex flex-col gap-1">
            <Label>เพิ่ม Soundfont</Label>
            <UpdateFile
              accept=".sf2"
              className="border border-blue-500 p-3 rounded-md hover:bg-gray-50 duration-300"
              onSelectFile={async (file) => {
                if (synth) {
                  setLoading(true);
                  await saveSoundFontStorage(file);
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
            <div className="relative w-fit">
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
                <div className="text-sm">{SFname}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-5 lg:col-span-3 flex flex-col gap-1 w-full h-full">
          <Label>โฟลเดอร์ Soundfont</Label>
          <TableList
            hoverFocus={false}
            listKey={"soundfont-key"}
            list={soundFontStorage}
            itemAction={(value) => (
              <Button
                padding=""
                className="w-7 h-7"
                disabled={loading}
                onClick={async () => {
                  if (SFname !== value) {
                    const loadSf = await getSoundFontStorage(value);
                    if (loadSf.value) {
                      updateSoundFont(loadSf.value);
                    }
                  }
                }}
                color="default"
                blur={false}
                icon={
                  loading ? (
                    <AiOutlineLoading3Quarters className="animate-spin"></AiOutlineLoading3Quarters>
                  ) : SFname === value ? (
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

export default SoundfontManager;
