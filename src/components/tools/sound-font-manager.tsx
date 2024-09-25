"use client";
import React, { useEffect, useState } from "react";
import { setSoundFont } from "@/lib/spssasynth/sound-font";
import UpdateFile from "../common/input-data/upload";
import { TbMusicPlus } from "react-icons/tb";
import { useSynth } from "@/hooks/spessasynth-hook";
import {
  deleteSoundFontStorage,
  getAllSoundFontDicStorage,
  getSoundFontStorage,
  saveSoundFontStorage,
} from "@/lib/storage";
import { FaRegFileAudio } from "react-icons/fa";
import Button from "../common/button/button";
import { IoMdAddCircle } from "react-icons/io";
import { RiDeleteBin5Line } from "react-icons/ri";
import { FaCircleCheck } from "react-icons/fa6";
import { DEFAULT_SOUND_FONT } from "@/config/value";
import { ImFilePlay } from "react-icons/im";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

interface SoundfontManagerProps {}

const SoundfontManager: React.FC<SoundfontManagerProps> = ({}) => {
  const { synth, player, defaultSoundFont, SFname, setSoundFontName } =
    useSynth();
  const [soundFontStorage, setSoundFontStorage] = useState<
    {
      filename: string;
      size: number;
    }[]
  >([]);
  const [loading, setLoading] = useState<boolean>(false);

  const getSF2LocalList = async () => {
    let sf = await getAllSoundFontDicStorage();

    if (sf.length === 0) {
      let file: File | undefined = defaultSoundFont;
      if (file && synth) {
        setSoundFont(file, synth);
        setSoundFontName(file.name);
      }
    }

    setSoundFontStorage(sf);
  };

  const removeSF2Local = async (filename: string) => {
    await deleteSoundFontStorage(filename);
    await getSF2LocalList();
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
    }, 500);
  };

  useEffect(() => {
    getSF2LocalList();
  }, [synth?.soundfontManager, SFname]);

  return (
    <div className="p-2 border border-white w-full flex flex-col gap-2 overflow-hidden">
      <div className=" ">
        <UpdateFile
          accept=".sf2"
          className="border p-3 rounded-md hover:bg-gray-50 duration-300"
          onSelectFile={async (file) => {
            if (synth) {
              await saveSoundFontStorage(file);
              await getSF2LocalList();
            }
          }}
        >
          <span className="w-full text-sm flex items-center gap-2">
            <span>
              <TbMusicPlus></TbMusicPlus>
            </span>
            <span>อัปโหลดไฟล์</span>
            <span className="text-gray-300">(ไม่เกิน 2GB)</span>
          </span>
        </UpdateFile>
      </div>
      Soundfont ที่กำลังเล่น
      <div className="relative w-fit">
        <div className="absolute -right-1 -top-1">
          <FaCircleCheck className="text-lg text-green-500"></FaCircleCheck>
        </div>
        <div className=" border flex gap-2 flex-col items-center p-2 px-4 rounded-md">
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
      {/* <div className="flex flex-col gap-2">
        {soundFontList.map((data, index) => {
          return (
            <React.Fragment key={`sf-key-list-${index}`}>
              <SoundFontItem
                onDelete={onDeleteSoundFont}
                title={data.id}
                id={data.id}
              ></SoundFontItem>
            </React.Fragment>
          );
        })}
      </div> */}
      โฟลเดอร์
      <div className="grid  grid-cols-2  md:flex flex-col gap-3 md:gap-0 md:divide-y md:border rounded-md">
        {soundFontStorage.length === 0 && (
          <div className="w-full min-h-20 flex items-center justify-center text-xs text-gray-300">
            ไม่มีไฟล์
          </div>
        )}

        {soundFontStorage.map((sf, k) => {
          return (
            <div
              key={`sf-storage-${k}`}
              className="flex flex-col md:flex-row gap-2 items-center justify-between p-2 border md:border-none"
            >
              <div className="flex flex-col md:flex-row gap-2 items-center">
                <div>
                  <FaRegFileAudio className="text-2xl md:text-xl"></FaRegFileAudio>
                </div>
                <div className="text-sm break-all w-[80%] md:w-full">
                  {sf.filename}
                </div>
              </div>
              <div className="flex gap-2 items-center justify-center">
                <div className="text-sm">
                  {Math.round(sf.size / 1000000)} mb
                </div>
                <Button
                  padding=""
                  className="w-7 h-7"
                  onClick={async () => {
                    if (SFname !== sf.filename) {
                      const loadSf = await getSoundFontStorage(sf.filename);
                      if (loadSf) {
                        updateSoundFont(loadSf);
                      }
                    }
                  }}
                  color="default"
                  blur={false}
                  icon={
                    loading ? (
                      <AiOutlineLoading3Quarters className="animate-spin"></AiOutlineLoading3Quarters>
                    ) : SFname === sf.filename ? (
                      <FaCircleCheck className="text-green-500"></FaCircleCheck>
                    ) : (
                      <IoMdAddCircle></IoMdAddCircle>
                    )
                  }
                ></Button>
                <Button
                  onClick={() => removeSF2Local(sf.filename)}
                  padding=""
                  className="w-7 h-7"
                  color="red"
                  blur={false}
                  icon={
                    <RiDeleteBin5Line className="text-white"></RiDeleteBin5Line>
                  }
                ></Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SoundfontManager;
