import React, { useEffect } from "react";
import { useLyrics } from "@/hooks/lyrics-hook";

interface LyricsModalProps {}

const LyricsModal: React.FC<LyricsModalProps> = ({}) => {
  const { setLyricsOptions, lyricsDisplay, setFontChange } = useLyrics();
  useEffect(() => {}, [lyricsDisplay]);
  return (
    <>
      {lyricsDisplay}
      <div
        className="text-black p-4 border"
        onClick={() => {
          if (lyricsDisplay === "default") {
            setLyricsOptions("random");
          } else if (lyricsDisplay === "random") {
            setLyricsOptions("default");
          }
        }}
      >
        checkเไำเำไ
      </div>

      <div
        className=" p-4 border"
        onClick={() => {
          setTimeout(() => {
            setFontChange("inter");
          }, 1000);
          setTimeout(() => {
            setFontChange("lora");
          }, 2000);
          setTimeout(() => {
            setFontChange("krub");
          }, 3000);
        }}
      >
        font
      </div>
    </>
  );
};

export default LyricsModal;
