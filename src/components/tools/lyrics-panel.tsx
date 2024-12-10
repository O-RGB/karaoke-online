"use client";

import React, { useEffect, useState } from "react";
import RandomLyrics from "../lyrics/random-lyrics";
import useLyricsStore from "../../stores/player/lyrics-store";
import useConfigStore from "@/stores/config/config-store";
import { NextFont } from "next/dist/compiled/@next/font";
import { lyricsGetFont } from "@/features/lyrics/lyrics.features";
import { useOrientation } from "@/hooks/orientation-hook";
import CutLyrics from "../common/lyrics/cut-lyrics/cut-lyrics";
import useMixerStoreNew from "@/stores/player/event-player/modules/event-mixer-store";

interface LyricsPanelProps {
  // lyrics: string[];
  // cursorTicks: number[];
  // cursorIndices?: Map<number, number[]>;
}

const LyricsPanel: React.FC<LyricsPanelProps> = ({}) => {
  const display = useLyricsStore((state) => state.display);
  const displayBottom = useLyricsStore((state) => state.displayBottom);
  const position = useLyricsStore((state) => state.position);
  const colorActive = useConfigStore((state) => state.config.lyrics?.active);
  const color = useConfigStore((state) => state.config.lyrics?.color);
  const lyricsMode = useConfigStore((state) => state.config.lyrics?.lyricsMode);
  const fontName = useConfigStore((state) => state.config.lyrics?.fontName);
  const fontSize = useConfigStore((state) => state.config.lyrics?.fontSize);
  const fontAuto = useConfigStore((state) => state.config.lyrics?.fontAuto);

  const [FontState, setFontState] = useState<NextFont>();

  const { orientation } = useOrientation();
  const hideMixer = useMixerStoreNew((state) => state.hideMixer);

  useEffect(() => {}, [lyricsMode]);
  useEffect(() => {
    if (fontName) {
      const fontStyle = lyricsGetFont(fontName);
      setFontState(fontStyle);
    }
  }, [fontName]);

  const height = hideMixer
    ? orientation === "landscape"
      ? "h-[55dvh]"
      : "h-[75dvh]"
    : orientation === "landscape"
    ? "h-[55dvh]"
    : "h-[30dvh]";

  const className = `${height} lg:h-[400px] flex items-center justify-center relative w-full rounded-lg text-center overflow-auto [&::-webkit-scrollbar]:hidden duration-300`;
  return (
    <div className="fixed bottom-20 lg:bottom-16 left-0 w-full px-5 -z-40">
      <div className={className}>
        <div className="text-sm gap-2 absolute text-white text-start top-2 left-2"></div>

        <div className="flex flex-col py-7 lg:gap-3 items-center justify-center text-white drop-shadow-lg">
          {lyricsMode === "default" ? (
            <>
              <span className="min-h-10 md:min-h-16 lg:min-h-20 flex items-center">
                ​
                <CutLyrics
                  font={FontState}
                  color={color!}
                  activeColor={colorActive!}
                  fixedCharIndex={position === false ? -1 : undefined}
                  display={display}
                  fontSize={
                    fontAuto
                      ? "text-2xl md:text-3xl lg:text-6xl"
                      : Number(fontSize)
                  }
                ></CutLyrics>
              </span>
              <br />
              <CutLyrics
                font={FontState}
                color={color!}
                activeColor={colorActive!}
                fixedCharIndex={position === true ? -1 : undefined}
                display={displayBottom}
                fontSize={
                  fontAuto
                    ? "text-2xl md:text-3xl lg:text-6xl"
                    : Number(fontSize)
                }
              ></CutLyrics>
            </>
          ) : (
            <>
              <RandomLyrics
                display={display}
                displayBottom={displayBottom}
                position={position}
              ></RandomLyrics>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LyricsPanel;
