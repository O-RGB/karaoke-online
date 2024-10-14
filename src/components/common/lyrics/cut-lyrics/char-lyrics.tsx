import useLyricsStore from "@/components/stores/lyrics-store";
import React, { useMemo } from "react";

interface CharLyricsProps {
  text: string;
  style?: React.CSSProperties | undefined;
  className?: string;
  fixedCharIndex?: number;
  lyrInx: number;
  textColor: LyricsColorConfig;
}

const CharLyrics: React.FC<CharLyricsProps> = ({
  text,
  style,
  className,
  fixedCharIndex,
  lyrInx,
  textColor,
}) => {
  const { charIndex } = useLyricsStore();
  const currentIndex = fixedCharIndex ?? charIndex;
  const isActive = currentIndex >= lyrInx -1 ;

  return (
    <div
      className={`${className}`}
      style={{
        color: isActive ? textColor.colorBorder : textColor.color,
      }}
    >
      {text}
    </div>
  );
};

export default CharLyrics;
