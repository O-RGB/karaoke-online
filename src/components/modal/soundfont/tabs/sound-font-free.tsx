import Button from "@/components/common/button/button";
import Label from "@/components/common/display/label";
import TableList from "@/components/common/table/table-list";
import React, { useEffect } from "react";
import { BiDownload } from "react-icons/bi";
import { useDownloadWithProgress } from "@/lib/fetch/fetch-lib";
import { FaCircleCheck } from "react-icons/fa6";
import { SoundfontPlayerManager } from "@/utils/indexedDB/db/player/table";
import { ISoundfontPlayer } from "@/utils/indexedDB/db/player/types";

interface SoundfontFreeProps {
  soundFontStorage: ListItem<File>[];
  getSoundFontList: () => Promise<ListItem<File>[]>;
}
const soundfont = new SoundfontPlayerManager();

const SoundfontFree: React.FC<SoundfontFreeProps> = ({
  soundFontStorage,
  getSoundFontList,
}) => {
  const freeSoundfonts = [
    {
      name: "FluidR3 GM",
      size: "141 MB",
      downloadUrl: "https://files.catbox.moe/e9ecb6.sf2",
    },
    {
      name: "แสงเทียนมิวสิค 4.2 ST_Old",
      size: "167 MB",
      downloadUrl: "https://files.catbox.moe/6bcc4b.sf2",
    },
    {
      name: "ตัวเล็กเสียงดี pond_C-class",
      size: "17 MB",
      downloadUrl: "https://files.catbox.moe/nvzrn3.sf2",
    },
    {
      name: "SF2ThailandOnly-V1- Std",
      size: "202 MB",
      downloadUrl: "https://files.catbox.moe/wjdfh2.sf2",
    },
  ];

  const handleDownload = async (value: string, fileName: string) => {
    const download = await useDownloadWithProgress(value, fileName);
    if (download) {
      await soundfont.add({ file: download, createdAt: new Date() });
      getSoundFontList();
    }
  };

  const soundfontListItems: ListItem<string>[] = freeSoundfonts.map((font) => ({
    label: font.name,
    value: font.downloadUrl,
  }));

  useEffect(() => {}, [soundFontStorage]);
  return (
    <>
      <div className="flex flex-col gap-2 w-full h-full">
        <Label
          textSize={15}
          textColor="text-gray-800"
          headClass="bg-blue-500"
          description={
            <span>ดาวน์โหลด Soundfont ฟรีคุณภาพสูงเพื่อใช้ในการเล่นดนตรี</span>
          }
        >
          Soundfont ฟรีแจกจากอินเตอร์เน็ต
        </Label>

        <TableList
          hoverFocus={false}
          listKey={"id"}
          deleteItem={false}
          list={soundfontListItems}
          itemAction={(value, index, option) => {
            const isDownloaded = soundFontStorage.find(
              (v) => v.label === option?.value
            );
            return (
              <>
                <Button
                  padding=""
                  disabled={!!isDownloaded}
                  className="w-7 h-7"
                  onClick={() =>
                    !isDownloaded
                      ? handleDownload(value, option.label as string)
                      : undefined
                  }
                  color="default"
                  blur={false}
                  icon={
                    isDownloaded ? (
                      <FaCircleCheck className="text-green-500"></FaCircleCheck>
                    ) : (
                      <BiDownload />
                    )
                  }
                  iconPosition="left"
                />
              </>
            );
          }}
        />
      </div>
    </>
  );
};

export default SoundfontFree;
