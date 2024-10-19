import Button from "@/components/common/button/button";
import Upload from "@/components/common/input-data/upload";
import Label from "@/components/common/label";
import TableList from "@/components/common/table/table-list";
import Tags from "@/components/common/tags";
import { createTrackList } from "@/lib/storage/tracklist";
import useTracklistStore from "@/stores/tracklist-store";
import React, { useEffect, useState } from "react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { FaCheck, FaPlus, FaRegFileAudio, FaSearch } from "react-icons/fa";
import DuplicateSongModal from "./duplicate-song";
import IgnoreDupFile from "./ignore-dupfile";

interface AddSongProps {
  bufferFile: SongFiltsEncodeAndDecode[];
  onAddFile: (_: File, fileList: FileList) => void;
  onCreate: (bufferFile: SongFiltsEncodeAndDecode[]) => Promise<boolean>;
}

const AddSong: React.FC<AddSongProps> = ({
  bufferFile = [],
  onAddFile,
  onCreate,
}) => {
  const findSimilarSongs = useTracklistStore((state) => state.findSimilarSongs);
  const [songRender, setSongRender] = useState<ListItem<ValidSong>[]>([]);
  const [result, setResult] = useState<boolean>();
  const [resultAnimation, setResultAnimtaion] = useState<boolean>();
  const [loading, setLoading] = useState<boolean>(false);
  // counting
  const [errorCount, setErrorCount] = useState<number>(0);
  const [sameCount, setSameCount] = useState<number>(0);
  // เช็คเพลงซ้ำ
  const [modalSongSame, setModalSongSame] = useState<ValidSong>();
  const [ignoreDup, setIgnoreDup] = useState<boolean>(false);
  const [wraningDupFile, setWraningDupFile] = useState<boolean>(false);
  const [searchDupFile, setSearchDupFile] = useState<boolean>(false);

  const reset = () => {
    setSongRender([]);
    setResult(undefined);
    setLoading(false);
    setErrorCount(0);
    setSameCount(0);
    setModalSongSame(undefined);
    setIgnoreDup(false);
    setWraningDupFile(false);
    setSearchDupFile(false);
  };

  const sortSongList = (songlist: ValidSong[]) => {
    songlist.sort((a, b) => {
      if (a.error !== b.error) {
        return a.error ? -1 : 1;
      }

      if (a.isSame.length !== b.isSame.length) {
        return a.isSame.length > b.isSame.length ? -1 : 1;
      }

      return 0;
    });
    return songlist;
  };

  const renderItem = (
    item: SearchResult,
    error: boolean = false,
    same: SearchResult[]
  ) => {
    return (
      <div className="flex flex-col md:flex-row gap-1 md:items-center">
        <Tags color={`${error ? "red" : same.length > 0 ? "yellow" : "green"}`}>
          {item.id}
        </Tags>
        {error ? (
          <>
            <span className="text-red-500 hidden md:block"> - </span>
            <span className="text-red-500">ไม่สามารถอ่านไฟล์</span>
          </>
        ) : (
          <>
            <span className="hidden md:block"> - </span>
            <span className="">{item.name}</span>
            <Label headClass="bg-blue-500">{item.artist}</Label>
          </>
        )}
      </div>
    );
  };

  const getLyrsong = () => {
    setSearchDupFile(true);
    let songlist: ValidSong[] = [];
    let errorCount: number = 0;
    let sameCount: number = 0;
    bufferFile.map((data) => {
      let isError = false;
      if (data.error) {
        isError = true;
        errorCount = errorCount + 1;
      }
      let tl = createTrackList(data, "", "");

      let same: SearchResult[] = [];
      if (!isError) {
        same = findSimilarSongs({
          artist: tl.artist,
          id: tl.id,
          name: tl.name,
        });

        if (same.length > 0) {
          sameCount = sameCount + 1;
        }
      }

      let item = renderItem(tl, isError, same);
      songlist.push({
        item: tl,
        error: isError,
        isSame: same,
        render: item,
        originValue: data,
      });
    });

    const sortList = sortSongList(songlist);
    const toState = sortList.map(
      (data) =>
        ({
          row: data.render,
          value: data,
        } as ListItem<ValidSong>)
    );

    setErrorCount(errorCount);
    setSongRender(toState);
    setSameCount(sameCount);
    setSearchDupFile(false);
  };

  const handleCreateSong = async (ignore: boolean = false) => {
    setLoading(true);

    if (!ignore) {
      //check file dup
      const fileIsDup = songRender.filter((x) => x.value.isSame.length > 0);
      if (fileIsDup.length > 0 && ignoreDup === false) {
        setWraningDupFile(true);
        return;
      }
    }

    const getOrigin: ListItem<ValidSong>[] = songRender.filter(
      (data) => data.value.error === false
    );

    const data = getOrigin.map((data) => data.value?.originValue);
    const res = await onCreate(data);
    reset();
    // setResult(res);
    // setResultAnimtaion(res);
    // setTimeout(() => {
    //   setResultAnimtaion(false);
    // }, 1000);

    // setTimeout(() => {
    //   setResult(false);
    // }, 1500);
  };

  const removeItem = (value: ValidSong) => {
    setSongRender((item) => {
      return item.filter((x) => x.value.item.id !== value.item.id);
    });
    if (value.error) {
      setErrorCount((value) => value - 1);
    }
    setModalSongSame(undefined);
  };

  const onApprovedDupFile = (value: ValidSong) => {
    setSongRender((item) => {
      let clone = [...item];
      let find = clone.find((x) => x.value.item.id === value.item.id);
      if (!find) return item;
      find.value.isSame = [];
      return clone;
    });
    setModalSongSame(undefined);
    setSameCount((value) => value - 1);
  };

  useEffect(() => {
    getLyrsong();
  }, [bufferFile]);

  return (
    <>
      <DuplicateSongModal
        valid={modalSongSame}
        title="ตรวจสอบเพลงซ้ำ"
        isOpen={!!modalSongSame}
        height={"500px"}
        onClose={() => {
          setModalSongSame(undefined);
          setWraningDupFile(false);
        }}
        onAdded={onApprovedDupFile}
        onRemove={removeItem}
      ></DuplicateSongModal>

      <IgnoreDupFile
        width="300px"
        height={"100px"}
        onClose={() => {
          setWraningDupFile(false);
          setLoading(false);
        }}
        onIgnore={() => {
          setIgnoreDup(true);
          handleCreateSong(true);
        }}
        isOpen={wraningDupFile}
      ></IgnoreDupFile>

      <div className="w-full h-full flex flex-col gap-2 ">
        <div className="">
          <Label>เลือกไฟล์เพลง (.emk หรือ .mid, .cur, .lyr) </Label>
          <Upload
            accept=".emk,application/octet-stream,.cur,application/octet-stream,.lyr,text/plain,.mid,audio/midi"
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
          </Upload>
        </div>

        <div className="relative">
          {/* {result && (
            <div
              className={`${
                resultAnimation ? "opacity-100" : "opacity-0"
              } duration-500 absolute w-full h-full flex justify-center items-center bg-white/80`}
            >
              <div className="flex flex-col justify-center items-center h-20 bg-white shadow-sm rounded-md text-lg">
                <div className="w-10 h-10 flex items-center justify-center rounded-full bg-green-500 overflow-hidden">
                  <FaCheck className="text-white "></FaCheck>
                </div>
                <div>เพิ่มเพลงสำเร็จ</div>
              </div>
            </div>
          )} */}
          {searchDupFile && (
            <div
              className={`duration-500 absolute w-full h-full flex justify-center items-center bg-white/80`}
            >
              <div className="flex flex-col justify-center items-center h-20 bg-white shadow-sm rounded-md text-lg">
                <div className="w-10 h-10 flex items-center justify-center rounded-full bg-green-500 overflow-hidden">
                  <AiOutlineLoading3Quarters className="text-white animate-spin"></AiOutlineLoading3Quarters>
                </div>
                <div>กำลังค้นหาเพลงซ้ำ</div>
              </div>
            </div>
          )}
          <div className="flex gap-4">
            <Label headClass="bg-gray-300">ทั้งหมด: {songRender.length}</Label>
            <Label headClass="bg-green-500">
              อ่าน: {songRender.length - errorCount}
            </Label>
            <Label headClass="bg-red-500">ผิดพลาด: {errorCount}</Label>
            <Label headClass="bg-yellow-500">ซ้ำ: {sameCount}</Label>
          </div>
          <TableList
            height={"280px"}
            listKey="add-song-file"
            list={songRender}
            onDeleteItem={removeItem}
            itemAction={(value: ValidSong, index) =>
              value.isSame.length > 0 && (
                <Button
                  shadow={false}
                  border={""}
                  onClick={() => {
                    setModalSongSame(value);
                  }}
                  padding=""
                  className="w-7 h-7"
                  color="yellow"
                  blur={false}
                  icon={<FaSearch className="text-white"></FaSearch>}
                ></Button>
              )
            }
          ></TableList>
        </div>
        <div className=" w-full">
          <Button
            iconPosition="left"
            icon={
              loading ? (
                <AiOutlineLoading3Quarters className="animate-spin"></AiOutlineLoading3Quarters>
              ) : (
                <FaPlus></FaPlus>
              )
            }
            disabled={songRender.length === 0 || songRender.length > 100}
            color="blue"
            blur={false}
            className="text-white w-full"
            onClick={() => handleCreateSong(wraningDupFile)}
          >
            {songRender.length > 100 ? "เพิ่มเกิน 100 ไฟล์" : "เพิ่มเพลง"}
          </Button>
        </div>
      </div>
    </>
  );
};

export default AddSong;
