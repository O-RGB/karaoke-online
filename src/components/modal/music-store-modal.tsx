import React, { useEffect, useState } from "react";
import Label from "../common/display/label";
import { extractFile } from "@/lib/zip";
import SearchSelect from "../common/input-data/select/search-select";
import TableList from "../common/table/table-list";
import { toOptions } from "@/lib/general";
import Button from "../common/button/button";
import {
  getAllKeysSong,
  deleteAllSong,
  getSongByKey,
} from "@/lib/storage/song";
import SearchDropdown from "../tools/search-song/search-dropdown";
import useTracklistStore from "@/stores/tracklist/tracklist-store";

interface MusicStoreModalProps {}

const MusicStoreModal: React.FC<MusicStoreModalProps> = ({}) => {
  const searchTracklist = useTracklistStore((state) => state.searchTracklist);

  const [zipFilename, setZipFilename] = useState<ListItem<IDBValidKey>[]>([]);
  const [songs, setSongs] = useState<ListItem<File>[]>([]);
  const [songFucos, setSongFucos] = useState<string>();

  const [folderFocus, setFolderFocus] = useState<string>();
  const [unzipLoading, setUnzipLoading] = useState<boolean>(false);

  const [optionSearch, setOptionSearch] = useState<SearchResult>();

  const load = async () => {
    const res = await getAllKeysSong();
    setZipFilename(res.map((data) => ({ row: data.toString(), value: data })));
  };

  const onClickFolder = async (filename: string, notFocus: boolean = false) => {
    const res = await getSongByKey(filename);
    if (res) {
      if (res.name.endsWith(".zip")) {
        setSongs([]);
        setUnzipLoading(true);
        const unzip = await extractFile(res);
        setSongs(unzip.map((data) => ({ row: data.name, value: data })));
        setUnzipLoading(false);
        setSongFucos(undefined);
        if (notFocus === false) {
          setOptionSearch(undefined);
          setFolderFocus(filename);
        }
      }
    }
  };
  async function onSearch<T = any>(value: string) {
    const se = (await searchTracklist(value)) ?? [];
    const op = toOptions<SearchResult>({
      render: (value) => <SearchDropdown value={value}></SearchDropdown>,
      list: se,
    });
    return op as T;
  }

  const deleteAll = async () => {
    const res = await deleteAllSong();
    if (res) {
      load();
      setUnzipLoading(false);
      setSongFucos(undefined);
      setOptionSearch(undefined);
      setFolderFocus(undefined);
      setSongs([]);
    }
  };
  useEffect(() => {
    load();
  }, []);

  return (
    <div className="">
      <div className="relative pb-12 pt-2 text-black w-full">
        <div className="absolute w-full z-50">
          <SearchSelect
            optionsStyle={{
              className: "bg-white",
              itemHoverColor: "bg-white hover:bg-gray-400",
              textColor: "text-black",
            }}
            className={" z-50 !text-black"}
            onSelectItem={async (value: IOptions<SearchResult>) => {
              if (value.option) {
                setOptionSearch(value.option);
                setFolderFocus(undefined);
                setSongFucos(undefined);
                const name = value.option.fileId;
                const type = value.option.type;
                const folder = name.split("/");
                if (folder.length === 2) {
                  const folderItem: string = folder[0];
                  const songItem: string = folder[1];
                  let folderType = `${folderItem}.zip`;
                  let songType = `${songItem}.${type === 0 ? "emk" : "zip"}`;
                  await onClickFolder(folderType, true);
                  setFolderFocus(folderType);
                  setTimeout(() => {
                    setSongFucos(songType);
                  }, 1500);
                }
              }
            }}
            onSearch={onSearch}
          ></SearchSelect>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 h-full">
        {optionSearch && (
          <div className="col-span-2 md:col-span-1">
            <div className="w-full">
              <Label>ค้นหา</Label>
              <div className="p-2 border text-sm leading-7">
                <Label>เพลง :</Label> {optionSearch?.name}
                <br />
                <Label>นักร้อง :</Label> {optionSearch?.artist} <br />
                <Label>ตำแหน่ง :</Label> {optionSearch?.fileId} <br />
                <Label>ไฟล์ ID :</Label>{" "}
                <span className="uppercase">{optionSearch?.id}</span> <br />
                <Label>ประเภท :</Label>{" "}
                <span className="uppercase">
                  {optionSearch?.type === 0 ? "emk" : "ncn"}
                </span>{" "}
                <br />
              </div>
            </div>
          </div>
        )}
        <div
          className={`col-span-2 ${
            optionSearch ? "md:col-span-1" : "md:col-span-2"
          } flex gap-4 w-full overflow-hidden`}
        >
          <TableList
            scrollToItem={folderFocus}
            listKey="folder-list"
            label="รายชื่อโฟลเดอร์"
            onClickItem={(v) => onClickFolder(v)}
            list={zipFilename}
          ></TableList>
          <TableList
            scrollToItem={songFucos}
            listKey="songs-list"
            renderKey="name" // File.name
            label={`ไฟล์เพลง ${folderFocus ?? ""}`}
            onClickItem={(v) => onClickFolder(v)}
            list={songs}
            loading={unzipLoading}
          ></TableList>
        </div>
        <div className="col-span-2 ">
          {/* <Popconfirm title={"test"} description={"tewt"} onConfirm={() => {}}> */}
          <Button
            color="red"
            blur={false}
            onClick={deleteAll}
            padding={"p-1 px-3 text-white text-sm"}
          >
            ลบเพลงทั้งหมด
          </Button>
          {/* </Popconfirm> */}
        </div>
      </div>
    </div>
  );
};

export default MusicStoreModal;
