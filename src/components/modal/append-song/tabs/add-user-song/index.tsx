import Label from "@/components/common/display/label";
import {
  KaraokeDecoded,
  MusicLoadAllData,
} from "@/features/songs/types/songs.type";
import {
  BaseUserSongsSystemReader,
  DuplicateMatch,
} from "@/features/songs/base/tride-search";
import Upload from "@/components/common/input-data/upload";
import TableList from "@/components/common/table/table-list";
import Tags from "@/components/common/display/tags";
import Button from "@/components/common/button/button";
import React, { useState } from "react";
import { groupFilesByBaseName, musicProcessGroup } from "@/lib/karaoke/read";
import { FaPlus, FaRegFileAudio } from "react-icons/fa";
import { RiDeleteBin5Line } from "react-icons/ri";
import { AlertDialogProps } from "@/components/common/alert/notification";
import { IAlertCommon } from "@/components/common/alert/types/alert.type";

interface AddSongCount {
  length: number;
  error: number;
  duplicate: number;
}

interface AddUserSongProps extends IAlertCommon {}

interface DuplicateModalData {
  currentSong: KaraokeDecoded;
  duplicates: DuplicateMatch[];
}

const AddUserSong: React.FC<AddUserSongProps> = ({
  setAlert,
  closeAlert,
  setProcessing,
}) => {
  const [decoded, setDecoded] = useState<ListItem<MusicLoadAllData>[]>([]);
  // const [duplicateModal, setDuplicateModal] =
  //   useState<DuplicateModalData | null>(null);
  const [soundCount, setSoundCount] = useState<AddSongCount>({
    length: 0,
    error: 0,
    duplicate: 0,
  });

  const checkDuplicate = (trackData: MusicLoadAllData): boolean => {
    const test = new BaseUserSongsSystemReader();
    return test.checkDuplicate(trackData);
  };

  // const checkDuplicateWithDetails = (
  //   trackData: KaraokeDecoded
  // ): DuplicateMatch[] => {
  //   const test = new BaseUserSongsSystemReader();
  //   return test.checkDuplicateWithDetails(trackData);
  // };

  const updateSoundCount = (decodedList: ListItem<KaraokeDecoded>[]) => {
    const errorCount = decodedList.filter((item) => item.value.error).length;
    const duplicateCount = decodedList.filter(
      (item) => item.value.isDuplicate
    ).length;

    setSoundCount({
      length: decodedList.length,
      error: Math.max(0, errorCount),
      duplicate: Math.max(0, duplicateCount),
    });
  };

  const onAddFile = async (_: File, filelist: FileList) => {
    if (filelist.length === 0) return;

    if (decoded.length + filelist.length > 200) {
      setAlert?.({
        variant: "warning",
        title: "ไม่สามารถเพิ่มเกิน 200 เพลงต่อครั้ง",
        description: `กรณีลบแยกเพลงออกเป็นส่วน ๆ แล้วนำเพลงเข้าทีละชุด (ครั้งละ 200 เพลง)`,
      });
      return;
    }

    const preprocess = groupFilesByBaseName(filelist);

    let decode: MusicLoadAllData[] = [];
    for (let i = 0; i < preprocess.length; i++) {
      const item = preprocess[i];
      let data = await musicProcessGroup(item, false);
      decode.push(data);
    }

    const errors: MusicLoadAllData[] = [];
    const valids: MusicLoadAllData[] = [];
    const duplicates: MusicLoadAllData[] = [];

    for (const item of decode) {
      if (item.isError) {
        errors.push(item);
      } else if (item) {
        const isDuplicate = checkDuplicate(item);
        if (isDuplicate) {
          item.isDuplicate = true;
          duplicates.push(item);
        } else {
          valids.push(item);
        }
      }
    }

    const sortedNewDecoded = [...errors, ...duplicates, ...valids];

    let newListItems = sortedNewDecoded.map((item) => {
      let name = item.trackData.TITLE;
      if (item.isError) name = "ไม่สามารถอ่านไฟล์";
      if (item.isDuplicate) name = `${name} (ซ้ำ)`;

      let tagColor: ColorType = "green";
      if (item.isError) tagColor = "red";
      else if (item.isDuplicate) tagColor = "yellow";

      return {
        render: () => (
          <div className="w-fit flex gap-2">
            <Tags color={tagColor} className="text-[10px] min-w-10 text-center">
              {item.trackData.CODE}
            </Tags>
            <Tags color={"gray"} className="text-[10px] min-w-10 text-center">
              {item.trackData.SUB_TYPE}
            </Tags>
            <div className="m-auto">{name}</div>
          </div>
        ),
        value: item,
        className: item.isError
          ? "text-red-500"
          : item.isDuplicate
          ? "text-yellow-600"
          : "",
      };
    });

    const combinedDecoded = [...decoded, ...newListItems];
    setDecoded(combinedDecoded);

    updateSoundCount(combinedDecoded);
  };

  const removeItem = (itemToRemove: KaraokeDecoded) => {
    const updatedDecoded = decoded.filter(
      (item) => item.value !== itemToRemove
    );
    setDecoded(updatedDecoded);
    updateSoundCount(updatedDecoded);
  };

  const clearAllItems = () => {
    setDecoded([]);
    setSoundCount({
      length: 0,
      error: 0,
      duplicate: 0,
    });
  };

  // const handleShowDuplicateDetails = (item: KaraokeDecoded) => {
  //   const duplicates = checkDuplicateWithDetails(item);
  //   console.log(duplicates);
  //   setDuplicateModal({
  //     currentSong: item,
  //     duplicates: duplicates,
  //   });
  // };

  // const handleCloseDuplicateModal = () => {
  //   setDuplicateModal(null);
  // };

  // const handleDeleteFromDuplicateModal = () => {
  //   if (!duplicateModal) return;

  //   removeItem(duplicateModal.currentSong);
  //   handleCloseDuplicateModal();
  // };

  // const handleAddIgnoreDuplicate = () => {
  //   if (!duplicateModal) return;

  //   const updatedDecoded = decoded.map((item) => {
  //     if (item.value === duplicateModal.currentSong) {
  //       item.value.isDuplicate = false;

  //       let name: string | string[] = item.value.lyr as string[];
  //       if (name.length > 0) name = name[0];
  //       if (item.value.error) name = "ไม่สามารถอ่านไฟล์";

  //       const tagColor: ColorType = item.value.error ? "red" : "green";

  //       return {
  //         ...item,
  //         render: () => (
  //           <div className="w-fit flex gap-2">
  //             {item.value.fileName && (
  //               <Tags
  //                 color={tagColor}
  //                 className="text-[10px] min-w-10 text-center"
  //               >
  //                 {item.value.fileName}
  //               </Tags>
  //             )}
  //             <div className="m-auto">{name}</div>
  //           </div>
  //         ),
  //         className: item.value.error ? "text-red-500" : "",
  //       };
  //     }
  //     return item;
  //   });

  //   setDecoded(updatedDecoded);
  //   updateSoundCount(updatedDecoded);
  //   handleCloseDuplicateModal();
  // };

  const handleAddSong = async () => {
    setProcessing?.({
      title: "กำลังเพิ่มเพลง",
      variant: "processing",
      status: {
        progress: 0,
        text: "กำลังเริ่มต้น",
      },
    });
    try {
      const test = new BaseUserSongsSystemReader();
      const group: MusicLoadAllData[] = [];

      const validSongs = decoded.filter(
        (data) => !data.value.isError && !data.value.isDuplicate
      );

      validSongs.map((data) => group.push(data.value));

      if (group.length === 0) {
        alert("ไม่มีเพลงที่สามารถเพิ่มได้ (ทั้งหมดเป็นไฟล์ผิดพลาดหรือซ้ำ)");
        return;
      }

      await test.addSong(group);
      clearAllItems();
      setProcessing?.({
        title: "เพิ่มเพลงสำเร็จ",
        variant: "success",
        status: {
          progress: 100,
          text: "สำเร็จ",
        },
      });
    } catch (error) {
      console.error();
      setProcessing?.({
        title: "เกิดข้อผิดพลาด",
        variant: "error",
        status: {
          progress: 100,
          text: JSON.stringify(error),
        },
      });
    }
  };

  const getMatchTypeLabel = (
    matchType: DuplicateMatch["matchType"]
  ): string => {
    switch (matchType) {
      case "CODE":
        return "รหัสเพลง";
      case "TITLE_ARTIST":
        return "ชื่อเพลง + ศิลปิน";
      case "TITLE":
        return "ชื่อเพลง";
      case "LYRICS":
        return "เนื้อเพลง";
      default:
        return "ไม่ทราบ";
    }
  };

  const hasProblematicItems = decoded.some(
    (item) => item.value.isError || item.value.isDuplicate
  );

  const formatDuplicatesForTable = (
    duplicates: DuplicateMatch[]
  ): ListItem<DuplicateMatch>[] => {
    return duplicates.map((duplicate) => ({
      value: duplicate,
      render: () => (
        <div className="flex flex-col text-sm w-full p-1">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-gray-800">
              {duplicate.track.TITLE || "ไม่มีชื่อเพลง"}
            </span>
            <span className="text-xs font-bold text-red-700">
              {(duplicate.similarity * 100).toFixed(1)}%
            </span>
          </div>
          <div className="flex justify-between items-center mt-1">
            <span className="text-gray-600">
              {duplicate.track.ARTIST || "ไม่มีศิลปิน"}
            </span>
            <span className="text-xs font-medium text-red-600 bg-red-100 px-1.5 py-0.5 rounded-full">
              {getMatchTypeLabel(duplicate.matchType)}
            </span>
          </div>
          {duplicate.track.CODE && (
            <div className="text-xs text-gray-500 mt-1">
              รหัส: {duplicate.track.CODE}
            </div>
          )}
        </div>
      ),
      className: "bg-red-50 hover:bg-red-100",
    }));
  };

  return (
    <>
      {/* <Modal
        maxWidth={800}
        height={470}
        isOpen={!!duplicateModal}
        onClose={handleCloseDuplicateModal}
      >
        {duplicateModal && (
          <div className="p-6 max-w-4xl mx-auto">
            <Label
              textSize={15}
              textColor="text-gray-800"
              headClass="bg-yellow-500"
              description="กรุณาตรวจสอบก่อนเพิ่มหรือลบออกไป"
            >
              ตรวจพบเพลงซ้ำ
            </Label>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
              <div className="col-span-1 lg:col-span-1">
                <div className="p-3 bg-gray-50 rounded-lg border">
                  <div>
                    <span className="text-sm text-gray-500">ชื่อไฟล์:</span>{" "}
                    <span className="text-blue-600">
                      {duplicateModal.currentSong.fileName}
                    </span>
                  </div>
                  {duplicateModal.currentSong.lyr?.[0] && (
                    <div>
                      <span className="text-sm text-gray-500">ชื่อเพลง:</span>{" "}
                      {duplicateModal.currentSong.lyr[0]}
                    </div>
                  )}
                  {duplicateModal.currentSong.lyr?.[1] && (
                    <div>
                      <span className="text-sm text-gray-500">ศิลปิน:</span>{" "}
                      {duplicateModal.currentSong.lyr[1]}
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-3 mt-6 justify-end">
                  <Button
                    color="red"
                    iconPosition="left"
                    onClick={handleDeleteFromDuplicateModal}
                    icon={<RiDeleteBin5Line />}
                  >
                    ลบออกจากรายการ
                  </Button>
                  <Button
                    color="yellow"
                    iconPosition="left"
                    onClick={handleAddIgnoreDuplicate}
                    icon={<FaPlus />}
                  >
                    เพิ่ม (ไม่สนใจไฟล์ซ้ำ)
                  </Button>
                  <Button
                    color="gray"
                    iconPosition="left"
                    onClick={handleCloseDuplicateModal}
                  >
                    ปิด
                  </Button>
                </div>
              </div>

              <div className="col-span-1 lg:col-span-2">
                <div className="max-h-80 overflow-y-auto border rounded-lg">
                  <TableList
                    listKey="duplicate-song-modal-list"
                    list={formatDuplicatesForTable(duplicateModal.duplicates)}
                    deleteItem={false}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal> */}

      <div className="flex flex-col gap-2 h-full">
        <div className="h-fit space-y-1.5">
          <div>
            <Label>
              เลือกไฟล์เพลง (.emk หรือ .mid, .cur, .lyr) - สูงสุด 200 เพลง
            </Label>
            <Upload
              className="border border-blue-500 p-3 rounded-md hover:bg-gray-50 duration-300 flex justify-between"
              onSelectFile={onAddFile}
              inputProps={{
                multiple: true,
              }}
            >
              <span className="w-full text-sm flex items-center gap-2">
                <FaRegFileAudio className="text-blue-500" />
                <span>อัปโหลดไฟล์เพลง (ปัจจุบัน: {decoded.length}/200)</span>
              </span>
            </Upload>
          </div>

          <div className="row-span-4 flex gap-4">
            <Label headClass="bg-gray-300">ทั้งหมด: {soundCount.length}</Label>
            <Label headClass="bg-green-500">
              ใช้ได้:{" "}
              {Math.max(
                0,
                soundCount.length - soundCount.error - soundCount.duplicate
              )}
            </Label>
            <Label headClass="bg-red-500">ผิดพลาด: {soundCount.error}</Label>
            <Label headClass="bg-yellow-500">ซ้ำ: {soundCount.duplicate}</Label>
          </div>
        </div>

        <TableList
          listKey="add-song-file"
          list={decoded}
          onDeleteItem={removeItem}
          deleteItem={false}
          itemAction={(value: KaraokeDecoded) => (
            <div className="flex gap-1">
              {/* {value.isDuplicate && (
                <Button
                  shadow={false}
                  border=""
                  onClick={() => handleShowDuplicateDetails(value)}
                  padding=""
                  className="w-7 h-7"
                  color="yellow"
                  blur={false}
                  icon={<FaSearch className="text-white" />}
                />
              )} */}

              <Button
                shadow={false}
                border=""
                onClick={() => removeItem(value)}
                padding=""
                className="w-7 h-7"
                color="red"
                blur={false}
                icon={<RiDeleteBin5Line className="text-white" />}
              />
            </div>
          )}
        />

        <Button
          color="blue"
          iconPosition="left"
          className="w-full"
          icon={<FaPlus />}
          disabled={decoded.length === 0 || hasProblematicItems}
          onClick={handleAddSong}
        >
          เพิ่มเพลง
        </Button>
      </div>
    </>
  );
};

export default AddUserSong;
