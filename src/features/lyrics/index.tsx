import React, { useEffect, useId, useMemo, useState } from "react";
import useConfigStore from "../config/config-store";
import LyricsList from "./line";
import { useSynthesizerEngine } from "../engine/synth-store";
import { FontDisplayManager } from "@/utils/indexedDB/db/display/table";
import { LyricsCharacterStyle } from "./types";

interface LyricsPlayerProps {
  className?: string;
}

const LyricsPlayer: React.FC<LyricsPlayerProps> = ({ className }) => {
  const componnetId = useId();

  const musicQuere = useSynthesizerEngine(
    (state) => state.engine?.player?.musicQuere
  );
  const timerUpdated = useSynthesizerEngine(
    (state) => state.engine?.timerUpdated
  );

  const {
    fontSize,
    fontAuto,
    active: colorActive,
    color,
  } = useConfigStore((state) => state.config.lyrics || {});
  const fontSetting = useConfigStore((state) => state.config.lyrics?.fontName);
  const [fontUrl, setFontUrl] = useState<string>();

  const [tick, setTick] = useState<number>(0);

  const onTickUpdated = (tick: number) => {
    console.log("musicQuere", musicQuere);
    setTick(tick);
  };

  const active = useMemo(() => {
    if (!musicQuere?.lyricsRange) return null;
    return musicQuere?.lyricsRange.search(tick);
  }, [musicQuere?.lyricsRange, tick]);

  const next = useMemo(() => {
    if (!musicQuere?.lyricsRange || !active) return null;
    return musicQuere?.lyricsRange.getByIndex(active.index + 1);
  }, [musicQuere?.lyricsRange, active]);

  const getSentenceForTag = (tag: "top" | "bottom") => {
    if (!active) return undefined;
    if (active.lyrics.tag === tag) return active.lyrics.value;
    if (next?.tag === tag) return next.value;
    return undefined;
  };

  const topSentence = getSentenceForTag("top");
  const bottomSentence = getSentenceForTag("bottom");

  const isTopActive = active?.lyrics.tag === "top";
  const isBottomActive = active?.lyrics.tag === "bottom";

  useEffect(() => {
    if (timerUpdated) {
      timerUpdated.add(["TIMING", "CHANGE"], 0, onTickUpdated, componnetId);
    }
  }, [timerUpdated]);

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
        style={{ fontFamily: fontUrl ? "customFont" : undefined }}
        className="flex flex-col gap-0 lg:gap-10 items-center justify-center text-white drop-shadow-lg w-fit"
      >
        <LyricsList
          tick={isTopActive ? tick : 0}
          sentence={topSentence}
          textStyle={textStyle}
        />
        <LyricsList
          tick={isBottomActive ? tick : 0}
          sentence={bottomSentence}
          textStyle={textStyle}
        />
      </div>
    </div>
  );
};

export default LyricsPlayer;
