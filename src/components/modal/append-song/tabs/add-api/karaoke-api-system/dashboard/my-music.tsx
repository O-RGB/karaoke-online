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

const MyMusicTab: React.FC<IAlertCommon> = ({ setAlert, closeAlert }) => {
  const { notify } = useNotification();
  const token = useConfigStore((state) => state.config.token);

  const [musicList, setMusicList] = useState<IMusicDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [onAddMusic, setAddMusic] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const observer = useRef<IntersectionObserver | null>(null);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  const fetchMusic = useCallback(
    async (isNewSearch = false) => {
      if (!token) return;

      if (loading && !isNewSearch) return;

      setLoading(true);

      const currentPage = isNewSearch ? 1 : page;
      const limit = 20;
      const offset = (currentPage - 1) * limit;

      let url = `${API_BASE_URL}/music?limit=${limit}&offset=${offset}`;
      if (searchTerm.trim()) {
        url += `&q=${encodeURIComponent(searchTerm.trim())}`;
      }

      try {
        const response = await fetchAPI<{}, IMusicDetails[]>(url, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });

        setMusicList((prev) =>
          currentPage === 1 ? response : [...prev, ...response]
        );
        setHasMore(response.length === limit);
        setPage(currentPage + 1);
      } catch (error) {
        notify({ type: "error", text: `เกิดข้อผิดพลาดในการโหลดเพลง` });
      } finally {
        setLoading(false);
      }
    },
    [token, page, loading, searchTerm, notify]
  );

  const addMusic = async (create: MusicCreate) => {
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
        fetchMusic(true);
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
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(() => {
      fetchMusic(true);
    }, 500);
  }, [searchTerm]);

  const lastMusicElementRef = useCallback(
    (node: HTMLDivElement) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          fetchMusic();
        }
      });

      if (node) observer.current.observe(node);
    },
    [loading, hasMore, fetchMusic]
  );

  return (
    <div className="space-y-4 h-full flex flex-col">
      <ModalServer
        title="เพิ่มเพลง"
        isOpen={onAddMusic}
        onClose={() => setAddMusic(false)}
      >
        <MusicForm onSubmit={addMusic} />
      </ModalServer>

      <div className="flex justify-between items-center gap-2 sticky top-0 bg-gray-50 py-2 z-10">
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
        <Button size="sm" onClick={() => setAddMusic(true)} icon={<FaPlus />}>
          เพิ่มเพลง
        </Button>
      </div>

      <div className="space-y-2 flex-1 overflow-y-auto">
        {musicList.map((music, index) => (
          <div
            ref={musicList.length === index + 1 ? lastMusicElementRef : null}
            key={music.id}
          >
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
    </div>
  );
};

export default MyMusicTab;
