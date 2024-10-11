import Button from "@/components/common/button/button";
import Upload from "@/components/common/input-data/upload";
import Label from "@/components/common/label";
import TableList from "@/components/common/table/table-list";
import { createTrackList } from "@/lib/storage/tracklist";
import React, { useEffect, useState } from "react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { FaFile, FaFileAudio, FaRegFileAudio } from "react-icons/fa";
import { TbJson } from "react-icons/tb";

interface AddSongProps {
  bufferFile: SongFiltsEncodeAndDecode[];
  onAddFile: (_: File, fileList: FileList) => void;
  onCreate: () => Promise<boolean>;
}

const AddSong: React.FC<AddSongProps> = ({
  bufferFile = [],
  onAddFile,
  onCreate,
}) => {
  const [songName, setSongName] = useState<SearchResult[]>([]);
  const [result, setResult] = useState<boolean>();
  const [loading, setLoading] = useState<boolean>(false);
  const getLyrsong = () => {
    let songlist: SearchResult[] = [];
    bufferFile.map((data) => {
      let tl = createTrackList(data, "", "");
      tl.name = `${tl.id} - ${tl.name}`;
      songlist.push(tl);
    });
    setSongName(songlist);
  };

  const handleCreateSong = async () => {
    setLoading(true);
    const res = await onCreate();
    setResult(res);
    setLoading(false);

    if (res) {
      setSongName([]);
    }
  };

  useEffect(() => {
    getLyrsong();
  }, [bufferFile]);

  return (
    <>
      <div className="w-full flex flex-col gap-2">
        <div>
          <Label>เลือกไฟล์เพลง (.emk หรือ .mid, .cur, .lyr) </Label>
          <Upload
            accept=".emk,.EMK,.mid,.MID,.cur,.CUR,.lyr,.LYR"
            className="border p-3 rounded-md hover:bg-gray-50 duration-300 flex justify-between"
            onSelectFile={onAddFile}
            inputProps={{
              multiple: true,
            }}
          >
            <span className="w-full text-sm flex items-center gap-2">
              <FaRegFileAudio></FaRegFileAudio>
              <span>อัปโหลดไฟล์</span>
            </span>
            {/* <Label>{musicFilename}</Label> */}
          </Upload>
        </div>

        {result ? (
          <div style={{ height: 270 }}>เรียบร้อย</div>
        ) : (
          <>
            <TableList
              height={250}
              listKey="add-song-file"
              renderKey="name"
              list={songName}
            ></TableList>
          </>
        )}
        <Button
          iconPosition="left"
          icon={
            loading ? (
              <AiOutlineLoading3Quarters className="animate-spin"></AiOutlineLoading3Quarters>
            ) : (
              <></>
            )
          }
          disabled={songName.length === 0}
          color="blue"
          blur={false}
          className="text-white"
          onClick={handleCreateSong}
        >
          เพิ่มเพลง
        </Button>
      </div>
    </>
  );
};

export default AddSong;
