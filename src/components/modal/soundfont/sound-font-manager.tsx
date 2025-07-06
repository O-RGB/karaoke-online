"use client";
import Tabs from "../../common/tabs";
import SoundfontFolder from "./tabs/sound-font-folder";
import SoundfontFree from "./tabs/sound-font-free";
import useSongsStore from "@/features/songs/store/songs.store";
import React, { useEffect, useState } from "react";
import { useSynthesizerEngine } from "@/features/engine/synth-store";
import { BiDownload, BiFolder } from "react-icons/bi";
import { SoundfontPlayerManager } from "@/utils/indexedDB/db/player/table";
import { SoundSystemMode } from "@/features/config/types/config.type";
import { DEFAULT_SOUND_FONT } from "@/config/value";

const soundfont = new SoundfontPlayerManager();
interface SoundfontManagerProps {
  height?: number;
}

const SoundfontManager: React.FC<SoundfontManagerProps> = ({ height }) => {
  const soundfontBaseManager = useSongsStore(
    (state) => state.soundfontBaseManager
  );
  const engine = useSynthesizerEngine((state) => state.engine);
  const [soundFontStorage, setSoundFontStorage] = useState<ListItem<File>[]>(
    []
  );
  const [soundFontExtreme, setSoundFontExtreme] = useState<ListItem<File>[]>(
    []
  );
  const [selected, setSelected] = useState<string | undefined>(
    DEFAULT_SOUND_FONT
  );
  const [from, setFrom] = useState<SoundSystemMode>("EXTREME_FILE_SYSTEM");

  const [loading, setLoading] = useState<boolean>(false);

  const getSoundFontList = async () => {
    const list = await soundfontBaseManager?.getSoundfonts();
    if (!list) return [];
    const extreme = list?.manager.map((data) => ({
      row: data.name,
      value: data,
    }));
    const local = list?.local.map((data) => ({
      row: data.name,
      value: data,
    }));

    extreme.sort((a, b) => a.row.localeCompare(b.row));
    local.sort((a, b) => a.row.localeCompare(b.row));

    setSoundFontStorage(local);
    setSoundFontExtreme(extreme);
    return extreme;
  };

  const getSoundfontLocal = async () => {
    const sf = await getSoundFontList();
    if (sf.length === 0) {
      engine?.loadDefaultSoundFont();
    }
  };

  const removeSF2Local = async (id: number) => {
    await soundfont.delete(id);
    await getSoundfontLocal();
  };

  const updateSoundFont = async (
    idOrFilename: string,
    from: SoundSystemMode
  ) => {
    soundfontBaseManager?.setSoundfont(idOrFilename, from);
    setFrom(from);
    setSelected(idOrFilename);
  };

  useEffect(() => {
    getSoundFontList();
    setSelected(soundfontBaseManager?.selected);
    setFrom(soundfontBaseManager?.selectedFrom ?? "EXTREME_FILE_SYSTEM");
  }, [engine?.soundfontName, soundfontBaseManager?.selected]);

  return (
    <Tabs
      height={height}
      tabs={[
        {
          content: (
            <SoundfontFolder
              engine={engine}
              from={from}
              onClickDefault={async () => {
                await engine?.loadDefaultSoundFont();
                setSelected(DEFAULT_SOUND_FONT);
                setFrom("DATABASE_FILE_SYSTEM");
              }}
              selected={selected}
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
  );
};

export default SoundfontManager;
