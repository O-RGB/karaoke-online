"use client";

import React, { useEffect, useRef } from "react";
import { Sequencer } from "spessasynth_lib";
import LyricsAnimation from "../common/lyrics-animation";
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
// import EMKFileConverter from "./test";

interface LyricsPanelProps {
  player: Sequencer;
  setSongPlaying: (files: SongFilesDecode) => Promise<void>;
  lyrics: string[];
  tick: number;
  cursorTicks: number[];
  cursorIndices?: Map<number, number[]>;
}

const LyricsPanel: React.FC<LyricsPanelProps> = ({
  player,
  setSongPlaying,
  lyrics,
  tick,
  cursorTicks,
  cursorIndices,
}) => {
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

  const onSelectTestMusic = async (_: File, FileList: FileList) => {
    if (FileList.length === 1) {
      const file = FileList.item(0);
      if (!file?.name.endsWith(EMK_FILE_TYPE)) {
        return;
      }
      const decode = await parseEMKFile(file);
      if (decode.cur && decode.lyr && decode.mid) {
        var song: SongFilesDecode = {
          mid: decode.mid,
          cur: (await readCursorFile(decode.cur)) ?? [],
          lyr: await readLyricsFile(decode.lyr),
        };
        setSongPlaying(song);
      }
    } else if (FileList.length === 3) {
      const valid = validateSongFileTypes(FileList);
      if (!valid) {
        return;
      }
      var song: SongFilesDecode = {
        mid: valid.mid,
        cur: (await readCursorFile(valid.cur)) ?? [],
        lyr: await readLyricsFile(valid.lyr),
      };
      setSongPlaying(song);
    }
  };

  const renderLyricsDisplay = () => {
    const targetTick = cursorTicks[curIdIndex.current];
    if (targetTick <= tick) {
      curIdIndex.current = curIdIndex.current + 1;

      const charIndices = cursorIndices?.get(targetTick);

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
              display.current = groupThaiCharacters(lyricLines[lineIndex + 1]);
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

  return (
    <div className="fixed  bottom-20 lg:bottom-16 left-0 w-full px-5 ">
        
      <div className="flex items-center justify-center relative w-full h-56 lg:h-72  rounded-lg p-2  text-center overflow-auto [&::-webkit-scrollbar]:hidden">
        <div className="text-sm gap-2 absolute text-white text-start top-2 left-2"></div>
        <div
          className={`${
            player.paused ? "z-30 opacity-100" : "z-10 opacity-0"
          } absolute top-0 left-0 p-2 h-full flex gap-2 items-center justify-center w-full duration-300 `}
        >
          <Upload
            onSelectFile={onSelectTestMusic}
            inputProps={{
              multiple: true,
            }}
            className="relative  w-full h-full"
          >
            <Button
              blur
              border="border !border-white/20"
              shadow=""
              className={"text-white w-full h-full"}
              icon={
                <BsFileEarmarkMusic className="text-3xl text-white"></BsFileEarmarkMusic>
              }
            >
              <span>เล่นเพลง</span>
              <span className="text-sm">
                โหลดเพลงจากไฟล์ .emk, (.mid, .lyr, .cur) <br />
              </span>
            </Button>
          </Upload>
          <Button
            border="border !border-white/20"
            shadow=""
            className={"text-white w-full h-full"}
            icon={
              <BsFileEarmarkMusic className="text-3xl text-white"></BsFileEarmarkMusic>
            }
          >
            <span>ติดตั้งเพลง</span>
            <span className="text-sm">
              โหลดเพลงจาก .zip <br />
              หรือโฟลเดอร์ Karaoke <br />
            </span>
          </Button>
        </div>

        <div className="flex flex-col py-7 items-center justify-center text-white drop-shadow-lg">
          <span className="min-h-10 md:min-h-16 lg:min-h-20 flex items-center">
            <LyricsAnimation
              charIndex={position.current === true ? charIndex.current : -1}
              display={display.current}
            ></LyricsAnimation>
          </span>
          <br />
          <LyricsAnimation
            charIndex={position.current === false ? charIndex.current : -1}
            display={displayBottom.current}
          ></LyricsAnimation>
        </div>
      </div>
      {/* <EMKFileConverter></EMKFileConverter> */}
    </div>
  );
};

export default LyricsPanel;
