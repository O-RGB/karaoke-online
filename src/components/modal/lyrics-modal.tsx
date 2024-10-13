import React, { useEffect, useState } from "react";
import { useLyrics } from "@/hooks/lyrics-hook";
import LyricsAnimation from "../common/lyrics/cut-lyrics/cut-animation";
import Label from "../common/label";
import SwitchRadio from "../common/input-data/switch/switch-radio";
import RandomLyrics from "../lyrics/random-lyrics";
import Select from "../common/input-data/select/select";
import ColorPicker from "../common/input-data/color-picker";
import Button from "../common/button/button";
import { TbRestore } from "react-icons/tb";

interface LyricsModalProps {}

const LyricsModal: React.FC<LyricsModalProps> = ({}) => {
  const EX = [["ตั"], ["ว"], ["อ"], ["ย่"], ["า"], ["ง"]];
  const [Example, setExample] = useState<string[][]>(EX);
  const {
    setLyricsOptions,
    lyricsDisplay,
    setFontChange,
    FontName,
    Color,
    ColorBorder,
    ActiveColor,
    ActiveBorderColor,
    setLyricsColor,
    setLyricsActiveBorderColor,
    setLyricsActiveColor,
    setLyricsColorBorder,
    reset,
  } = useLyrics();

  const updateAnimtaion = () => {
    setExample([]);
    setTimeout(() => {
      setExample(EX);
    }, 100);
  };

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;

    if (lyricsDisplay === "random") {
      interval = setInterval(() => {
        updateAnimtaion();
      }, 3000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [lyricsDisplay]);

  return (
    <div className="flex flex-col-reverse md:flex-row gap-4 w-full md:h-[390px]">
      <div className="w-full h-full flex flex-col">
        <div className="h-full">
          <Label>รูปแบบเนื้อเพลง</Label>
          <SwitchRadio<LyricsOptions>
            onChange={setLyricsOptions}
            value={lyricsDisplay}
            options={[
              {
                children: "เริ่มต้น",
                value: "default",
              },
              {
                children: "เคลื่อนไหว",
                value: "random",
              },
            ]}
          ></SwitchRadio>

          <div
            className={`${
              lyricsDisplay === "random" ? "pointer-events-none opacity-0" : ""
            } duration-300`}
          >
            <Label>ฟอนต์</Label>
            <br />

            <Select
              defaultValue={FontName}
              onChange={setFontChange}
              options={[
                {
                  value: "notoSansThaiLooped",
                  label: "Noto_Sans_Thai_Looped",
                },
                {
                  value: "inter",
                  label: "Inter",
                },
                {
                  value: "krub",
                  label: "Krub",
                },
                {
                  value: "roboto",
                  label: "Roboto",
                },
                {
                  value: "lora",
                  label: "Lora",
                },
              ]}
            ></Select>
          </div>
          <div
            className={`${
              lyricsDisplay === "random" ? "pointer-events-none opacity-0" : ""
            } duration-300`}
          >
            <Label>สีเนื้อเพลง</Label>
            <br />
            <span className="flex gap-2">
              <span className="flex gap-1 justify-center items-center border p-2 rounded-md">
                <Label className="pb-1">สีตัวอักษร</Label>
                <ColorPicker
                  onChange={setLyricsColor}
                  value={Color}
                ></ColorPicker>
              </span>
              <span className="flex gap-1 justify-center items-center border p-2 rounded-md">
                <Label className="pb-1">สีขอบ</Label>
                <ColorPicker
                  onChange={setLyricsActiveColor}
                  value={ActiveColor}
                ></ColorPicker>
              </span>
            </span>
            <Label>สีปาดเนื้อร้อง</Label>
            <br />
            <span className="flex gap-2">
              <span className="flex gap-1 justify-center items-center border p-2 rounded-md">
                <Label className="pb-1">สีตัวอักษร</Label>
                <ColorPicker
                  onChange={setLyricsColorBorder}
                  value={ColorBorder}
                ></ColorPicker>
              </span>
              <span className="flex gap-1 justify-center items-center border p-2 rounded-md">
                <Label className="pb-1">สีขอบ</Label>
                <ColorPicker
                  onChange={setLyricsActiveBorderColor}
                  value={ActiveBorderColor}
                ></ColorPicker>
              </span>
            </span>
          </div>
        </div>
        <div className="">
          <Button
            onClick={reset}
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
          {lyricsDisplay === "default" ? (
            <LyricsAnimation
              fontSize="text-4xl"
              display={Example}
              charIndex={3}
            ></LyricsAnimation>
          ) : (
            <div className="pt-12">
              <RandomLyrics
                position={Example.length !== 0}
                display={Example}
                displayBottom={Example}
              ></RandomLyrics>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LyricsModal;
