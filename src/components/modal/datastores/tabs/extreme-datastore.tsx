import Button from "@/components/common/button/button";
import Label from "@/components/common/label";
import TableList from "@/components/common/table/table-list";
import SearchDropdown from "@/components/tools/search-song/search-dropdown";
import { toOptions } from "@/lib/general";
import { getAllKeysSong, deleteAllSong } from "@/lib/storage/drive";
import { getSongByKey } from "@/lib/storage/song";
import { extractFile } from "@/lib/zip";
import useTracklistStore from "@/stores/tracklist-store";
import React, { useEffect, useState } from "react";
import { FaDownload } from "react-icons/fa";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";

interface ExtremeDataStoreProps {}

const ExtremeDataStore: React.FC<ExtremeDataStoreProps> = ({}) => {
  const limit = 20;
  const searchTracklist = useTracklistStore((state) => state.searchTracklist);

  const [zipFilename, setZipFilename] = useState<ListItem<IDBValidKey>[]>([]);
  const [songs, setSongs] = useState<ListItem<File>[]>([]);
  const [songFucos, setSongFucos] = useState<string>();

  const [folderFocus, setFolderFocus] = useState<string>();
  const [unzipLoading, setUnzipLoading] = useState<boolean>(false);

  const [optionSearch, setOptionSearch] = useState<SearchResult>();

  const [page, setPage] = useState<number>(0);

  const load = async (offset: number = 0) => {
    const res = await getAllKeysSong(limit, offset);
    setZipFilename(res.map((data) => ({ row: data, value: data })));
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
    <>
      {/* <div className="relative pb-12 pt-2 text-black w-full">
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
                  console.log(await findLimitOffsetByKey(folderType, 10));
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
      </div> */}

      <div className="w-full h-full flex flex-col md:flex-row  gap-2 ">
        {/* {optionSearch && (
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
        )} */}

        <div className="w-full h-full flex flex-col items-end border rounded-md border-blue-500">
          <div className="flex items-center w-full bg-gray-200 p-2 rounded-t-md justify-between">
            <Label className="text-gray-700 font-bold">กลุ่มเพลง</Label>
            <div className="flex items-center justify-center gap-2 text-xs">
              <IoIosArrowBack
                className="cursor-pointer"
                onClick={() => {
                  setPage((value) => {
                    if (value - 1 <= 0) {
                      return 0;
                    } else {
                      return value - 1;
                    }
                  });
                  load((page - 1) * limit);
                }}
              ></IoIosArrowBack>
              <span className="min-w-5 text-center"> {page + 1}</span>
              <IoIosArrowForward
                className="cursor-pointer"
                onClick={() => {
                  setPage((value) => value + 1);
                  load((page + 1) * limit);
                }}
              ></IoIosArrowForward>
            </div>
          </div>
          <TableList
            className="!rounded-b-md !border-none h-[170px] md:h-[385px]"
            height={""}
            deleteItem={false}
            scrollToItem={folderFocus}
            listKey="folder-list"
            label="รายชื่อโฟลเดอร์"
            onClickItem={(v) => onClickFolder(v)}
            list={zipFilename}
          ></TableList>
        </div>
        <div className="w-full h-full flex flex-col items-end border rounded-md border-blue-500">
          <div className="flex items-center w-full bg-gray-200 p-2 rounded-t-md justify-between">
            <Label className="text-gray-700 font-bold">ไฟล์เพลง</Label>
          </div>
          <TableList
            className="!rounded-b-md !border-none h-[170px] md:h-[385px]"
            height={""}
            deleteItem={false}
            itemAction={(file: File, index: number) => {
              return (
                <Button
                  shadow={false}
                  border={""}
                  onClick={() => {
                    const url = URL.createObjectURL(file);
                    const link = document.createElement("a");
                    link.href = url;
                    link.download = file.name;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                  }}
                  padding=""
                  className="w-7 h-7"
                  color="blue"
                  blur={false}
                  icon={<FaDownload className="text-white"></FaDownload>}
                ></Button>
              );
            }}
            scrollToItem={songFucos}
            listKey="songs-list"
            renderKey="name"
            label={`ไฟล์เพลง ${folderFocus ?? ""}`}
            onClickItem={(v) => onClickFolder(v)}
            list={songs}
            loading={unzipLoading}
          ></TableList>
        </div>
      </div>
    </>
  );
};

export default ExtremeDataStore;
