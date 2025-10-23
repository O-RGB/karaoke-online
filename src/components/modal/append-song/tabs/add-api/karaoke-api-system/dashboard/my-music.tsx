"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import useConfigStore from "@/features/config/config-store";
import Button from "@/components/common/button/button";
import { FaPlus, FaSpinner, FaSearch } from "react-icons/fa";
import { IAlertCommon } from "@/components/common/alert/types/alert.type";
import { useNotification } from "../common/notification-provider";
import ModalServer from "../common/modal";
import { API_BASE_URL } from "../config/value";
import MusicForm from "../form/music";
import { fetchAPI } from "../lib/fetch";
import { IMusicDetails, MusicCreate } from "../types";
import MusicCard from "./music-card";

// (ตัวเลือกการเรียงลำดับ)
const sortOptions = [
  { value: "relevance", label: "ความเกี่ยวข้อง" },
  { value: "created", label: "วันที่เพิ่ม" },
  { value: "play", label: "ยอดเล่น" },
  { value: "like", label: "ถูกใจ" },
  { value: "bookmark", label: "บุ๊กมาร์ก" },
];

const MyMusicTab: React.FC<IAlertCommon> = ({ setAlert, closeAlert }) => {
  const { notify } = useNotification();
  const token = useConfigStore((state) => state.config.token);

  const [musicList, setMusicList] = useState<IMusicDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [onAddMusic, setAddMusic] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // (State สำหรับเก็บค่า Filter/Sort)
  const [sortBy, setSortBy] = useState("created");
  const [order, setOrder] = useState("desc");

  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  const fetchMusic = useCallback(
    async (pageToFetch: number, isNewSearch = false) => {
      if (!token) return;
      if (loading && !isNewSearch) return;

      setLoading(true);

      const limit = 20;
      const offset = (pageToFetch - 1) * limit;

      // (สร้าง URL โดยมีทั้ง Search และ Sort)
      let url = `${API_BASE_URL}/music?limit=${limit}&offset=${offset}`;

      if (searchTerm.trim()) {
        url += `&q=${encodeURIComponent(searchTerm.trim())}`;
      }

      url += `&sort_by=${sortBy}&order=${order}`;

      try {
        const response = await fetchAPI<{}, IMusicDetails[]>(url, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });

        setMusicList(response);
        setHasMore(response.length === limit);
        setCurrentPage(pageToFetch);
      } catch (error) {
        notify({ type: "error", text: `เกิดข้อผิดพลาดในการโหลดเพลง` });
      } finally {
        setLoading(false);
      }
    },
    // ( Dependencies ทำให้ fetch ใหม่เมื่อ Search หรือ Sort เปลี่ยน)
    [token, loading, searchTerm, notify, currentPage, sortBy, order]
  );

  const addMusic = async (create: MusicCreate) => {
    // ... (เหมือนเดิม) ...
    if (!token) return;
    try {
      const response = await fetchAPI<MusicCreate, IMusicDetails>(
        `${API_BASE_URL}/music`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: create,
        }
      );
      if (response.id) {
        setAddMusic(false);
        fetchMusic(1, true);
        notify({ type: "success", text: "สร้างเพลงเรียบร้อย" });
      } else {
        notify({ type: "warning", text: "สร้างเพลงไม่สำเร็จ" });
      }
    } catch (err: any) {
      const message = err?.body?.detail?.message || err.message;
      notify({ type: "error", text: `ผิดพลาด: ${JSON.stringify(message)}` });
      if (message === "Duplicate song found") {
        let existing_music = err?.body?.detail?.existing_music || {};
        setAlert?.({
          title: "เพลงซ้ำจาก Server",
          description: `ไฟล์ midi นี้มีในระบบแล้ว ไม่จำเป็นต้องอัปโหลดซ้ำ (รหัสเพลง: ${existing_music.music_code})`,
          variant: "warning",
        });
      }
    }
  };

  const removeMusic = async (id: string) => {
    // ... (เหมือนเดิม) ...
    if (!token) return;
    try {
      await fetchAPI<never, void>(`${API_BASE_URL}/music/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setMusicList((prev) => prev.filter((music) => music.id !== id));
      notify({ type: "success", text: "ลบเพลงเรียบร้อย" });
    } catch (error) {
      notify({ type: "error", text: `ผิดพลาด: ${JSON.stringify(error)}` });
    }
  };

  useEffect(() => {
    fetchMusic(1, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // (Effect นี้จะทำงานเมื่อ Search หรือ Sort เปลี่ยน)
  useEffect(() => {
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(() => {
      if (searchTerm.trim() && sortBy === "created") {
        setSortBy("relevance");
      }
      if (!searchTerm.trim() && sortBy === "relevance") {
        setSortBy("created");
      }
      fetchMusic(1, true);
    }, 500);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, sortBy, order]);

  return (
    <div className="space-y-4 h-full flex flex-col">
      <ModalServer
        title="เพิ่มเพลง"
        isOpen={onAddMusic}
        onClose={() => setAddMusic(false)}
      >
        <MusicForm onSubmit={addMusic} />
      </ModalServer>

      {/* (UI สำหรับ Search และ Dropdown Filter/Sort) */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-2 sticky top-0 bg-gray-50 py-2 z-10">
        <div className="relative w-full max-w-xs">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="ค้นหาเพลงของคุณ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border rounded-lg px-3 py-1.5 pl-9 w-full text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none"
          />
        </div>

        <div className="flex gap-2 items-center">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border rounded-lg px-2 py-1.5 text-sm outline-none"
          >
            {sortOptions
              .filter((opt) => searchTerm.trim() || opt.value !== "relevance")
              .map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
          </select>
          <select
            value={order}
            onChange={(e) => setOrder(e.target.value)}
            className="border rounded-lg px-2 py-1.5 text-sm outline-none"
          >
            <option value="desc">มากไปน้อย</option>
            <option value="asc">น้อยไปมาก</option>
          </select>

          <Button size="sm" onClick={() => setAddMusic(true)} icon={<FaPlus />}>
            เพิ่มเพลง
          </Button>
        </div>
      </div>

      <div className="space-y-2 flex-1 overflow-y-auto">
        {musicList.map((music) => (
          <div key={music.id}>
            {/* (ใช้ MusicCard ที่อัปเดตแล้ว) */}
            <MusicCard
              music={music}
              onDelete={removeMusic}
              setAlert={setAlert}
              closeAlert={closeAlert}
            />
          </div>
        ))}

        {loading && (
          <div className="text-center py-4">
            <FaSpinner className="animate-spin inline-block text-blue-500 text-xl" />
          </div>
        )}

        {!loading && musicList.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 text-center">
            <p className="text-lg font-semibold">ไม่พบเพลง</p>
            <p className="text-sm">
              {searchTerm
                ? "ไม่พบผลลัพธ์ที่ตรงกับการค้นหาของคุณ"
                : "คุณยังไม่มีเพลงในรายการ"}
            </p>
          </div>
        )}
      </div>

      {/* (Pagination Controls) */}
      {(!loading || currentPage > 1) && (
        <div className="flex justify-end items-center gap-2 py-1 px-4 border-t bg-gray-50 flex-shrink-0">
          <Button
            size="xs"
            onClick={() => fetchMusic(currentPage - 1)}
            disabled={loading || currentPage === 1}
          >
            ก่อนหน้า
          </Button>
          <span className="text-xs font-medium text-gray-700">
            หน้า {currentPage}
          </span>
          <Button
            size="xs"
            onClick={() => fetchMusic(currentPage + 1)}
            disabled={loading || !hasMore}
          >
            ถัดไป
          </Button>
        </div>
      )}
    </div>
  );
};

export default MyMusicTab;
