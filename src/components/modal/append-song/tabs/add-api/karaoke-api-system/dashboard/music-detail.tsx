"use client";

import React, { useState } from "react";
import {
  FaHeart,
  FaBookmark,
  FaPlay,
  FaUserCircle,
  FaEdit,
  FaTrash,
  FaMusic,
} from "react-icons/fa";
import { IMusicDetails } from "../types";
import ButtonCommon from "@/components/common/button/button";
import { IAlertCommon } from "@/components/common/alert/types/alert.type";

interface MusicDetailsProps extends IAlertCommon {
  data: IMusicDetails;
  onEdit?: (music: IMusicDetails) => void;
  onDelete?: (id: string) => Promise<void>;
}

const MusicDetails: React.FC<MusicDetailsProps> = ({
  data,
  onEdit,
  onDelete,
  setAlert,
  closeAlert,
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const onDeleteMusic = () => {
    closeAlert?.();
    setLoading(true);
    onDelete?.(data.id);
  };
  return (
    <div className="relative w-full">
      <div className="absolute top-4 right-4 flex gap-2 z-10">
        <ButtonCommon
          isLoading={loading}
          size="xs"
          disabled
          color="gray"
          icon={<FaEdit />}
          onClick={() => onEdit?.(data)}
        ></ButtonCommon>

        <ButtonCommon
          isLoading={loading}
          size="xs"
          color="danger"
          icon={<FaTrash />}
          onClick={() => {
            setAlert?.({
              onOk: onDeleteMusic,
              title: "ยืนยันการลบเพลง",
              variant: "error",
              description: "จะไม่สามารถกู้คืนได้",
            });
          }}
        ></ButtonCommon>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b border-gray-100">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
            <FaMusic className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-gray-900 mb-1">
              {data.title}
            </h2>
            <p className="text-sm text-gray-600 flex items-center gap-2">
              <FaUserCircle className="w-4 h-4" />
              {data.artist} • {data.album}
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 border-b border-gray-100">
        <div className="flex gap-3">
          <ButtonCommon
            isLoading={loading}
            size="xs"
            className="w-full"
            icon={<FaPlay />}
          >
            ฟังเพลง
          </ButtonCommon>

          <ButtonCommon
            isLoading={loading}
            className="pointer-events-none"
            color="white"
            size="xs"
            icon={<FaHeart className="text-red-500"></FaHeart>}
          >
            {data.like_count}
          </ButtonCommon>
          <ButtonCommon
            isLoading={loading}
            className="pointer-events-none"
            color="white"
            size="xs"
            icon={<FaBookmark className="text-yellow-500"></FaBookmark>}
          >
            {data.bookmark_count}
          </ButtonCommon>
        </div>
      </div>

      <div className="p-6 space-y-3">
        <div className="flex items-center justify-between py-2 border-b border-gray-50">
          <span className="text-sm  text-gray-500">จำนวนการเล่น</span>
          <span className="text-sm font-semibold text-gray-900">
            {data.play_count.toLocaleString()} ครั้ง
          </span>
        </div>

        <div className="flex items-center justify-between py-2 border-b border-gray-50">
          <span className="text-sm  text-gray-500">รหัสเพลง</span>
          <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded text-gray-700">
            {data.music_code}
          </span>
        </div>

        <div className="flex items-center justify-between py-2 border-b border-gray-50">
          <span className="text-sm  text-gray-500">วันที่สร้าง</span>
          <span className="text-sm text-gray-700">
            {new Date(data.created_at).toLocaleDateString("th-TH")}
          </span>
        </div>

        <div className="flex items-center justify-between py-2">
          <span className="text-sm  text-gray-500">อัปเดตล่าสุด</span>
          <span className="text-sm text-gray-700">
            {new Date(data.updated_at).toLocaleDateString("th-TH")}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MusicDetails;
