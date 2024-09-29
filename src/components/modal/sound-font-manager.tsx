"use client";
import React, { useEffect, useState } from "react";
import { setSoundFont } from "@/lib/spssasynth/sound-font";
import UpdateFile from "../common/input-data/upload";
import { TbMusicPlus } from "react-icons/tb";
import { useSynth } from "@/hooks/spessasynth-hook";
import {
  createSoundFontDic,
  deleteSoundFontStorage,
  getAllKeySoundfont,
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
import Label from "../common/label";

interface SoundfontManagerProps {}

const SoundfontManager: React.FC<SoundfontManagerProps> = ({}) => {
  const { synth, player, defaultSoundFont, SFname, setSoundFontName } =
    useSynth();
  const [soundFontStorage, setSoundFontStorage] = useState<IDBValidKey[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const getSF2LocalList = async () => {
    let sf = await getAllKeySoundfont();
    console.log("getSD", sf);

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
    <div>
      <div className=" border border-white w-full grid grid-cols-5 gap-4 overflow-hidden">
        <div className="w-full col-span-5 lg:col-span-2">
          <Label>เพิ่ม Soundfont</Label>
          <div className=" ">
            <UpdateFile
              accept=".sf2"
              className="border p-3 rounded-md hover:bg-gray-50 duration-300"
              onSelectFile={async (file) => {
                if (synth) {
                  setLoading(true);
                  await saveSoundFontStorage(file);
                  await getSF2LocalList();
                  setLoading(false);
                }
              }}
            >
              <span className="w-full text-sm flex items-center gap-2">
                <span>
                  <TbMusicPlus></TbMusicPlus>
                </span>
                <span>อัปโหลดไฟล์</span>
                <Label>ไม่เกิน 2 Gb.</Label>
              </span>
            </UpdateFile>
          </div>
          <Label>Soundfont ที่กำลังเล่น</Label>
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
        </div>
        <div className="w-full col-span-5 lg:col-span-3 h-full">
          <span className="text-xs text-gray-400">โฟลเดอร์</span>
          <div className=" flex flex-col  border divide-y rounded-md h-auto md:h-[440px] overflow-x-auto">
            {soundFontStorage.length === 0 && (
              <div className="flex items-center justify-center w-full h-full">
                <Label>ไม่มีไฟล์</Label>
              </div>
            )}

            {soundFontStorage.map((sf, k) => {
              return (
                <div
                  key={`sf-storage-${k}`}
                  className="flex gap-2 items-center justify-between p-2"
                >
                  <div className="flex gap-2 items-center">
                    <div>
                      <FaRegFileAudio className="text-xl"></FaRegFileAudio>
                    </div>
                    <div className="text-sm break-all w-full line-clamp-1">
                      {sf.toString()}
                    </div>
                  </div>
                  <div className="flex gap-2 items-center justify-center text-nowrap">
                    {/* <Label> {Math.round(sf.size / 1000000)} Mb.</Label> */}

                    <Button
                      padding=""
                      className="w-7 h-7"
                      onClick={async () => {
                        if (SFname !== sf.toString()) {
                          const loadSf = await getSoundFontStorage(
                            sf.toString()
                          );
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
                        ) : SFname === sf.toString() ? (
                          <FaCircleCheck className="text-green-500"></FaCircleCheck>
                        ) : (
                          <IoMdAddCircle></IoMdAddCircle>
                        )
                      }
                    ></Button>
                    <Button
                      onClick={() => removeSF2Local(sf.toString())}
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
      </div>
    </div>
  );
};

export default SoundfontManager;
