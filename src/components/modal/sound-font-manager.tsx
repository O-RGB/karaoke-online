"use client";
import React, { useEffect, useState } from "react";
import UpdateFile from "../common/input-data/upload";
import { TbMusicPlus } from "react-icons/tb";

import Button from "../common/button/button";
import { IoMdAddCircle } from "react-icons/io";
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
import TableList from "../common/table/table-list";
import { useSynthesizerEngine } from "@/stores/engine/synth-store";
import useRuntimePlayer from "@/stores/player/player/modules/runtime-player";

interface SoundfontManagerProps {}

const SoundfontManager: React.FC<SoundfontManagerProps> = ({}) => {
  const engine = useSynthesizerEngine((state) => state.engine);
  const isPaused = useRuntimePlayer((state) => state.isPaused);

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
      engine?.loadDefaultSoundFont();
    }
  };

  const removeSF2Local = async (filename: string) => {
    await deleteSoundFontStorage(filename);
    await getSoundfontLocal();
  };

  const updateSoundFont = async (file: File) => {
    setLoading(true);
    if (engine) engine.player?.pause();
    if (file && engine) {
      engine.setSoundFont(file);
    }

    if (!isPaused) {
      setTimeout(() => {
        if (engine) engine.player?.play();
        setLoading(false);
      }, 2000);
    } else {
      setLoading(false);
    }
  };

  useEffect(() => {
    getSoundFontList();
  }, [engine]);

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
                if (engine) {
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
                <div className="text-sm">{engine?.soundfontName}</div>
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
                  if (engine?.soundfontName !== value) {
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

export default SoundfontManager;
