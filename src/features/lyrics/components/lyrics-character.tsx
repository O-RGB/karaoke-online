import React, { useEffect } from "react";
import { LyricsCharacterProps } from "../types/lyrics-character.type";

const LyricsCharacter: React.FC<LyricsCharacterProps> = ({
  lyr,
  clip,
  fontSize = 20,
  font,
  color,
  activeColor,
}) => {
  const fontType = typeof fontSize;

  const clipStyle = {
    transition: clip === 0 ? "" : "clip-path 0.2s ease-out",
    clipPath: `inset(-100% -100% -100% ${clip}%)`,
  };

  const textOver: React.CSSProperties | undefined = {
    display: "inline-block",
    whiteSpace: "nowrap" as const,
    overflow: "hidden",
    textOverflow: "clip",
    height: "auto",
    maxHeight: "none",
    minHeight: "1.2em",
    lineHeight: "1.5",
  };

  useEffect(() => {}, [font]);

  return (
    <div
      className={`${
        fontType === "string" ? fontSize : ""
      } font-bold relative left-0 top-0`}
      style={{
        fontSize: fontType === "number" ? `${fontSize}px` : undefined,
        ...font?.style,
      }}
    >
      <div
        className={`absolute left-0 top-0 w-full h-full z-30`}
        style={{
          ...clipStyle,
          ...textOver,
          color: color?.color,
        }}
      >
        {lyr}
      </div>

      <div
        className={`absolute font-outline-4 left-0 top-0 w-full h-full z-20`}
        style={{
          ...clipStyle,
          ...textOver,
          color: activeColor?.color,
        }}
      >
        {lyr}
      </div>

      <div className="relative">
        <div
          style={{
            ...textOver,
            color: activeColor?.colorBorder,
          }}
          className="z-10 font-outline-4 absolute top-0 left-0"
        >
          {lyr}
        </div>
        <div
          style={{
            ...textOver,
            color: color?.colorBorder,
          }}
          className="z-20 relative"
        >
          {lyr}
        </div>
      </div>
    </div>
  );
};

export default LyricsCharacter;
