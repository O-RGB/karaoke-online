import Label from "@/components/common/display/label";
import Upload from "@/components/common/input-data/upload";
import ProcessingModal from "@/components/common/processing/processing";
import React, { useState } from "react";
import { loadKaraokeTracks } from "@/lib/karaoke/read";
import { FaRegFileAudio } from "react-icons/fa";
import TableList from "@/components/common/table/table-list";
import { KaraokeDecoded } from "@/features/songs/types/songs.type";
import Tags from "@/components/common/display/tags";
import Button from "@/components/common/button/button";
import { RiDeleteBin5Line } from "react-icons/ri";

interface AddSongCount {
  length: number;
  error: number;
  duplicate: number;
}
interface AddUserSongProps {}

const AddUserSong: React.FC<AddUserSongProps> = ({}) => {
  const [progress, setProgress] = useState<IProgressBar>();
  const [decoded, setDecoded] = useState<ListItem<KaraokeDecoded>[]>([]);
  const [soundCount, setSoundCount] = useState<AddSongCount>({
    length: 0,
    error: 0,
    duplicate: 0,
  });

  const onAddFile = async (_: File, filelist: FileList) => {
    if (filelist.length === 0) return;
    const decoded = await loadKaraokeTracks(filelist);

    const errors: typeof decoded = [];
    const valids: typeof decoded = [];
    let errorCount = 0;
    let duplicateCount = 0;

    for (const item of decoded) {
      if (item.error) {
        errors.push(item);
        errorCount++;
      } else {
        valids.push(item);
      }
      //   if (item.duplicate) duplicateCount++;
    }

    const sortedDecoded = [...errors, ...valids];
    setSoundCount({
      length: decoded.length,
      error: errorCount,
      duplicate: duplicateCount,
    });

    let listItem: ListItem<KaraokeDecoded>[] = sortedDecoded.map((x) => {
      let name: string | string[] = x.lyr as string[];
      if (name.length > 0) name = name[0];
      if (x.error) name = "ไม่สามารถอ่านไฟล์";
      return {
        row: (
          <div className="w-fit flex gap-2">
            {x.fileName && (
              <Tags color={x.error ? "red" : "green"} className="text-[10px]">
                {x.fileName}
              </Tags>
            )}
            {name}
          </div>
        ),
        value: x,
        className: x.error ? "text-red-500" : "",
      };
    });

    setDecoded(listItem);
  };

  return (
    <>
      <ProcessingModal
        process={progress}
        onClose={() => {
          setProgress({ show: false });
        }}
      ></ProcessingModal>
      <div className="flex flex-col h-full gap-1.5">
        <div className="flex flex-col gap-1">
          <Label>เลือกไฟล์เพลง (.emk หรือ .mid, .cur, .lyr) </Label>
          <Upload
            // accept=".emk,application/octet-stream,.cur,application/octet-stream,.lyr,text/plain,.mid,audio/midi"
            className="border border-blue-500 p-3 rounded-md   hover:bg-gray-50 duration-300 flex justify-between"
            onSelectFile={onAddFile}
            inputProps={{
              multiple: true,
            }}
          >
            <span className="w-full text-sm flex items-center gap-2">
              <FaRegFileAudio className="text-blue-500"></FaRegFileAudio>
              <span>อัปโหลดไฟล์เพลง</span>
            </span>
          </Upload>
        </div>
        <div className="flex gap-4">
          <Label headClass="bg-gray-300">ทั้งหมด: {soundCount.length}</Label>
          <Label headClass="bg-green-500">
            อ่าน: {soundCount.length - soundCount.error}
          </Label>
          <Label headClass="bg-red-500">ผิดพลาด: {soundCount.error}</Label>
          <Label headClass="bg-yellow-500">ซ้ำ: {soundCount.duplicate}</Label>
        </div>

        <TableList
          listKey="add-song-file"
          list={decoded}
          //   onDeleteItem={removeItem}
          deleteItem={false}
          itemAction={(value: KaraokeDecoded) =>
            !value.error && (
              <Button
                shadow={false}
                border={""}
                // onClick={removeItem}
                padding=""
                className="w-7 h-7"
                color="red"
                blur={false}
                icon={<RiDeleteBin5Line className="text-white" />}
              ></Button>
            )
          }
        ></TableList>
      </div>
    </>
  );
};

export default AddUserSong;
