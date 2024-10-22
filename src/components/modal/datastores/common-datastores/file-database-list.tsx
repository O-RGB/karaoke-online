import Label from "@/components/common/label";
import TableList from "@/components/common/table/table-list";
import { extractFile } from "@/lib/zip";
import React, { useEffect, useState } from "react";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";

interface FileDatabaseListProps {
  limit: number;
  onLoading?: (load: boolean) => void;
  extracted?: (files: File[]) => void;
  getKeysDatabase: (limit: number, offset: number) => Promise<IDBValidKey[]>;
  getFileByKey: (key: string) => Promise<File | undefined>;
  label?: string;
}

const FileDatabaseList: React.FC<FileDatabaseListProps> = ({
  limit = 20,
  onLoading,
  extracted,
  getKeysDatabase,
  getFileByKey,
  label,
}) => {
  const [zipSelected, setZipSelected] = useState<ListItem<IDBValidKey>[]>([]);

  const [folderFocus, setFolderFocus] = useState<string>();
  const [page, setPage] = useState<number>(0);

  const load = async (offset: number = 0) => {
    const res = await getKeysDatabase?.(limit, offset);
    setZipSelected(res.map((data) => ({ row: data, value: data })));
  };

  const onClickFolder = async (filename: string, notFocus: boolean = false) => {
    const res = await getFileByKey?.(filename);
    if (res) {
      if (res.name.endsWith(".zip")) {
        onLoading?.(true);
        const unzip = await extractFile(res);
        extracted?.(unzip);
        onLoading?.(false);
        if (notFocus === false) {
          setFolderFocus(filename);
        }
      }
    }
  };

  useEffect(() => {
    load();
  }, []);
  return (
    <>
      <div className="flex items-center w-full bg-gray-200 p-2 rounded-t-md justify-between">
        <Label className="text-gray-700 font-bold">{label}</Label>
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
        onClickItem={(v) => onClickFolder(v)}
        list={zipSelected}
      ></TableList>
    </>
  );
};

export default FileDatabaseList;
