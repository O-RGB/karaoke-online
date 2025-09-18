import React from "react";
import { LyricsCharacterStyle } from "../types";

interface LyricsCharacterProps extends LyricsCharacterStyle {
  clip: number;
  text: string;
}

const LyricsCharacter: React.FC<LyricsCharacterProps> = ({
  clip,
  text,
  ...props
}) => {
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

  return (
    <div
      className={`${typeof props.fontSize === "string" ? props.fontSize : ""}`}
      style={{
        fontSize:
          typeof props.fontSize === "number"
            ? `${props.fontSize}px`
            : undefined,

        position: "relative",
        left: 0,
        top: 0,
        fontWeight: "bold",
      }}
    >
      <div
        className={`absolute left-0 top-0 w-fit h-full z-30`}
        style={{
          ...clipStyle,
          ...textOver,
          color: props.color?.color,
        }}
      >
        {text}
      </div>

      <div
        className={`absolute font-outline-2 md:font-outline-4 left-0 top-0 w-fit h-full z-20`}
        style={{
          ...clipStyle,
          ...textOver,
          color: props.activeColor?.color,
        }}
      >
        {text}
      </div>

      <div className="relative">
        <div
          style={{
            ...textOver,
            color: props.activeColor?.colorBorder,
          }}
          className="z-10 font-outline-2 md:font-outline-4 absolute top-0 left-0"
        >
          {text}
        </div>

        <div
          style={{
            ...textOver,
            color: props.color?.colorBorder,
          }}
          className="z-20 relative"
        >
          {text}
        </div>
      </div>
    </div>
  );
};

export default LyricsCharacter;
