import Button from "@/components/common/button/button";
import Label from "@/components/common/display/label";
import FileSystemManager from "@/utils/file/file-system";
import React, { useEffect, useState } from "react";
import { BsFolder } from "react-icons/bs";
import { FaAngleRight } from "react-icons/fa";
import Input from "@/components/common/input-data/input";
import useSongsStore from "@/features/songs/store/songs.store";
import ProcessingModal from "@/components/common/processing/processing";

interface AddDBFSongProps {}

const AddDBFSong: React.FC<AddDBFSongProps> = ({}) => {
  const [name, setName] = useState<string>();
  const [progress, setProgress] = useState<IProgressBar>();
  // const [search, setSearch] = useState<DBFSongsSystemReader>();
  const songsManager = useSongsStore((state) => state.songsManager);
  // const [searchJson, setSearchJson] = useState<JSONDBSongsSystemReader>();

  // const createIndex = async () => {
  //   if (songsManager) {
  //     await songsManager?.buildIndex();
  //   }
  // };

  const onSelectFileSystem = async () => {
    const onLoadIndex = (await songsManager?.extremeFileSystem()) ?? false;
    if (!onLoadIndex) {
      await songsManager?.manager?.buildIndex(500, setProgress);
    } else {
      setProgress({
        show: true,
        title: "Tracklist Loaded!",
        progress: 100,
      });
    }
    await detectPath();
  };

  // const selectJsonFile = (file: File) => {
  //   const reader = new FileReader();

  //   reader.onload = (event) => {
  //     try {
  //       const text = event.target?.result as string;
  //       const jsonObj = JSON.parse(text);

  //       // สมมุติว่าคุณต้องการส่ง jsonObj เข้าไปใน JSONDBSongsSystemReader
  //       songsManager?.jsonFileSystem(jsonObj);

  //       console.log("Loaded JSON:", jsonObj);
  //     } catch (error) {
  //       console.error("Invalid JSON file:", error);
  //     }
  //   };

  //   reader.onerror = () => {
  //     console.error("Failed to read file:", reader.error);
  //   };

  //   reader.readAsText(file);
  // };

  const detectPath = async () => {
    const fsManager = FileSystemManager.getInstance();
    const root = fsManager.getRootHandleSync();
    if (root) {
      setName(root.name);
    }
  };

  useEffect(() => {
    detectPath();
  }, []);

  return (
    <>
      <ProcessingModal
        process={progress}
        onClose={() => {
          setProgress({ show: false });
        }}
      ></ProcessingModal>
      <div className="flex flex-col h-full">
        <div className="">
          <Label
            textSize={15}
            textColor="text-gray-800"
            headClass="bg-blue-500"
            description="อ่านตำแหน่ง Karaoke Extreme โดยตรงจากคอมพิวเตอร์ของคุณ (Google Chrome เท่านั้น)"
          >
            Import Karaoke Extreme
          </Label>
        </div>
        <img
          src="/manual/add-songs/file-system-api.png"
          className="!max-h-[200px] object-contain"
        ></img>
        <div>
          <div className="flex gap-2 items-center bg-gray-50 p-4 rounded-md">
            <Button
              iconPosition="left"
              className="text-nowrap"
              icon={<BsFolder></BsFolder>}
              color="blue"
              onClick={onSelectFileSystem}
            >
              เลือกโฟลเดอร์
            </Button>
            <div className="p-2 w-full flex gap-1 items-center text-xs">
              {name && (
                <>
                  <span>
                    <FaAngleRight></FaAngleRight>
                  </span>
                  {name}
                </>
              )}
            </div>
            {/* <Button
              className="text-nowrap bg-white"
              iconPosition="left"
              icon={<MdDeleteForever></MdDeleteForever>}
              onClick={onClearFileSystem}
            >
              ยกเลิกการเลือก
            </Button> */}
          </div>
        </div>

        {/* <UpdateFile onSelectFile={selectJsonFile}>Upload</UpdateFile> */}
        {/* <div onClick={createIndex}>load</div> */}
        {/* <Input
          onChange={async (event) => {
            const f = await songsManager?.manager?.search(event.target.value);
            console.log(f);
            const test = f?.records[0];
            console.log("test", test);
            if (test) {
              console.log("geting file");
              const file = await songsManager?.manager?.getSong(test);
              console.log(file);
            }
          }}
        ></Input> */}
      </div>
    </>
  );
};

export default AddDBFSong;
