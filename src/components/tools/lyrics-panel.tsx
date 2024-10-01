"use client";

import React, { useEffect, useRef, useState } from "react";
import { Sequencer } from "spessasynth_lib";
import LyricsAnimation from "../common/lyrics/cut-animation";
import Upload from "../common/input-data/upload";
import { parseEMKFile } from "@/lib/karaoke/emk";
import Button from "../common/button/button";
import { BsFileEarmarkMusic } from "react-icons/bs";
import {
  readCursorFile,
  readLyricsFile,
  validateSongFileTypes,
} from "@/lib/karaoke/ncn";
import { EMK_FILE_TYPE } from "@/config/value";
import { groupThaiCharacters } from "@/lib/app-control";
import SelectLyrics from "../lyrics";
import { useLyrics } from "@/hooks/lyrics-hook";
import { useAppControl } from "@/hooks/app-control-hook";
// import EMKFileConverter from "./test";

interface LyricsPanelProps {
  lyrics: string[];
  tick: number;
  cursorTicks: number[];
  cursorIndices?: Map<number, number[]>;
}

const LyricsPanel: React.FC<LyricsPanelProps> = ({
  lyrics,
  tick,
  cursorTicks,
  cursorIndices,
}) => {
  const [closeLyr, setCloseLyr] = useState<boolean>(true);
  const { lyricsDisplay } = useLyrics();
  const { hideVolume } = useAppControl();

  const charIndex = useRef<number>(0);
  const display = useRef<string[][]>([]);
  const displayBottom = useRef<string[][]>([]);
  const position = useRef<boolean>(true);

  const curIdIndex = useRef<number>(0);
  const lyricsIndex = useRef<number>(0);

  const reset = () => {
    if (lyrics.length > 0) {
      display.current = [[lyrics[0]]];
    }
    curIdIndex.current = 0;
    position.current = false;
    lyricsIndex.current = 0;
    charIndex.current = 0;
  };

  const renderLyricsDisplay = () => {
    const targetTick = cursorTicks[curIdIndex.current];
    let tickUpdated = lyricsDisplay === "random" ? tick + 200 : tick;
    if (targetTick <= tickUpdated) {
      curIdIndex.current = curIdIndex.current + 1;

      const charIndices = cursorIndices?.get(targetTick);

      try {
        if (charIndices) {
          charIndices.forEach((__charIndex) => {
            let lineIndex = 0;
            let adjustedCharIndex = __charIndex;
            const lyricLines = lyrics.slice(3);

            while (adjustedCharIndex >= lyricLines[lineIndex].length) {
              adjustedCharIndex -= lyricLines[lineIndex].length + 1;
              lineIndex++;
            }
            if (lineIndex > lyricsIndex.current) {
              if (position.current === true) {
                display.current = groupThaiCharacters(
                  lyricLines[lineIndex + 1]
                );
                displayBottom.current = groupThaiCharacters(
                  lyricLines[lineIndex]
                );
              } else {
                display.current = groupThaiCharacters(lyricLines[lineIndex]);
                displayBottom.current = groupThaiCharacters(
                  lyricLines[lineIndex + 1]
                );
              }
              lyricsIndex.current = lineIndex;
              position.current = !position.current;
            }
            charIndex.current = adjustedCharIndex + 1;
          });
        }
      } catch (error) {}
    }
  };

  useEffect(() => {
    renderLyricsDisplay();
  }, [tick, cursorTicks, cursorIndices, lyrics]);

  useEffect(() => {
    if (lyrics) {
      reset();
    }
  }, [lyrics]);

  useEffect(() => {}, [lyricsDisplay]);

  return (
    <div className="fixed bottom-20 lg:bottom-16 left-0 w-full px-5 -z-40">
      <div
        className={`${
          !hideVolume ? "h-[30dvh] lg:h-[400px]" : "h-[75dvh] lg:h-[400px]"
        } flex items-center   justify-center relative w-full   rounded-lg   text-center overflow-auto [&::-webkit-scrollbar]:hidden duration-300`}
      >
        <div className="text-sm gap-2 absolute text-white text-start top-2 left-2"></div>

        {/* <div
          onClick={() => {
            console.log("test");
            setCloseLyr((v) => !v);
          }}
          className="z-50 absolute bg-red-500 top-9 left-16 w-10 h-10 cursor-pointer"
        >
          {JSON.stringify(closeLyr)}
        </div> */}

        <SelectLyrics
          display={display.current}
          displayBottom={displayBottom.current}
          options={lyricsDisplay}
          position={position.current}
          charIndex={charIndex.current}
        ></SelectLyrics>
      </div>
    </div>
  );
};

export default LyricsPanel;
