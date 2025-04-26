"use client";
import React, { useEffect, useState } from "react";
import useRuntimePlayer from "@/features/player/player/modules/runtime-player";
import SoundfontFolder from "./tabs/sound-font-folder";
import SoundfontFree from "./tabs/sound-font-free";
import { useSynthesizerEngine } from "@/features/engine/synth-store";
import { BiDownload, BiFolder } from "react-icons/bi";
import { deleteSoundFontStorage, getAllKeySoundfont } from "@/lib/storage/soundfont";
import Tabs from "../../common/tabs";

interface SoundfontManagerProps {
  height?: number;
}

const SoundfontManager: React.FC<SoundfontManagerProps> = ({ height }) => {
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
    <Tabs
      height={height}
      tabs={[
        {
          content: (
            <SoundfontFolder engine={engine} getSoundFontList={getSoundFontList} loading={loading} removeSF2Local={removeSF2Local} setLoading={setLoading} soundFontStorage={soundFontStorage} updateSoundFont={updateSoundFont} ></SoundfontFolder>
          ),
          label: "โฟลเดอร์",
          icon: <BiFolder></BiFolder>,
        },
        {
          content: <SoundfontFree getSoundFontList={getSoundFontList} soundFontStorage={soundFontStorage}></SoundfontFree>,
          label: "แจกฟรี",
          icon: <BiDownload></BiDownload>
        }
      ]}
    ></Tabs>
  );
};

export default SoundfontManager;
