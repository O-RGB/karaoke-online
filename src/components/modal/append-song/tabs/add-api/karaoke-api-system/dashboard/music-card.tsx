"use client";
import React, { useState } from "react";
import { IMusicDetails } from "../types";
// --- 1. เพิ่ม FaCalendarAlt ---
import { FaPlay, FaHeart, FaBookmark, FaCalendarAlt } from "react-icons/fa";
import ModalServer from "../common/modal";
import MusicDetails from "./music-detail";
import { IAlertCommon } from "@/components/common/alert/types/alert.type";

interface MusicCardProps extends IAlertCommon {
  music: IMusicDetails;
  onClick?: (music: IMusicDetails) => void;
  onDelete?: (id: string) => Promise<void>;
}

const MusicCard: React.FC<MusicCardProps> = ({
  music,
  onClick,
  setAlert,
  closeAlert,
  onDelete,
}) => {
  const [onOpenDetail, setOptnDetail] = useState<boolean>(false);
  const handleOpenDetail = () => {
    setOptnDetail(true);
  };
  const handleCloseDetail = () => {
    setOptnDetail(false);
  };

  // --- 2. สร้างฟังก์ชันจัดรูปแบบวันที่ ---
  const formattedDate = new Date(music.created_at).toLocaleDateString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <>
      <ModalServer
        title="รายละเอียดเพลง"
        isOpen={onOpenDetail}
        onClose={handleCloseDetail}
      >
        <MusicDetails
          onDelete={onDelete}
          setAlert={setAlert}
          closeAlert={closeAlert}
          data={music}
        ></MusicDetails>
      </ModalServer>

      <div
        onClick={handleOpenDetail}
        className="flex items-center justify-between rounded-xs bg-white/70 cursor-pointer
                    py-3 px-2 shadow-sm backdrop-blur-sm transition hover:shadow-md hover:bg-white"
      >
        <div className="flex flex-col lg:flex-row lg:items-center gap-0.5 lg:gap-2 min-w-0 truncate">
          <h3 className="text-sm font-semibold text-gray-900 truncate">
            {music.title}
          </h3>
          {/* --- 3. เพิ่มการแสดงผลวันที่ --- */}
          <p className=" text-[10px] text-gray-600 flex flex-col lg:flex-row lg:gap-2">
            <span className="hidden lg:block">-</span>
            <span>{music.artist}</span>
            <span className="flex items-center gap-1">
              <FaCalendarAlt className="text-blue-400" />
              {formattedDate}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2 text-gray-500">
          {/* ... (ส่วนนับ play, like, bookmark เหมือนเดิม) ... */}
          <div className="flex items-center gap-1">
            <FaPlay className="text-green-600 text-[8px] " />
            <span className="text-xs">{music.play_count}</span>
          </div>
          <div className="flex items-center gap-1">
            <FaHeart className="text-pink-500 text-[8px] " />
            <span className="text-xs">{music.like_count}</span>
          </div>
          <div className="flex items-center gap-1">
            <FaBookmark className="text-blue-500 text-[8px] " />
            <span className="text-xs">{music.bookmark_count}</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default MusicCard;
