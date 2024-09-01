"use client";
import React, { useEffect, useState } from "react";
import SoundFontItem from "../common/sound-font/sound-font-item";
import {
  deleteSoundFont,
  getSoundFontList,
  setSoundFont,
} from "@/lib/spssasynth/sound-font";
import { Synthetizer } from "spessasynth_lib";
import Button from "../common/button/button";
import UpdateFile from "../common/input-data/upload";
import { FaFile } from "react-icons/fa";
import { TbMusicPlus } from "react-icons/tb";

interface SoundfontManagerProps {
  synth: Synthetizer;
}

const SoundfontManager: React.FC<SoundfontManagerProps> = ({ synth }) => {
  const [soundFontList, setSoundFontList] = useState<ISoundFontList[]>([]);

  const onLoad = () => {
    const sfList = getSoundFontList(synth);
    setSoundFontList(sfList);
  };

  const onDeleteSoundFont = async (id: string) => {
    deleteSoundFont(id, synth);
    setSoundFontList((value) => {
      let updated = value.filter((x) => x.id !== id);
      return updated;
    });
  };

  useEffect(() => {
    onLoad();
  }, [synth.soundfontManager.soundfontList]);

  return (
    <div className="p-2 border border-white w-full flex flex-col gap-2 overflow-hidden">
      <div className=" ">
        <UpdateFile
          accept=".sf2"
          className="border w-full p-3 rounded-md hover:bg-gray-50 duration-300"
          onSelectFile={(file) => {
            setSoundFont(file, synth);
          }}
        >
          <span className="w-full text-sm flex items-center gap-2">
            <span>
              <TbMusicPlus></TbMusicPlus>
            </span>{" "}
            <span>อัปโหลดไฟล์</span>{" "}
            <span className="text-gray-300">(ไม่เกิน 2GB)</span>
          </span>
        </UpdateFile>
      </div>
      <div className="flex flex-col gap-2">
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
      </div>
    </div>
  );
};

export default SoundfontManager;
