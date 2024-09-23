"use client";
import React, { useEffect, useState } from "react";
import {
  deleteSoundFont,
  getSoundFontList,
  setSoundFont,
} from "@/lib/spssasynth/sound-font";
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
import { MdUploadFile } from "react-icons/md";
import { FaCircleCheck } from "react-icons/fa6";
import { DEFAULT_SOUND_FONT } from "@/config/value";
import { ImFilePlay } from "react-icons/im";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

interface SoundfontManagerProps {}

const SoundfontManager: React.FC<SoundfontManagerProps> = ({}) => {
  const defaultsf = "soundfont เริ่มต้น.sf2";
  const { synth, player } = useSynth();
  const [soundFontStorage, setSoundFontStorage] = useState<
    {
      filename: string;
      size: number;
    }[]
  >([]);
  const [activeSf, setActiveSf] = useState<string>(defaultsf);
  const [loading, setLoading] = useState<boolean>(false);
  const [onFetchFile, setFetchFile] = useState<File>();

  const getSF2LocalList = async () => {
    let sf = await getAllSoundFontDicStorage();

    if (sf.length === 0) {
      let file: File | undefined = await backToSfDefault();
      if (file && synth) {
        setSoundFont(file, synth);
        setActiveSf(defaultsf);
      }
    }

    setSoundFontStorage(sf);
  };

  const removeSF2Local = async (filename: string) => {
    await deleteSoundFontStorage(filename);
    await getSF2LocalList();
  };

  const updateSoundFont = async (filename: string) => {
    setLoading(true);
    if (player) player.pause();
    const loadFromLocal = await getSoundFontStorage(filename);
    if (loadFromLocal && synth) {
      await setSoundFont(loadFromLocal, synth);
      setActiveSf(filename);
    }

    setTimeout(() => {
      if (player) player.play();
      setLoading(false);
    }, 500);
  };

  const backToSfDefault = async () => {
    let sf: File | undefined = undefined;
    if (!onFetchFile) {
      const res = await fetch(DEFAULT_SOUND_FONT);
      const ab = await res.arrayBuffer();

      // สร้าง Blob จาก ArrayBuffer
      const blob = new Blob([ab], { type: "application/octet-stream" });

      // สร้าง File จาก Blob
      sf = new File([blob], "soundfont.sf2", {
        type: "application/octet-stream",
      });
      setFetchFile(sf);
    }
    return sf;
  };

  useEffect(() => {
    getSF2LocalList();
  }, [synth?.soundfontManager]);

  return (
    <div className="p-2 border border-white w-full flex flex-col gap-2 overflow-hidden">
      <div className=" ">
        <UpdateFile
          accept=".sf2"
          className="border p-3 rounded-md hover:bg-gray-50 duration-300"
          onSelectFile={async (file) => {
            if (synth) {
              setSoundFont(file, synth);
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
          <div className="text-sm">{activeSf}</div>
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
      <div className="flex flex-col divide-y border rounded-md">
        {soundFontStorage.length === 0 && (
          <div className="w-full min-h-20 flex items-center justify-center text-xs text-gray-300">
            ไม่มีไฟล์
          </div>
        )}

        {soundFontStorage.map((sf) => {
          return (
            <div className="flex gap-2 items-center justify-between p-2">
              <div className="flex gap-2 items-center">
                <div>
                  <FaRegFileAudio className="text-xl"></FaRegFileAudio>
                </div>
                <div className="text-sm">{sf.filename}</div>
              </div>
              <div className="flex gap-2 items-center justify-center">
                <div className="text-sm">
                  {Math.round(sf.size / 1000000)} mb
                </div>
                <Button
                  padding=""
                  className="w-7 h-7"
                  onClick={() => {
                    if (activeSf === sf.filename) {
                      backToSfDefault();
                    } else {
                      updateSoundFont(sf.filename);
                    }
                  }}
                  color="default"
                  blur={false}
                  icon={
                    loading ? (
                      <AiOutlineLoading3Quarters className="animate-spin"></AiOutlineLoading3Quarters>
                    ) : activeSf === sf.filename ? (
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
