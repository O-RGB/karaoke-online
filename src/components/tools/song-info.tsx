import React, { useEffect, useId, useState } from "react";
import { useSynthesizerEngine } from "@/features/engine/synth-store";
import { MusicLoadAllData } from "@/features/songs/types/songs.type";

interface SongInfoProps {
  className?: string;
}

const SongInfo: React.FC<SongInfoProps> = ({ className }) => {
  const componnetId = useId();
  const engine = useSynthesizerEngine((state) => state.engine);
  const [musicInfo, setMusicInfo] = useState<MusicLoadAllData>();

  const onMusicUpdated = (music: MusicLoadAllData) => {
    setMusicInfo(music);
  };

  useEffect(() => {
    if (engine) {
      engine?.musicUpdated.add(
        ["MUSIC", "CHANGE"],
        0,
        onMusicUpdated,
        componnetId
      );
    }
  }, [engine]);

  const [show, setShow] = useState<boolean>(false);

  useEffect(() => {
    setShow(true);
    setTimeout(() => {
      setShow(false);
    }, 5000);
  }, [musicInfo]);

  if (!show) return <></>;
  return (
    <div className={`${className}`}>
      <div className={`w-fit h-20 flex flex-col gap-2 `}>
        <div className="p-3 border blur-overlay rounded-md text-white ">
          ชื่อเพลง: {musicInfo?.metadata?.info.TITLE} <br />
          นักร้อง: {musicInfo?.metadata?.info.ARTIST}
        </div>
      </div>
    </div>
  );
};

export default SongInfo;
