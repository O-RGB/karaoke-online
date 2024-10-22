import SwitchRadio from "@/components/common/input-data/switch/switch-radio";
import React, { useState } from "react";
import ExtremeMusic from "./extreme-music";
import TracklistDatabaseList from "../../common-datastores/tracklist-database-list";

interface ExtremeDataStoreProps {}

const ExtremeDataStore: React.FC<ExtremeDataStoreProps> = ({}) => {
  const [redioChange, setRadioChange] = useState<string>("FILE");

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between">
        <SwitchRadio
          onChange={setRadioChange}
          options={[
            {
              value: "FILE",
              children: "ไฟล์เพลง",
            },
            {
              value: "TRACKLIST",
              children: "รายชื่อเพลง",
            },
          ]}
        ></SwitchRadio>
      </div>

      {redioChange === "FILE" ? (
        <ExtremeMusic></ExtremeMusic>
      ) : (
        <TracklistDatabaseList
          tracklistStores={["EXTHEME"]}
          limit={10}
        ></TracklistDatabaseList>
      )}

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
      {/* <div className="w-full h-full flex flex-col md:flex-row  gap-2 ">

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
            className="!rounded-b-md !border-none h-[155px] md:h-[350px]"
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
            className="!rounded-b-md !border-none h-[155px] md:h-[350px]"
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
      </div> */}
    </div>
  );
};

export default ExtremeDataStore;
