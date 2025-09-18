import Label from "../../../common/display/label";
import Select from "../../../common/input-data/select/select";
import ColorPicker from "../../../common/input-data/color-picker";
import Button from "../../../common/button/button";
import useConfigStore from "@/features/config/config-store";
import Upload from "../../../common/input-data/upload";
import InputNumber from "../../../common/input-data/input-number";
import ToggleCheckBox from "../../../common/input-data/checkbox";
import React, { useEffect, useState } from "react";
import { TbRestore } from "react-icons/tb";
import { lyricsConfig } from "@/features/lyrics/lib/lyrics.features";
import { DEFAULT_CONFIG } from "@/config/value";
import { NextFont } from "next/dist/compiled/@next/font";
import { FaUpload } from "react-icons/fa";
import { FontDisplayManager } from "@/utils/indexedDB/db/display/table";
import { AiFillDelete } from "react-icons/ai";
import { IAlertCommon } from "../../../common/alert/types/alert.type";
import LyricsCharacter from "@/features/lyrics/character";

interface LyricsModalProps extends IAlertCommon {}

const LyricsModal: React.FC<LyricsModalProps> = ({ setAlert }) => {
  const fontDisplayManager = new FontDisplayManager();
  const setConfig = useConfigStore((state) => state.setConfig);
  const lyrics =
    useConfigStore((state) => state.config.lyrics) ?? DEFAULT_CONFIG.lyrics;
  const lyricsConfigf = lyricsConfig(setConfig);

  const [fontList, setFontList] = useState<ListItem<string>[]>([]);

  const EX = [["ตั"], ["ว"], ["อ"], ["ย่"], ["า"], ["ง"]];
  const [Example, setExample] = useState<string[][]>(EX);
  const [FontState, setFontState] = useState<NextFont>();

  const [fontUrl, setFontUrl] = useState<string>();

  const onUploadFont = async (file: File) => {
    const find = await fontDisplayManager.find(
      (item) => item.file.name === file.name
    );
    if (find.length > 0) {
      setAlert?.({
        title: "มีไฟล์นี้ในระบบแล้ว",
        description: "คุณสามารถเลือก Font เพื่อเปลี่ยนได้เลย",
        variant: "warning",
      });
      return;
    }
    await fontDisplayManager.add({ file });
    await getAllFont();
    const url = URL.createObjectURL(file);
    setFontUrl(url);

    setAlert?.({
      title: "อัปโหลด Font เรียบร้อย",
      description: "คุณสามารถเลือก Font เพื่อเปลี่ยนได้เลย",
      variant: "success",
    });
  };

  const getAllFont = async () => {
    const response = await fontDisplayManager.getAll();

    const list: ListItem<string>[] = [];
    list.push({
      value: "",
      label: "ค่าเริ่มต้น",
    });

    list.push(
      ...response.map((data) => {
        return {
          value: String(data.id),
          label: `${data.file.name}`,
        };
      })
    );

    setFontList(list);
  };

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

    getAllFont();

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [lyrics.lyricsMode]);

  const onFontChanage = async (value: string) => {
    setConfig({ lyrics: { fontName: value as string } });

    if (value === "") {
      setFontUrl(undefined);
      return;
    }
    const font = await fontDisplayManager.get(Number(value));
    if (font) {
      const url = URL.createObjectURL(font.file);
      setFontUrl(url);
    }
  };

  return (
    <div className="flex flex-col-reverse md:flex-row gap-4 h-full">
      {fontUrl && (
        <style>
          {`
            @font-face {
              font-family: 'customFont';
              src: url(${fontUrl}) format('truetype');
            }
          `}
        </style>
      )}

      <div className="w-full h-full flex flex-col ">
        <div className="h-full">
          <div className={`duration-300 flex flex-col gap-2 pt-2`}>
            <div className="rounded-md p-4 border border-gray-200 space-y-2">
              <div className="w-full space-y-2">
                <div className="flex gap-2">
                  <div>
                    <Label className="pb-1">ฟอนต์</Label>
                    <Upload onSelectFile={onUploadFont}>
                      <Button
                        color="blue"
                        icon={<FaUpload></FaUpload>}
                        iconPosition="left"
                        shadow=""
                        border=""
                        className="h-[34px] text-nowrap"
                      >
                        อัปโหลดฟอนต์
                      </Button>
                    </Upload>
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

                <div className="flex gap-2 w-full">
                  <div className="w-full">
                    <Select
                      className="w-full"
                      defaultValue={lyrics.fontName}
                      onChange={(value) => {
                        onFontChanage(value as string);
                      }}
                      options={fontList}
                    ></Select>
                  </div>
                  {lyrics.fontName !== undefined && (
                    <div>
                      <Button
                        color="red"
                        icon={<AiFillDelete></AiFillDelete>}
                        iconPosition="left"
                        className="h-[34px] text-nowrap"
                      >
                        ลบ
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-md p-4 border border-gray-200 space-y-2">
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
        <div
          style={{ fontFamily: fontUrl ? "customFont" : "sans-serif" }}
          className="flex w-full h-20 md:h-full items-center justify-center"
        >
          <LyricsCharacter
            clip={50}
            text="ตัวอย่าง"
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
