import LyricsList from "./components/lyrics-list";
import useRuntimePlayer from "@/features/player/player/modules/runtime-player";
import useLyricsStore from "@/features/lyrics/store/lyrics.store";
import useConfigStore from "@/features/config/config-store";
import React, { useState, useEffect, useMemo } from "react";
import { LyricsCharacterStyle } from "./types/lyrics-character.type";
import { FontDisplayManager } from "@/utils/indexedDB/db/display/table";

interface LyricsPlayerProps {
  className?: string;
}

const LyricsPlayer: React.FC<LyricsPlayerProps> = ({ className }) => {
  const [windowsWidth, setWindowsWidth] = useState<number>(0);
  const currentTick = useRuntimePlayer((state) => state.currentTick);
  const lyricsProcessed = useLyricsStore((state) => state.lyricsProcessed);
  const sendToClient = useLyricsStore((state) => state.sendToClient);
  const {
    fontSize,
    fontAuto,
    active: colorActive,
    color,
  } = useConfigStore((state) => state.config.lyrics || {});
  const fontSetting = useConfigStore((state) => state.config.lyrics?.fontName);
  const [fontUrl, setFontUrl] = useState<string>();

  const active = useMemo(() => {
    if (!lyricsProcessed) return null;
    return lyricsProcessed.search(currentTick);
  }, [lyricsProcessed, currentTick]);

  const next = useMemo(() => {
    if (!lyricsProcessed || !active) return null;
    return lyricsProcessed.getByIndex(active.index + 1);
  }, [lyricsProcessed, active]);

  const topText = useMemo(() => {
    if (!active) return undefined;
    return active.lyrics.tag === "top"
      ? active.lyrics.value.text
      : next?.tag === "top" && active.lyrics.tag === "bottom"
      ? next.value.text
      : undefined;
  }, [active, next]);

  const bottomText = useMemo(() => {
    if (!active) return undefined;
    return active.lyrics.tag === "bottom"
      ? active.lyrics.value.text
      : next?.tag === "bottom" && active.lyrics.tag === "top"
      ? next.value.text
      : undefined;
  }, [active, next]);

  useEffect(() => {
    sendToClient?.(topText, bottomText);
  }, [topText, bottomText, sendToClient]);

  useEffect(() => {
    const handleResize = () => setWindowsWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    handleResize(); // Initial call
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fontDisplayManager = new FontDisplayManager();
    const initFont = async () => {
      if (Number(fontSetting)) {
        const response = await fontDisplayManager.get(Number(fontSetting));
        const file = response?.file;

        if (file) {
          const url = URL.createObjectURL(file);
          setFontUrl(url);
        } else {
          setFontUrl(undefined);
        }
      } else {
        setFontUrl(undefined);
      }
    };
    initFont();
    return () => {
      if (fontUrl) URL.revokeObjectURL(fontUrl);
    };
  }, [fontSetting]);

  const textStyle: LyricsCharacterStyle = useMemo(
    () => ({
      activeColor: colorActive,
      fontSize: fontAuto
        ? "text-2xl md:text-3xl lg:text-6xl"
        : Number(fontSize),
      color: color,
    }),
    [colorActive, fontAuto, fontSize, color]
  );

  if (!active) {
    return null;
  }

  return (
    <div
      className={`w-full h-full flex items-center justify-center -z-10 p-5 ${className}`}
    >
      {fontUrl && (
        <style>
          {`
            @font-face {
              font-family: 'customFont';
              src: url(${fontUrl}) format('truetype');
            }
          `}
        </style>
      )}
      <div
        style={{ fontFamily: fontUrl ? "customFont" : "sans-serif" }}
        className="flex flex-col gap-0 lg:gap-10 items-center justify-center text-white drop-shadow-lg w-fit"
      >
        <LyricsList
          tick={active.lyrics.tag === "top" ? currentTick : 0}
          containerWidth={windowsWidth}
          sentence={active.lyrics.value}
          text={topText}
          textStyle={textStyle}
        />
        <LyricsList
          tick={active.lyrics.tag === "bottom" ? currentTick : 0}
          containerWidth={windowsWidth}
          sentence={active.lyrics.value}
          text={bottomText}
          textStyle={textStyle}
        />
      </div>
    </div>
  );
};

export default LyricsPlayer;
