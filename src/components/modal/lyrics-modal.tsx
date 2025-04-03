import React, { useEffect, useState } from "react";
import Label from "../common/display/label";
import Select from "../common/input-data/select/select";
import ColorPicker from "../common/input-data/color-picker";
import Button from "../common/button/button";
import { TbRestore } from "react-icons/tb";
import { lyricsConfig } from "@/features/lyrics/lib/lyrics.features";
import useConfigStore from "@/features/config/config-store";
import { DEFAULT_CONFIG } from "@/config/value";
import { NextFont } from "next/dist/compiled/@next/font";
import InputNumber from "../common/input-data/input-number";
import ToggleCheckBox from "../common/input-data/checkbox";

import { SystemFont } from "@/features/config/types/config.type";
import LyricsCharacter from "../../features/lyrics/components/lyrics-character";
import Tabs from "../common/tabs";

interface LyricsModalProps {}

const LyricsModal: React.FC<LyricsModalProps> = ({}) => {
  const setConfig = useConfigStore((state) => state.setConfig);
  const lyrics =
    useConfigStore((state) => state.config.lyrics) ?? DEFAULT_CONFIG.lyrics;
  const lyricsConfigf = lyricsConfig(setConfig);

  const EX = [["ตั"], ["ว"], ["อ"], ["ย่"], ["า"], ["ง"]];
  const [Example, setExample] = useState<string[][]>(EX);
  const [FontState, setFontState] = useState<NextFont>();

  const updateAnimtaion = () => {
    setExample([]);
    setTimeout(() => {
      setExample(EX);
    }, 100);
  };

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;

    if (lyrics.lyricsMode === "random") {
      interval = setInterval(() => {
        updateAnimtaion();
      }, 3000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [lyrics.lyricsMode]);

  const onFontChanage = (get: SystemFont) => {};

  return (
    <div className="flex flex-col-reverse md:flex-row gap-4 w-full h-full">
      <div className="w-full h-full flex flex-col ">
        <div className="h-full">
          <div
            className={`${
              lyrics.lyricsMode === "random"
                ? "pointer-events-none opacity-0"
                : ""
            } duration-300 flex flex-col gap-2 pt-2`}
          >
            <div className="flex gap-2 w-full">
              <div className="w-full pointer-events-none opacity-40">
                <Label className="pb-1">ฟอนต์</Label>
                <Select
                  defaultValue={lyrics.fontName}
                  onChange={(value) => {
                    lyricsConfigf.setFontChange(value);
                    onFontChanage(value);
                  }}
                  // options={fontList}
                ></Select>
                <span className="text-xs text-gray-500">
                  *เกิดปัญหาการเรียกใช้ Font Admin ขอปิดการใช้งานไปก่อน
                </span>
              </div>

              <div className="w-20">
                <Label className="pb-1">ขนาด</Label>
                <InputNumber
                  disabled={lyrics.fontAuto}
                  onChange={(x) => {
                    const value = x.target.value;
                    lyricsConfigf.setFontSize(value);
                  }}
                  value={lyrics.fontSize ?? 30}
                ></InputNumber>
              </div>
              <div className="w-10 h-full">
                <Label className="pb-1">ออโต้</Label>
                <div className="flex justify-center items-center pl-2 h-8 rounded-md">
                  <ToggleCheckBox
                    defaultChecked={lyrics.fontAuto}
                    onChange={lyricsConfigf.setFontAuto}
                  ></ToggleCheckBox>
                </div>
              </div>
            </div>

            <div>
              <Label className="pb-1">สีเนื้อเพลง</Label>
              <span className="flex gap-2">
                <span className="flex gap-1 justify-center items-center border p-2 rounded-md">
                  <Label className="pb-1">สีตัวอักษร</Label>
                  <ColorPicker
                    onChange={lyricsConfigf.setLyricsColor}
                    value={lyrics.color?.color}
                  ></ColorPicker>
                </span>
                <span className="flex gap-1 justify-center items-center border p-2 rounded-md">
                  <Label className="pb-1">สีขอบ</Label>
                  <ColorPicker
                    onChange={lyricsConfigf.setLyricsActiveColor}
                    value={lyrics.active?.color}
                  ></ColorPicker>
                </span>
              </span>
            </div>
            <div>
              <Label className="pb-1">สีปาดเนื้อร้อง</Label>
              <span className="flex gap-2">
                <span className="flex gap-1 justify-center items-center border p-2 rounded-md">
                  <Label className="pb-1">สีตัวอักษร</Label>
                  <ColorPicker
                    onChange={lyricsConfigf.setLyricsColorBorder}
                    value={lyrics.color?.colorBorder}
                  ></ColorPicker>
                </span>
                <span className="flex gap-1 justify-center items-center border p-2 rounded-md">
                  <Label className="pb-1">สีขอบ</Label>
                  <ColorPicker
                    onChange={lyricsConfigf.setLyricsActiveBorderColor}
                    value={lyrics.active?.colorBorder}
                  ></ColorPicker>
                </span>
              </span>
            </div>
          </div>
        </div>
        <div className="pt-4">
          <Button
            onClick={lyricsConfigf.reset}
            blur={false}
            shadow={""}
            color="default"
            padding={"p-1 px-2"}
            className="text-xs gap-[3px] "
            icon={<TbRestore></TbRestore>}
            iconPosition="left"
          >
            คืนค่าเริ่มต้น
          </Button>
        </div>
      </div>

      <div className="w-full relative p-2 border rounded-md bg-blue-400">
        <div className="flex w-full h-20 md:h-full items-center justify-center">
          <LyricsCharacter
            clip={50}
            lyr={"ตัวอย่าง"}
            activeColor={lyrics.active!}
            color={lyrics.color!}
            fontSize={
              lyrics.fontAuto
                ? "text-2xl md:text-3xl lg:text-6xl"
                : Number(lyrics.fontSize)
            }
            font={FontState}
          ></LyricsCharacter>
        </div>
      </div>
    </div>
  );
};

export default LyricsModal;
