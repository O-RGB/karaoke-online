import React, { useEffect, useState } from "react";
import { IAlertCommon } from "@/components/common/alert/types/alert.type";
import { KaraokeExtension } from "@/features/songs/types/songs.type";
import { extractFile, removeFilesInZip, zipFiles } from "@/lib/zip";
import { GetAllOptions } from "@/utils/indexedDB/core/base";
import { ITracklistUserSongs } from "@/utils/indexedDB/db/user-songs/types";
import { AiFillDelete } from "react-icons/ai";
import { BiDownload } from "react-icons/bi";
import { CgClose } from "react-icons/cg";
import { FaSearch } from "react-icons/fa";
import Button from "@/components/common/button/button";
import Label from "@/components/common/display/label";
import Tags from "@/components/common/display/tags";
import Pagination from "@/components/common/table/pagination";
import TableList from "@/components/common/table/table-list";
import useSongsStore from "@/features/songs/store/songs.store";
import moment from "moment";
import {
  FilesUserSongsManager,
  TracklistUserSongsManager,
} from "@/utils/indexedDB/db/user-songs/table";

interface UserDatabaseProps extends IAlertCommon {}

const UserDatabase: React.FC<UserDatabaseProps> = ({
  setAlert,
  closeAlert,
}) => {
  const limit = 20;
  const filesUserSongsManager = new FilesUserSongsManager();
  const tracklistUserSongsManager = new TracklistUserSongsManager();

  const songsManager = useSongsStore((state) => state.songsManager);

  const [listData, setListData] = useState<ListItem<ITracklistUserSongs>[]>();
  const [onSelect, setSelect] = useState<ITracklistUserSongs>();
  const [isEnd, setEnd] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);

  const loadData = async (options: GetAllOptions = { limit, offset: 0 }) => {
    const test = await tracklistUserSongsManager.getAll(options);

    if (test.length < 20) {
      setEnd(true);
    } else {
      setEnd(false);
    }

    const list: ListItem<ITracklistUserSongs>[] = test.map(
      (data) =>
        ({
          render: () => (
            <div className="w-fit flex gap-2">
              <Tags
                color={"green"}
                className="text-[10px] min-w-10 text-center"
              >
                {data.data.CODE}
              </Tags>

              <div className="m-auto line-clamp-1">{data.data.TITLE}</div>
            </div>
          ),
          key: `${data.data._superIndex}_${data.data._originalIndex}`,
          value: data,
        } as ListItem<ITracklistUserSongs>)
    );

    setListData(list);
  };

  const onSelectTracklist = (tracklist: ITracklistUserSongs) => {
    setSelect(tracklist);
  };

  const onPageChange = (page: number) => {
    setPage(page);
    loadData({ limit, offset: (page - 1) * limit });
  };

  const onDeleteSound = async (tracklist: ITracklistUserSongs) => {
    // const _superIndex = tracklist.data._superIndex;
    // if (!_superIndex) {
    //   return setAlert?.({
    //     title: "เกิดข้อผิดพลาด?",
    //     description: "ไม่พบข้อมูล Index ของข้อมูลนี้",
    //     variant: "warning",
    //   });
    // }
    try {
      await tracklistUserSongsManager.delete(tracklist.id);
      setListData([]);
      setSelect(undefined);
      onPageChange(page);
      closeAlert?.();
      // const zip = await filesUserSongsManager.get(_superIndex);
      // if (zip?.file) {
      //   const files = await extractFile(zip.file);
      //   try {
      //     const originalFile = files.find(())
      //     console.log("Extracted: ", files);
      //     console.log("Getby originalFile: ", originalFile);
      //     if (originalFile) {
      //       const filePath = originalFile.name;
      //       const removed = await removeFilesInZip(zip.file, [filePath]);
      //       if (!removed) throw "ไม่สามารถลบไฟล์ใน Zip [removeFilesInZip]";
      //       const files = await extractFile(removed);
      //       if (files.length == 0) {
      //         await filesUserSongsManager.delete(_superIndex);
      //       } else {
      //         await filesUserSongsManager.update(_superIndex, {
      //           file: removed,
      //         });
      //       }
      //       await tracklistUserSongsManager.delete(tracklist.id);
      //       setListData([]);
      //       setSelect(undefined);
      //       onPageChange(page);
      //     } else {
      //       setAlert?.({
      //         title: "ตรวจไม่พบไฟล์เพลง",
      //         description: `ไม่พบไฟล์เพลงในตำแนห่ง originalIndex: ${_originalIndex}`,
      //         variant: "warning",
      //       });
      //     }
      //   } catch (error) {
      //     return setAlert?.({
      //       title: "เกิดข้อผิดพลาด",
      //       description: `Error: ${JSON.stringify(error)}`,
      //       variant: "error",
      //     });
      //   }
      // }
    } catch (error) {
      return setAlert?.({
        title: "เกิดข้อผิดพลาด",
        description: `Error: ${JSON.stringify(error)}`,
        variant: "error",
      });
    }
  };

  const onDownloadSong = async (tracklist: ITracklistUserSongs) => {
    const song = await songsManager?.getSong(tracklist.data);
    const filesObj: KaraokeExtension | undefined = song?.files;

    if (!filesObj) return;

    const filesArray: File[] = Object.values(filesObj).filter(
      (file): file is File => file !== undefined
    );

    if (filesArray.length === 0) return;

    const zipFile = await zipFiles(filesArray, song?.baseName || "song");

    if (!zipFile) return;

    const url = URL.createObjectURL(zipFile);
    const a = document.createElement("a");
    a.href = url;
    a.download = zipFile.name;
    a.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    loadData();
  }, []);
  return (
    <div className="flex flex-col gap-2 w-full h-full">
      <div className="flex flex-col lg:flex-row gap-2 h-full w-full overflow-auto">
        <div
          className={`flex flex-col w-full ${
            onSelect ? "lg:w-[60%]" : "w-full"
          }  h-full overflow-auto space-y-2`}
        >
          <Label>เพลงของคุณ</Label>
          <TableList
            listKey={"user-database-list"}
            list={listData}
            deleteItem={false}
            itemAction={(value, index, option) => {
              return (
                <Button
                  shadow={false}
                  border=""
                  onClick={() => {
                    console.log(value, index, option);
                    onSelectTracklist(value);
                  }}
                  padding=""
                  className="w-7 h-7"
                  color="yellow"
                  blur={false}
                  icon={<FaSearch className="text-white" />}
                />
              );
            }}
          ></TableList>
          <Pagination
            disableNext={isEnd}
            currentPage={page}
            onPageChange={onPageChange}
          ></Pagination>
        </div>
        {onSelect && (
          <div className="flex flex-col w-full lg:w-[40%] h-full overflow-auto">
            <Label>รายละเอียดเพลง</Label>

            <div className=" flex flex-col h-full overflow-auto rounded-lg border border-gray-200 bg-white p-2 gap-2 relative">
              <div className="sticky top-0 w-full flex gap-2 bg-white">
                <Button
                  color="blue"
                  className="w-full h-8"
                  icon={<BiDownload></BiDownload>}
                  iconPosition="left"
                  onClick={() => onDownloadSong(onSelect)}
                >
                  ดาวน์โหลด
                </Button>
                <Button
                  color="red"
                  className="h-8"
                  icon={<AiFillDelete></AiFillDelete>}
                  iconPosition="left"
                  onClick={() => {
                    setAlert?.({
                      title: "ยืนยันการลบเพลง?",
                      description: "หากกดตกลงจะไม่สามารถกู้คืนได",
                      variant: "warning",
                      onOk: () => {
                        onDeleteSound(onSelect);
                      },
                    });
                  }}
                >
                  ลบ
                </Button>
                <Button
                  className="h-8"
                  color="gray"
                  icon={<CgClose></CgClose>}
                  iconPosition="left"
                  onClick={() => setSelect(undefined)}
                >
                  ปิด
                </Button>
              </div>

              <div className="mb-5 space-y-1">
                <Tags
                  color={"green"}
                  className="text-[15px] min-w-16 text-center"
                >
                  {onSelect.data.CODE}
                </Tags>
                <h3 className="text-2xl font-bold text-gray-900">
                  {onSelect.data.TITLE}
                </h3>
                {onSelect.data.ARTIST && (
                  <p className="text-md text-gray-600">
                    โดย {onSelect.data.ARTIST}
                  </p>
                )}
              </div>

              <div className="space-y-3 text-sm">
                {onSelect.data.KEY && (
                  <div className="flex gap-2">
                    <span className="w-32 font-bold">Database ID</span>
                    <span className="text-gray-800">{onSelect.id}</span>
                  </div>
                )}
                {onSelect.data.KEY && (
                  <div className="flex gap-2">
                    <span className="w-32 font-bold">เพิ่มเมื่อ</span>
                    <span className="text-gray-800">
                      {moment(onSelect.createdAt).format("HH:mm:ss YYYY/MM/DD")}
                    </span>
                  </div>
                )}
                {onSelect.data.KEY && (
                  <div className="flex gap-2">
                    <span className="w-32 font-bold">คีย์</span>
                    <span className="text-gray-800">{onSelect.data.KEY}</span>
                  </div>
                )}

                {onSelect.data.LYRIC_TITLE && (
                  <div className="flex flex-col gap-2">
                    <span className="w-32 font-bold text-nowrap">
                      เนื้อร้องบางส่วน
                    </span>
                    <span className="text-gray-800">
                      {onSelect.data.LYRIC_TITLE}...
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDatabase;
