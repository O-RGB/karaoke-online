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
  }, [synth]);

  return (
    <div className="p-2 border border-white w-fit flex flex-col gap-2 overflow-hidden">
      <div className="-mr-32">
        <UpdateFile
          accept=".sf2"
          onSelectFile={(file) => {
            setSoundFont(file, synth);
          }}
        >
          upload
        </UpdateFile>
      </div>
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
  );
};

export default SoundfontManager;
