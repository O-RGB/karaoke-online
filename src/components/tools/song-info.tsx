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
    console.log("music", music);
    setMusicInfo(music);
  };

  useEffect(() => {
    if (engine) {
      engine?.musicUpdated.on(
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
      <div className="p-2 border blur-overlay rounded-md text-white text-sm leading-4">
        <span className="text-xs">ชื่อเพลง:</span> {musicInfo?.trackData.TITLE}{" "}
        <br />
        <span className="text-xs">นักร้อง:</span> {musicInfo?.trackData.ARTIST}
      </div>
    </div>
  );
};

export default SongInfo;
