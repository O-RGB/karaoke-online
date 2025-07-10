"use client";
import Tabs from "../../common/tabs";
import SoundfontFolder from "./tabs/sound-font-folder";
import SoundfontFree from "./tabs/sound-font-free";
import useSongsStore from "@/features/songs/store/songs.store";
import React, { useEffect, useState } from "react";
import { BiDownload, BiFolder } from "react-icons/bi";
import { SoundSystemMode } from "@/features/config/types/config.type";
import { ISoundfontPlayer } from "@/utils/indexedDB/db/player/types";
import { DEFAULT_SOUND_FONT } from "@/config/value";

interface SoundfontManagerProps {
  height?: number;
}

const SoundfontManager: React.FC<SoundfontManagerProps> = ({ height }) => {
  const soundfontBaseManager = useSongsStore(
    (state) => state.soundfontBaseManager
  );
  const [selected, setSelected] = useState<{
    name: string;
    from: SoundSystemMode;
  }>({ name: DEFAULT_SOUND_FONT, from: "DATABASE_FILE_SYSTEM" });

  const [soundFontStorage, setSoundFontStorage] = useState<
    ListItem<ISoundfontPlayer>[]
  >([]);
  const [soundFontExtreme, setSoundFontExtreme] = useState<
    ListItem<ISoundfontPlayer>[]
  >([]);
  const [loading, setLoading] = useState<boolean>(false);

  const getSoundFontList = async () => {
    const list = await soundfontBaseManager?.getSoundfonts();
    if (!list) return [];
    const extreme = list?.manager.map((data) => ({
      label: data.file.name,
      value: data,
    }));

    const local = list?.local.map((data) => ({
      label: data.file.name,
      value: data,
    }));

    extreme.sort((a, b) => a.label.localeCompare(b.label));
    local.sort((a, b) => a.label.localeCompare(b.label));

    setSoundFontStorage(local);
    setSoundFontExtreme(extreme);
    return extreme;
  };

  const removeSF2Local = async (id: ISoundfontPlayer) => {
    soundfontBaseManager?.removeSoundfont(id.file.name);
  };

  const updateSoundFont = async (
    idOrFilename: string,
    from: SoundSystemMode
  ) => {
    const selected = await soundfontBaseManager?.setSoundfont(
      idOrFilename,
      from
    );

    if (selected) {
      setSelected({
        from,
        name: selected,
      });
    }
  };

  useEffect(() => {
    getSoundFontList();
  }, [selected]);

  return (
    <>
      <Tabs
        height={height}
        tabs={[
          {
            content: (
              <SoundfontFolder
                from={selected.from}
                onClickDefault={async () => {
                  soundfontBaseManager?.reset();
                  setSelected({
                    name: DEFAULT_SOUND_FONT,
                    from: "DATABASE_FILE_SYSTEM",
                  });
                }}
                selected={selected.name}
                getSoundFontList={getSoundFontList}
                loading={loading}
                removeSF2Local={removeSF2Local}
                setLoading={setLoading}
                soundFontStorage={soundFontStorage}
                soundFontExtreme={soundFontExtreme}
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
                soundFontStorage={soundFontStorage}
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
