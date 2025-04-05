import React, { useState, useEffect } from "react";
import LyricsList from "./components/lyrics-list";
import useRuntimePlayer from "@/features/player/player/modules/runtime-player";
import useLyricsStoreNew from "@/features/lyrics/store/lyrics.store";
import useConfigStore from "@/features/config/config-store";
import { NextFont } from "next/dist/compiled/@next/font";
import { LyricsCharacterStyle } from "./types/lyrics-character.type";

interface LyricsPlayerProps {}

const LyricsPlayer: React.FC<LyricsPlayerProps> = () => {
  const [windowsWidth, setWindowsWidth] = useState<number>(window.innerWidth);
  const currentTick = useRuntimePlayer((state) => state.currentTick);
  const lyricsProcessed = useLyricsStoreNew((state) => state.lyricsProcessed);

  const fontName = useConfigStore((state) => state.config.lyrics?.fontName);
  const fontSize = useConfigStore((state) => state.config.lyrics?.fontSize);
  const fontAuto = useConfigStore((state) => state.config.lyrics?.fontAuto);
  const colorActive = useConfigStore((state) => state.config.lyrics?.active);
  const color = useConfigStore((state) => state.config.lyrics?.color);

  const [fontState, setFontState] = useState<NextFont>();

  const handleResize = () => {
    setWindowsWidth(window.innerWidth);
  };

  useEffect(() => {
    setWindowsWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  if (!lyricsProcessed) return null;
  const active = lyricsProcessed.search(currentTick);
  if (!active) return <></>;
  const next = lyricsProcessed.getByIndex(active.index + 1);

  const textStyle: LyricsCharacterStyle = {
    activeColor: colorActive,
    fontSize: fontAuto ? "text-2xl md:text-3xl lg:text-6xl" : Number(fontSize),
    color: color,
    font: fontState,
  };

  const className = `h-[400px] flex items-center justify-center relative w-full rounded-lg text-center overflow-auto [&::-webkit-scrollbar]:hidden duration-300`;
  return (
    <div
      className="w-full px-5 -z-40"
      style={{
        position: "fixed",
        bottom: "40px",
        left: 0,
      }}
    >
      <div className={className}>
        <div className="text-sm gap-2 absolute text-white text-start top-2 left-2"></div>
        <div className="flex flex-col py-7 gap-6 lg:gap-10 items-center justify-center text-white drop-shadow-lg">
          <LyricsList
            tick={active.lyrics.tag === "top" ? currentTick : 0}
            containerWidth={windowsWidth}
            sentence={active.lyrics.value}
            text={
              active.lyrics.tag === "top"
                ? active.lyrics.value.text
                : next?.tag === "top" && active.lyrics.tag === "bottom"
                ? next.value.text
                : undefined
            }
            textStyle={textStyle}
          ></LyricsList>
          <LyricsList
            tick={active.lyrics.tag === "bottom" ? currentTick : 0}
            containerWidth={windowsWidth}
            sentence={active.lyrics.value}
            text={
              active.lyrics.tag === "bottom"
                ? active.lyrics.value.text
                : next?.tag === "bottom" && active.lyrics.tag === "top"
                ? next.value.text
                : undefined
            }
            textStyle={textStyle}
          ></LyricsList>
        </div>
      </div>
    </div>
  );
};

export default LyricsPlayer;
