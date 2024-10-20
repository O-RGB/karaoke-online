import Label from "@/components/common/label";
import TableList from "@/components/common/table/table-list";
import SearchDropdown from "@/components/tools/search-song/search-dropdown";
import { getAllKeysSong } from "@/lib/storage/drive";
import { getTracklistTest } from "@/lib/storage/tracklist";
import useTracklistStore from "@/stores/tracklist-store";
import React, { useEffect, useState } from "react";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";

interface ExtremeTracklistProps {
  limit?: number;
}

const ExtremeTracklist: React.FC<ExtremeTracklistProps> = ({ limit = 20 }) => {
  const searchTracklist = useTracklistStore((state) => state.searchTracklist);

  const [zipFilename, setZipFilename] = useState<ListItem<SearchResult>[]>([]);
  const [songs, setSongs] = useState<ListItem<File>[]>([]);
  const [songFucos, setSongFucos] = useState<string>();

  const [folderFocus, setFolderFocus] = useState<string>();
  const [unzipLoading, setUnzipLoading] = useState<boolean>(false);

  const [optionSearch, setOptionSearch] = useState<SearchResult>();

  const [page, setPage] = useState<number>(0);

  const load = async (offset: number = 0) => {
    const res = await getTracklistTest(["EXTHEME"], limit, offset);
    setZipFilename(
      res.results.map(
        (data) =>
          ({
            row: <SearchDropdown value={data}></SearchDropdown>,
            value: data,
          } as ListItem<SearchResult>)
      )
    );
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <>
      <div className="w-full h-full flex flex-col items-end border rounded-md border-blue-500">
        <div className="flex items-center w-full bg-gray-200 p-2 rounded-t-md justify-between">
          <Label className="text-gray-700 font-bold">รายชื่อเพลง</Label>
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
          className="!rounded-b-md !border-none h-[155px] md:h-[350px]"
          height={""}
          deleteItem={false}
          scrollToItem={folderFocus}
          listKey="folder-list"
          label="รายชื่อโฟลเดอร์"
          //   onClickItem={(v) => onClickFolder(v)}
          list={zipFilename}
        ></TableList>
      </div>
    </>
  );
};

export default ExtremeTracklist;
