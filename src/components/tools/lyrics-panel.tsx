"use client";

import React, { useEffect } from "react";
import { useLyrics } from "@/hooks/lyrics-hook";
import { useAppControl } from "@/hooks/app-control-hook";
import { useOrientation } from "@/hooks/orientation-hook";
import LyricsAnimation from "../common/lyrics/cut-lyrics/cut-animation";
import RandomLyrics from "../lyrics/random-lyrics";
import useLyricsStore from "../../stores/lyrics-store";

interface LyricsPanelProps {
  lyrics: string[];
  cursorTicks: number[];
  cursorIndices?: Map<number, number[]>;
}

const LyricsPanel: React.FC<LyricsPanelProps> = ({}) => {
  const display = useLyricsStore((state) => state.display);
  const displayBottom = useLyricsStore((state) => state.displayBottom);
  const position = useLyricsStore((state) => state.position);

  const { orientation } = useOrientation();
  const { lyricsDisplay } = useLyrics();
  const { hideVolume } = useAppControl();

  useEffect(() => {}, [lyricsDisplay]);

  const height = hideVolume
    ? orientation === "landscape"
      ? "h-[55dvh]"
      : "h-[75dvh]"
    : orientation === "landscape"
    ? "h-[55dvh]"
    : "h-[30dvh]";

  const className = `${height} lg:h-[400px] flex items-center justify-center relative w-full rounded-lg text-center overflow-auto [&::-webkit-scrollbar]:hidden duration-300`;
  console.log("lyrics-panel-render...");
  return (
    <div className="fixed bottom-20 lg:bottom-16 left-0 w-full px-5 -z-40">
      <div className={className}>
        <div className="text-sm gap-2 absolute text-white text-start top-2 left-2"></div>

        <div className="flex flex-col py-7 lg:gap-3 items-center justify-center text-white drop-shadow-lg">
          {lyricsDisplay === "default" ? (
            <>
              <span className="min-h-10 md:min-h-16 lg:min-h-20 flex items-center">
                <LyricsAnimation
                  // charIndex={position === true ? charIndex : -1}
                  fixedCharIndex={position === false ? -1 : undefined}
                  display={display}
                ></LyricsAnimation>
              </span>
              <br />
              <LyricsAnimation
                // charIndex={position === false ? charIndex : -1}
                fixedCharIndex={position === true ? -1 : undefined}
                display={displayBottom}
              ></LyricsAnimation>
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
