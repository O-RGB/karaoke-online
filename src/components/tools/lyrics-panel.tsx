"use client";

import React from "react";
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
  setSongPlaying: (files: SongFilesDecode) => Promise<void>;
  displayLyrics?: DisplayLyrics;
}

const LyricsPanel: React.FC<LyricsPanelProps> = ({
  player,
  setSongPlaying,
  displayLyrics,
}) => {
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

        {displayLyrics && (
          <div className="flex flex-col py-7 items-center justify-center text-white drop-shadow-lg">
            <span className="min-h-10 md:min-h-16 lg:min-h-20 flex items-center">
              <LyricsAnimation
                charIndex={
                  displayLyrics.position === true ? displayLyrics.charIndex : -1
                }
                display={displayLyrics.display}
              ></LyricsAnimation>
            </span>
            <br />
            <LyricsAnimation
              charIndex={
                displayLyrics.position === false ? displayLyrics.charIndex : -1
              }
              display={displayLyrics.displayBottom}
            ></LyricsAnimation>
          </div>
        )}
      </div>
    </div>
  );
};

export default LyricsPanel;
