"use client";
import Tabs from "../../common/tabs";
import SoundfontFolder from "./tabs/soundfout-folder";
import SoundfontFree from "./tabs/sound-font-free";
import useSongsStore from "@/features/songs/store/songs.store";
import React, { useEffect, useState } from "react";
import { BiDownload, BiFolder } from "react-icons/bi";
import { SoundSystemMode } from "@/features/config/types/config.type";
import { ISoundfontPlayer } from "@/utils/indexedDB/db/player/types";

interface SoundfontManagerProps {
  height?: number;
}

const SoundfontManager: React.FC<SoundfontManagerProps> = ({ height }) => {
  const soundfontBaseManager = useSongsStore(
    (state) => state.soundfontBaseManager
  );
  const [selected, setSelected] = useState<ISoundfontPlayer | undefined>(
    undefined
  );

  const [sfStorage, setSfStorage] = useState<ListItem<ISoundfontPlayer>[]>([]);
  const [sfExtreme, setSfExtreme] = useState<ListItem<ISoundfontPlayer>[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const bytesToMB = (bytes: number, decimals = 2) =>
    (bytes / (1024 * 1024)).toFixed(decimals);

  const getSoundFontList = async () => {
    const list = await soundfontBaseManager?.getSoundfonts();
    if (!list) return [];
    const extreme = list?.manager.map((data) => ({
      label: data.file.name,
      key: data.keyId,
      value: data,
      render: () => (
        <div className="leading-[15px] w-full">
          <span className="text-nowrap">{data.file.name}</span> <br />
          <span className="text-[8px]">{bytesToMB(data.file.size)} mb</span>
        </div>
      ),
    }));

    const local = list?.local.map((data) => ({
      label: data.file.name,
      key: data.keyId,
      value: data,
      render: () => (
        <div className="leading-[15px] w-full">
          <span className="text-nowrap">{data.file.name}</span> <br />
          <span className="text-[8px]">{bytesToMB(data.file.size)} mb</span>
        </div>
      ),
    }));

    extreme.sort((a, b) => b.value.file.size - a.value.file.size);
    local.sort((a, b) => b.value.file.size - a.value.file.size);

    setSfStorage(local);
    setSfExtreme(extreme);
    return extreme;
  };

  const removeSf2Local = async (file: ISoundfontPlayer) => {
    await soundfontBaseManager?.removeSoundfont(file);
    getSoundFontList();
  };

  const updateSoundFont = async (
    sf: ISoundfontPlayer,
    from: SoundSystemMode
  ) => {
    const selected = await soundfontBaseManager?.setSoundfont(sf, from);

    if (selected) {
      setSelected(selected);
    }
  };

  useEffect(() => {
    getSoundFontList();
  }, []);

  useEffect(() => {
    setSelected(soundfontBaseManager?.selected);
  }, [soundfontBaseManager?.selected]);

  return (
    <>
      <Tabs
        height={height}
        tabs={[
          {
            content: (
              <SoundfontFolder
                onClickDefault={async () => {
                  soundfontBaseManager?.reset();
                  setSelected(undefined);
                }}
                selected={selected}
                getSoundFontList={getSoundFontList}
                loading={loading}
                removeSF2Local={removeSf2Local}
                setLoading={setLoading}
                sfStorage={sfStorage}
                sfExtreme={sfExtreme}
                updateSoundFont={updateSoundFont}
              ></SoundfontFolder>
            ),
            label: "โฟลเดอร์",
            icon: <BiFolder></BiFolder>,
          },
          {
            content: (
              <SoundfontFree
                getSoundFontList={getSoundFontList}
                soundFontStorage={sfStorage}
              ></SoundfontFree>
            ),
            label: "แจกฟรี",
            icon: <BiDownload></BiDownload>,
          },
        ]}
      ></Tabs>
    </>
  );
};

export default SoundfontManager;
