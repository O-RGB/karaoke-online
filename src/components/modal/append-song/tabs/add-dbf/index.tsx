import Button from "@/components/common/button/button";
import Label from "@/components/common/display/label";
import FileSystemManager from "@/utils/file/file-system";
import React, { useEffect, useState } from "react";

import { BsFolder } from "react-icons/bs";
import { FaAngleRight } from "react-icons/fa";
import Input from "@/components/common/input-data/input";
import { SearchEngine } from "@/lib/karaoke/dbf/search-engine";

interface AddDBFSongProps {}

const AddDBFSong: React.FC<AddDBFSongProps> = ({}) => {
  const dbfPath = "Data/SONG.DBF";
  const [name, setName] = useState<string>();
  const [progress, setProgress] = useState<IProgressBar>();
  const [search, setSearch] = useState<SearchEngine>();

  const createIndex = async (file: File) => {
    search?.buildIndex();
    search?.loadIndex();
  };

  const onSelectFileSystem = async () => {
    const fsManager = FileSystemManager.getInstance();
    const root = await fsManager.selectDirectory();
    const name = root.name;
    setName(name);

    const getDbf = await fsManager.getFileByPath(dbfPath);

    if (getDbf.name.endsWith(".DBF")) {
      createIndex(getDbf);
    }
  };

  const onClearFileSystem = async () => {
    const fsManager = FileSystemManager.getInstance();
    await fsManager.clearDirectory();
    setName(undefined);
  };

  const isDirectoryLoaded = async () => {
    const fsManager = FileSystemManager.getInstance();
    const root = await fsManager.getRootHandle();
    const name = root.name;
    setName(name);
  };

  useEffect(() => {
    setSearch(new SearchEngine(FileSystemManager.getInstance(), dbfPath));
    isDirectoryLoaded();
  }, []);

  return (
    <>
      {/* <ProcessingModal
        process={progress}
        onClose={() => {
          setProgress({ show: false });
        }}
      ></ProcessingModal>
      <UpdateFile onSelectFile={onSelectDBF}>Upload</UpdateFile> */}
      <div className="flex flex-col h-full">
        <div className="">
          <Label
            textSize={15}
            textColor="text-gray-800"
            headClass="bg-blue-500"
            description="อ่านตำแหน่ง Karaoke Extreme โดยตรงจากคอมพิวเตอร์ของคุณ"
          >
            Import Karaoke Extreme
          </Label>
        </div>
        <div>
          <div className="flex gap-2 items-center bg-gray-50 p-4 rounded-md">
            <Button
              iconPosition="left"
              className="text-nowrap !bg-white"
              icon={<BsFolder></BsFolder>}
              color="white"
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
        <Input
          onChange={async (event) => {
            const value = event.target.value;
            const f = await search?.search(value);
            console.log(f);
          }}
        ></Input>
      </div>
    </>
  );
};

export default AddDBFSong;
