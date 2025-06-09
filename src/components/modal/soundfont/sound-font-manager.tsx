"use client";
import Tabs from "../../common/tabs";
import React, { useEffect, useState } from "react";
import useRuntimePlayer from "@/features/player/player/modules/runtime-player";
import SoundfontFolder from "./tabs/sound-font-folder";
import SoundfontFree from "./tabs/sound-font-free";
import { useSynthesizerEngine } from "@/features/engine/synth-store";
import { BiDownload, BiFolder } from "react-icons/bi";
import { SoundfontPlayerManager } from "@/utils/indexedDB/db/player/table";
import { ISoundfontPlayer } from "@/utils/indexedDB/db/player/types";

const soundfont = new SoundfontPlayerManager();
interface SoundfontManagerProps {
  height?: number;
}

const SoundfontManager: React.FC<SoundfontManagerProps> = ({ height }) => {
  const engine = useSynthesizerEngine((state) => state.engine);
  const isPaused = useRuntimePlayer((state) => state.isPaused);

  const [soundFontStorage, setSoundFontStorage] = useState<
    ListItem<ISoundfontPlayer>[]
  >([]);

  const [loading, setLoading] = useState<boolean>(false);

  const getSoundFontList = async () => {
    let sf = await soundfont.getAll();
    const lists = sf.map((data) => ({
      row: data.id,
      value: data,
    }));
    setSoundFontStorage(lists);
    return lists;
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
    <Tabs
      height={height}
      tabs={[
        {
          content: (
            <SoundfontFolder
              engine={engine}
              getSoundFontList={getSoundFontList}
              loading={loading}
              removeSF2Local={removeSF2Local}
              setLoading={setLoading}
              soundFontStorage={soundFontStorage}
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
