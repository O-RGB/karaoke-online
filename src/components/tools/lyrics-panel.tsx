"use client";
import { getTicks, groupThaiCharacters } from "@/lib/app-control";
import React, { useEffect, useState } from "react";
import { Sequencer } from "spessasynth_lib";
import LyricsAnimation from "../common/lyrics-animation";
import Upload from "../common/input-data/upload";
import { parseEMKFile } from "@/lib/karaoke/emk";

interface LyricsPanelProps {
  player: Sequencer;
  lyrics: string[];
  cursorIndices?: Map<number, number[]>;
  cursorTicks?: number[];
}

const LyricsPanel: React.FC<LyricsPanelProps> = ({
  player,
  lyrics,
  cursorIndices,
  cursorTicks = [],
}) => {
  const [display, setLyrDisplay] = useState<string[][]>([["ทดสอบเท่านั้น"]]);
  const [displayBottom, setLyrDisplayBottom] = useState<string[][]>([
    ["ทดสอบเท่านั้น"],
  ]);
  const [position, setPosition] = useState<boolean>(true);
  const [lyricsIndex, setLyricsIndex] = useState<number>(0);
  const [curIdIndex, setCurIdIndex] = useState<number>(0);
  const [charIndex, setCharIndex] = useState<number>(0);

  const updateTick = () => {
    const tick = getTicks(player) ?? 0;
    // setDebugTick(tick);
    const targetTick = cursorTicks[curIdIndex];
    // setRealTick(targetTick);
    if (targetTick <= tick) {
      setCurIdIndex((prevIndex) => prevIndex + 1);

      const charIndices = cursorIndices?.get(targetTick);
      if (charIndices) {
        charIndices.forEach((charIndex) => {
          let lineIndex = 0;
          let adjustedCharIndex = charIndex;
          const lyricLines = lyrics.slice(3);

          while (adjustedCharIndex >= lyricLines[lineIndex].length) {
            adjustedCharIndex -= lyricLines[lineIndex].length + 1;
            lineIndex++;
          }
          if (lineIndex > lyricsIndex) {
            if (position === true) {
              setLyrDisplay(groupThaiCharacters(lyricLines[lineIndex + 1]));
              setLyrDisplayBottom(groupThaiCharacters(lyricLines[lineIndex]));
            } else {
              setLyrDisplay(groupThaiCharacters(lyricLines[lineIndex]));
              setLyrDisplayBottom(
                groupThaiCharacters(lyricLines[lineIndex + 1])
              );
            }
            setLyricsIndex(lineIndex);
            setPosition(!position);
          }
          setCharIndex(adjustedCharIndex + 1);
        });
      }
    }
  };
  useEffect(() => {
    if (cursorTicks && cursorIndices) {
      const intervalId = setInterval(updateTick, 70);
      if (player.paused) {
        clearInterval(intervalId);
        return;
      }
      return () => clearInterval(intervalId);
    }
  }, [player.paused, curIdIndex, position, cursorTicks, cursorIndices]);

  useEffect(() => {
    if (lyrics.length > 0) {
      setLyrDisplay([[lyrics[0]]]);
    }
    setCurIdIndex(0);
    setCharIndex(0);
    setPosition(false);
    setLyricsIndex(0);
  }, [lyrics]);

  return (
    <div className="fixed  bottom-20 lg:bottom-16 left-0 w-full px-5 ">
      <Upload
        onSelectFile={async (file) => {
          const data = await parseEMKFile(file);
          console.log(data);
        }}
      >
        เลือก EMK FILE
      </Upload>
      <div className="text-[8px] w-64"></div>
      <div className="relative w-full h-56 lg:h-72 blur-overlay border blur-border rounded-lg p-2  text-xl md:text-3xl lg:text-6xl text-center overflow-auto [&::-webkit-scrollbar]:hidden">
        <div className="flex flex-col py-7 items-center justify-center text-white drop-shadow-lg">
          <span className="min-h-10 md:min-h-16 lg:min-h-20 flex items-center">
            <LyricsAnimation
              charIndex={position === true ? charIndex : -1}
              display={display}
            ></LyricsAnimation>
          </span>
          <br />
          <LyricsAnimation
            charIndex={position === false ? charIndex : -1}
            display={displayBottom}
          ></LyricsAnimation>
          {/* position: {JSON.stringify(position)} */}
          {/* <div className="text-sm">
            Tick:{debugTick} <br />
            ตำแหน่งอักษร: {charIndex} | {realTick} <br />
            จำนวนเนื้อเพลง:{" "}
            {JSON.stringify(
              display.map((data) => data.join("")).join("").length
            )}
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default LyricsPanel;
