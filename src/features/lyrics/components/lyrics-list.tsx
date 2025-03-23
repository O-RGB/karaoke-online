import React, { useEffect, useRef, useState } from "react";
import { ISentence } from "../types/lyrics-player.type";
import LyricsCharacter from "./lyrics-character";
import { LyricsCharacterStyle } from "../types/lyrics-character.type";

interface LyricsListProps {
  text?: string;
  sentence?: ISentence;
  tick: number;
  containerWidth?: number;
  onStarted?: () => void;
  onCompleted?: () => void;
  textStyle?: LyricsCharacterStyle;
}

const LyricsList: React.FC<LyricsListProps> = ({
  text = "",
  sentence,
  tick,
  containerWidth,
  onStarted,
  onCompleted,
  textStyle,
}) => {
  const [clipPercent, setClipPercent] = useState(0);
  const [scaleX, setScaleX] = useState(1);
  const textRef = useRef<HTMLDivElement>(null);

  const hasCalledStarted = useRef<boolean>(false);
  const hasCalledCompleted = useRef<boolean>(false);

  const cubicEaseInOut = (t: number): number => {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  };

  useEffect(() => {
    hasCalledStarted.current = false;
    hasCalledCompleted.current = false;
  }, [text, sentence]);

  useEffect(() => {
    if (!text || !sentence || text.length === 0) {
      setClipPercent(0);
      return;
    }

    if (tick < sentence.start) {
      setClipPercent(0);
      return;
    }

    if (tick >= sentence.start && !hasCalledStarted.current && onStarted) {
      onStarted();
      hasCalledStarted.current = true;
    }

    const lastCharTime = sentence.valueName[text.length - 1] || 0;
    if (tick >= lastCharTime) {
      setClipPercent(100);

      if (!hasCalledCompleted.current && onCompleted) {
        onCompleted();
        hasCalledCompleted.current = true;
      }
      return;
    }

    let targetIndex = -1;

    for (let i = 0; i < text.length; i++) {
      const charTime = sentence.valueName[i] || 0;
      if (tick >= charTime) {
        targetIndex = i;
      } else {
        break;
      }
    }

    if (targetIndex < 0) {
      setClipPercent(0);
      return;
    }

    const textLength = text.length;
    const currentCharTime = sentence.valueName[targetIndex];
    let percent = ((targetIndex + 1) / textLength) * 100;

    if (targetIndex + 1 < textLength) {
      const nextCharTime = sentence.valueName[targetIndex + 1];
      const timeBetween = nextCharTime - currentCharTime;

      if (timeBetween > 0 && tick < nextCharTime) {
        const rawProgress = (tick - currentCharTime) / timeBetween;
        const easedProgress = cubicEaseInOut(rawProgress);

        if (timeBetween <= 150) {
          percent = ((targetIndex + 1 + easedProgress) / textLength) * 100;
        } else {
          percent = ((targetIndex + 1) / textLength) * 100;
        }
      }
    }

    setClipPercent(percent);
  }, [tick, text, sentence, onStarted, onCompleted]);

  useEffect(() => {
    if (textRef.current && containerWidth) {
      const textWidth = textRef.current.scrollWidth;

      if (textWidth > containerWidth) {
        setScaleX(containerWidth / textWidth);
      } else {
        setScaleX(1);
      }
    }
  }, [text, containerWidth]);

  return (
    <div
      ref={textRef}
      className="px-10"
      style={{
        transform: `scaleX(${scaleX})`,
        transformOrigin: "center center",
      }}
    >
      <LyricsCharacter {...textStyle} clip={clipPercent} lyr={text} />
    </div>
  );
};

export default LyricsList;
