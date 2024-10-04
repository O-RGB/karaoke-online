
import { getTrackList } from "@/lib/storage/tracklist";
import React, { useEffect, useState } from "react";

interface SongListModalProps {}

const SongListModal: React.FC<SongListModalProps> = ({}) => {
  const [fileSongList, setFileSongList] = useState<any>(null); // เก็บข้อมูล JSON ที่อ่านมา
  const [error, setError] = useState<string | null>(null); // เก็บ error ถ้ามี

  const getSongList = async () => {
    try {
      const file = await getTrackList();
      if (file) {
        const reader = new FileReader();
        
        // อ่านข้อมูลไฟล์เมื่อโหลดเสร็จ
        reader.onload = (e) => {
          try {
            const jsonContent = JSON.parse(e.target?.result as string);
            setFileSongList(jsonContent);
          } catch (err) {
            setError("Error parsing JSON file.");
          }
        };

        // ถ้าเกิด error ระหว่างอ่านไฟล์
        reader.onerror = () => {
          setError("Error reading the file.");
        };

        // อ่านไฟล์ในรูปแบบข้อความ
        reader.readAsText(file);
      }
    } catch (err) {
      setError("Error loading the file.");
    }
  };

  useEffect(() => {
    getSongList();
  }, []);

  return (
    <>
      {error ? (
        <p>{error}</p>
      ) : (
        <pre>{JSON.stringify(fileSongList, null, 2)}</pre>
      )}
    </>
  );
};

export default SongListModal;
