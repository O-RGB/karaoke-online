import LyricsList from "./components/lyrics-list";
import useRuntimePlayer from "@/features/player/player/modules/runtime-player";
import useLyricsStore from "@/features/lyrics/store/lyrics.store";
import useConfigStore from "@/features/config/config-store";
import useMixerStoreNew from "../player/event-player/modules/event-mixer-store";
import React, { useState, useEffect, useMemo } from "react";
import { LyricsCharacterStyle } from "./types/lyrics-character.type";
import { useOrientation } from "@/hooks/orientation-hook";
import { FontDisplayManager } from "@/utils/indexedDB/db/display/table";

interface LyricsPlayerProps {}

const LyricsPlayer: React.FC<LyricsPlayerProps> = () => {
  const { orientation } = useOrientation();
  const [windowsWidth, setWindowsWidth] = useState<number>(window.innerWidth);

  const currentTick = useRuntimePlayer((state) => state.currentTick);
  const lyricsProcessed = useLyricsStore((state) => state.lyricsProcessed);
  const sendToClient = useLyricsStore((state) => state.sendToClient);

  const hideMixer = useMixerStoreNew((state) => state.hideMixer);

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
    const handleResize = () => {
      setWindowsWidth(window.innerWidth);
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
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
      if (fontUrl) {
        URL.revokeObjectURL(fontUrl);
      }
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

  const className = `h-screen lg:h-[500px] flex items-center justify-center relative w-full rounded-lg text-center overflow-auto [&::-webkit-scrollbar]:hidden duration-300`;

  return (
    <div
      className={`w-full px-5 -z-40 ${
        !hideMixer
          ? orientation === "portrait"
            ? "pt-40 bottom-auto lg:bottom-0"
            : "pt-40 bottom-auto lg:bottom-0"
          : "bottom-0"
      } duration-300`}
      style={{ position: "fixed", left: 0 }}
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
      <div className={className}>
        <div className="text-sm gap-2 absolute text-white text-start top-2 left-2"></div>
        <div
          style={{ fontFamily: fontUrl ? "customFont" : "sans-serif" }}
          className="flex flex-col py-2 lg:py-7 gap-0 lg:gap-10 items-center justify-center text-white drop-shadow-lg w-fit overflow-hidden"
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
    </div>
  );
};

export default LyricsPlayer;
