import React, { useMemo } from "react";

interface CharLyricsProps {
  str: string[];
}

const CharLyrics: React.FC<CharLyricsProps> = ({ str }) => {
  const text = useMemo(
    () => str.map((char) => (char === " " ? "\u00A0" : char)).join(""),
    [str]
  );
  return <>{text}</>;
};

export default CharLyrics;
