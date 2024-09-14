"use client";
import { getTicks, groupThaiCharacters } from "@/lib/app-control";
import React, { useEffect, useState } from "react";
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

interface LyricsPanelProps {
  player: Sequencer;
  lyrics: string[];
  cursorIndices?: Map<number, number[]>;
  cursorTicks?: number[];
  setSongPlaying: (files: SongFilesDecode) => Promise<void>;
}

const LyricsPanel: React.FC<LyricsPanelProps> = ({
  player,
  lyrics,
  cursorIndices,
  cursorTicks = [],
  setSongPlaying,
}) => {
  const [display, setLyrDisplay] = useState<string[][]>([[]]);
  const [displayBottom, setLyrDisplayBottom] = useState<string[][]>([[]]);
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

  return (
    <div className="fixed  bottom-20 lg:bottom-16 left-0 w-full px-5 ">
      <div className="text-[8px] w-64"></div>
      <div className="flex items-center justify-center relative w-full h-56 lg:h-72 blur-overlay border blur-border rounded-lg p-2  text-center overflow-auto [&::-webkit-scrollbar]:hidden">
        {player.paused && <div className="absolute top-0 left-0 p-2 h-full flex gap-2 items-center justify-center z-30">
          <Upload
            onSelectFile={onSelectTestMusic}
            inputProps={{
              multiple: true,
            }}
            accept=".emk, .mid, .lyr, .cur"
            className="relative flex w-full h-full"
          >
            <Button
              border="border !border-white/20"
              shadow=""
              className={"text-white w-full h-full"}
              icon={
                <BsFileEarmarkMusic className="text-3xl text-white"></BsFileEarmarkMusic>
              }
            >
              <span>เล่นเพลง</span>
              <span className="text-sm text-gray-400">
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
            <span className="text-sm text-gray-400">
              โหลดเพลงจาก .zip <br />
              หรือโฟลเดอร์ Karaoke <br />
            </span>
          </Button>
        </div>}
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
