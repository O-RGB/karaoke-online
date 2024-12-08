import React, { useEffect, useState } from "react";
import Label from "../common/display/label";
import SwitchRadio from "../common/input-data/switch/switch-radio";
import RandomLyrics from "../lyrics/random-lyrics";
import Select from "../common/input-data/select/select";
import ColorPicker from "../common/input-data/color-picker";
import Button from "../common/button/button";
import { TbRestore } from "react-icons/tb";
import { lyricsConfig, lyricsGetFont } from "@/features/lyrics/lyrics.features";
import useConfigStore from "@/stores/config/config-store";
import { DEFAULT_CONFIG } from "@/config/value";
import { NextFont } from "next/dist/compiled/@next/font";
import InputNumber from "../common/input-data/input-number";
import ToggleCheckBox from "../common/input-data/checkbox";
import CutLyrics from "../common/lyrics/cut-lyrics/cut-lyrics";
import { SystemFont } from "@/stores/config/types/config.type";

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

  const onFontChanage = (get: SystemFont) => {
    const nextFont = lyricsGetFont(get);
    setFontState(nextFont);
  };

  return (
    <div className="flex flex-col-reverse md:flex-row gap-4 w-full md:h-[390px]">
      <div className="w-full h-full flex flex-col">
        <div className="h-full">
          <div>
            <Label className="pb-1">รูปแบบเนื้อเพลง</Label>
            <SwitchRadio<LyricsOptions>
              onChange={lyricsConfigf.setLyricsOptions}
              value={lyrics.lyricsMode}
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
          </div>

          <div
            className={`${
              lyrics.lyricsMode === "random"
                ? "pointer-events-none opacity-0"
                : ""
            } duration-300 flex flex-col gap-2 pt-2`}
          >
            <div className="flex gap-2 w-full">
              <div className="w-full">
                <Label className="pb-1">ฟอนต์</Label>
                <Select
                  defaultValue={lyrics.fontName}
                  onChange={(value) => {
                    lyricsConfigf.setFontChange(value);
                    onFontChanage(value);
                  }}
                  options={fontList}
                ></Select>
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
        <div className="pt-2">
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
          {lyrics.lyricsMode === "default" ? (
            // <LyricsAnimation
            //   activeColor={lyrics.active!}
            //   color={lyrics.color!}
            //   fontSize={
            //     lyrics.fontAuto
            //       ? "text-2xl md:text-3xl lg:text-6xl"
            //       : Number(lyrics.fontSize)
            //   }
            //   display={Example}
            //   font={FontState}
            //   fixedCharIndex={3}
            // ></LyricsAnimation>
            <CutLyrics
              preview
              activeColor={lyrics.active!}
              color={lyrics.color!}
              fontSize={
                lyrics.fontAuto
                  ? "text-2xl md:text-3xl lg:text-6xl"
                  : Number(lyrics.fontSize)
              }
              display={Example}
              font={FontState}
              fixedCharIndex={3}
            ></CutLyrics>
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

export const fontList = [
  {
    label: "เริ่มต้น",
    value: "null",
  },
  {
    label: "Noto Serif Thai",
    value: "notoSerifThai",
  },
  {
    label: "Kanit",
    value: "kanit",
  },
  {
    label: "Sarabun",
    value: "sarabun",
  },
  {
    label: "Prompt",
    value: "prompt",
  },
  {
    label: "Mitr",
    value: "mitr",
  },
  {
    label: "Pattaya",
    value: "pattaya",
  },
  {
    label: "Taviraj",
    value: "taviraj",
  },
  {
    label: "Charm",
    value: "charm",
  },
  {
    label: "Itim",
    value: "itim",
  },
  {
    label: "Pridi",
    value: "pridi",
  },
  {
    label: "Mali",
    value: "mali",
  },
  {
    label: "Sriracha",
    value: "sriracha",
  },
  {
    label: "Athiti",
    value: "athiti",
  },
  {
    label: "Trirong",
    value: "trirong",
  },
  {
    label: "KoHo",
    value: "koHo",
  },
  {
    label: "Niramit",
    value: "niramit",
  },
  {
    label: "Srisakdi",
    value: "srisakdi",
  },
  {
    label: "Chonburi",
    value: "chonburi",
  },
  {
    label: "Fahkwang",
    value: "fahkwang",
  },
  {
    label: "Kodchasan",
    value: "kodchasan",
  },
  {
    label: "Krub",
    value: "krub",
  },
  {
    label: "Charmonman",
    value: "charmonman",
  },
  {
    label: "Bai Jamjuree",
    value: "baiJamjuree",
  },
  {
    label: "Chakra Petch",
    value: "chakraPetch",
  },
  {
    label: "Thasadith",
    value: "thasadith",
  },
  {
    label: "K2D",
    value: "k2d",
  },
  {
    label: "Libre Baskerville",
    value: "libreBaskerville",
  },
];
