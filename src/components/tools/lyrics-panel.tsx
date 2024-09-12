"use client";
import { groupThaiCharacters } from "@/lib/karaoke/ncn";
import { getTicks } from "@/lib/mixer";
import React, { useEffect, useState } from "react";
import { Sequencer } from "spessasynth_lib";

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
  const [lyricsIndex, setLyricsIndex] = useState<number>(0);
  const [curIdIndex, setCurIdIndex] = useState<number>(0);

  const [charIndex, setCharIndex] = useState<number>(0);

  const updateTick = () => {
    const tick = getTicks(player) ?? 0;

    const targetTick = cursorTicks[curIdIndex];
    if (targetTick <= tick) {
      setCurIdIndex((prevIndex) => prevIndex + 1);

      const charIndices = cursorIndices?.get(targetTick);
      if (charIndices) {
        charIndices.forEach((charIndex) => {
          let lineIndex = 0;
          let adjustedCharIndex = charIndex;
          const lyricLines = lyrics.slice(4);

          while (adjustedCharIndex >= lyricLines[lineIndex].length) {
            adjustedCharIndex -= lyricLines[lineIndex].length + 1;
            lineIndex++;
          }
          if (lineIndex > lyricsIndex) {
            setLyrDisplay(groupThaiCharacters(lyricLines[lineIndex]));
            setLyricsIndex(lineIndex);
          }
          setCharIndex(adjustedCharIndex + 1);
        });
      }
    }
  };
  useEffect(() => {
    if (cursorTicks && cursorIndices) {
      const intervalId = setInterval(updateTick, 100);
      if (player.paused) {
        clearInterval(intervalId);
        return;
      }
      return () => clearInterval(intervalId);
    }
  }, [player, player.currentTime, curIdIndex, cursorTicks, cursorIndices]);

  useEffect(() => {
    if (lyrics.length > 0) {
      setLyrDisplay([[lyrics[0]]]);
    }
    setCharIndex(0);
    setLyricsIndex(0);
  }, [lyrics]);

  return (
    <div className="fixed  bottom-20 lg:bottom-16 left-0 w-full px-5 ">
      <div className="text-[8px] w-64"></div>
      <div className="relative w-full h-56 lg:h-72 blur-overlay border blur-border rounded-lg p-2  text-xl md:text-3xl lg:text-6xl text-center overflow-auto [&::-webkit-scrollbar]:hidden">
        <div className="flex flex-col py-7 items-center justify-center text-white drop-shadow-lg">
          <span className="min-h-10 md:min-h-16 lg:min-h-20 flex items-center">
            <div className="flex ">
              {display.map((data, index) => {
                const lyrInx =
                  display.slice(0, index).reduce((a, b) => a + b.length, 0) + 1;
                return (
                  <div className="relative" key={`char-${index}`}>
                    <div
                      className={`absolute top-0 left-0 font-outline-4 transition-all duration-300 ${
                        lyrInx <= charIndex ? "text-white" : "text-black"
                      }`}
                    >
                      {data.join("")}
                    </div>
                    <div
                      className={`relative flex flex-col text-center transition-all duration-300`}
                      style={{
                        color: lyrInx <= charIndex ? "blue" : "yellow",
                      }}
                    >
                      <span>{data.join("")}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </span>
          {/* <br />
          charIndex: {charIndex} <br />
          length:{" "}
          {JSON.stringify(display.map((data) => data.join("")).join("").length)} */}
        </div>
      </div>
    </div>
  );
};

export default LyricsPanel;
