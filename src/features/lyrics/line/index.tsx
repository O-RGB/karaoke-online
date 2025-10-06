import React, { useEffect, useRef, useState } from "react";
import LyricsCharacter from "../character";
import { ISentence } from "@/lib/karaoke/lyrics/types";
import { groupThaiCharacters } from "@/lib/karaoke/cursors/lib";
import { LyricsCharacterStyle } from "../types";

interface LyricsListProps {
  sentence?: ISentence;
  tick: number;
  textStyle?: LyricsCharacterStyle;
}

const LyricsList: React.FC<LyricsListProps> = ({
  sentence,
  tick,
  textStyle,
}) => {
  const [clipPercent, setClipPercent] = useState(0);
  const [scaleX, setScaleX] = useState(1);
  const lyricsRef = useRef<HTMLDivElement>(null);

  const text = sentence?.text ?? "";

  const calculateClipPercent = () => {
    if (!sentence?.valueName.length || tick < sentence.start) return 0;

    const clusters = groupThaiCharacters(text, sentence.valueName);
    if (!clusters.length) return 0;

    const lastCluster = clusters[clusters.length - 1];
    const lastCharIndex = text.lastIndexOf(
      lastCluster.text[lastCluster.text.length - 1]
    );
    const lastCharTime = sentence.valueName[lastCharIndex] || 0;

    if (tick >= lastCharTime) return 100;

    for (let i = 0; i < clusters.length; i++) {
      const currentCluster = clusters[i];
      const nextCluster = clusters[i + 1];
      const nextTime = nextCluster ? nextCluster.tick : lastCharTime;

      if (tick >= currentCluster.tick && tick < nextTime) {
        const progress =
          (tick - currentCluster.tick) / (nextTime - currentCluster.tick);
        return ((i + progress) / clusters.length) * 100;
      }
    }

    return 0;
  };

  useEffect(() => {
    setClipPercent(calculateClipPercent());
  }, [tick, sentence]);

  const updateScale = () => {
    if (!lyricsRef.current) return;

    const textWidth = lyricsRef.current.scrollWidth;

    const padding = 32;
    const availableWidth = window.innerWidth - padding * 2;

    if (textWidth > availableWidth) {
      setScaleX(availableWidth / textWidth);
    } else {
      setScaleX(1);
    }
  };

  useEffect(() => {
    updateScale();
  }, [text]);

  useEffect(() => {
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, []);

  if (!sentence) return null;

  return (
    <div className="w-screen overflow-hidden px-8 flex justify-center">
      <div
        ref={lyricsRef}
        className="relative w-full"
        style={{
          transform: `scaleX(${scaleX})`,
          transformOrigin: "center",
          display: "inline-block",
        }}
      >
        <div className="w-full flex-col gap-2 overflow-hidden flex justify-center items-center">
          <LyricsCharacter {...textStyle} clip={clipPercent} text={text} />
        </div>
        {sentence.vocal && (
          <div className="w-full flex-col gap-2 overflow-hidden flex justify-center items-center">
            <LyricsCharacter
              {...textStyle}
              fontSize={textStyle?.fontSize ?? 0 - 10}
              color={{
                color: "#DF692E",
                colorBorder: "#0000FF",
              }}
              activeColor={{
                color: "#000000",
                colorBorder: "#ffffff",
              }}
              clip={clipPercent}
              text={sentence.vocal}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default LyricsList;
