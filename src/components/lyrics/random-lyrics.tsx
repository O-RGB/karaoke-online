import React, { useEffect, useRef, useState } from "react";
import {
  animateBounceIn,
  animateCharactersIn,
  animateFadeFromBottom,
  animateRainbowIn,
  animateRotateIn,
  animateScaleIn,
  animateTypewriter,
  animateWaveIn,
  zoomIn,
  panRight,
  animateCharactersOut,
  panLeft,
} from "@/lib/animations/text-animations";

const transitionTypes = [
  "circle",
  "topToBottom",
  "leftToRight",
  "diagonalTransition",
  "fadeInZoomTransition",
  "fadeOutRotateTransition",
  "waveTransition",
  "spiralTransition",
];

const effects = [
  animateScaleIn,
  animateCharactersIn,
  animateWaveIn,
  animateRotateIn,
  animateBounceIn,
  animateTypewriter,
  animateRainbowIn,
  animateFadeFromBottom,
];
const effectsOut = [animateCharactersOut];
const camera = [zoomIn, panRight, panLeft];

interface RandomLyricsProps {
  position: boolean;
  display: string[][];
  displayBottom: string[][];
}

const RandomLyrics: React.FC<RandomLyricsProps> = ({
  position,
  display,
  displayBottom,
}) => {
  const textTopRef = useRef<HTMLDivElement | null>(null);
  const textBotRef = useRef<HTMLDivElement | null>(null);

  const [transition, setTransition] = useState<any>();
  const [color, setColor] = useState<any>();

  const [displayTop, setDisplayTop] = useState<string[][]>();
  const [displayBot, setDisplayBot] = useState<string[][]>();

  // ฟังก์ชันเพื่อสุ่มสีพาสเทลที่เข้มขึ้น
  const getRandomPastelColor = () => {
    const random = () => Math.floor(Math.random() * 128 + 64); // ค่าสี RGB 64-192 เพื่อให้เป็นสีพาสเทลเข้ม
    const r = random();
    const g = random();
    const b = random();
    return `rgb(${r}, ${g}, ${b})`;
  };

  // ฟังก์ชันเพื่อสุ่ม transitionType
  const getRandomTransitionType = () => {
    const index = Math.floor(Math.random() * transitionTypes.length);
    return transitionTypes[index];
  };

  const initPosition = (ref: any) => {
    const InIndex = Math.floor(Math.random() * effects.length);
    const EffectIn = effects[InIndex];
    const CameraIndex = Math.floor(Math.random() * camera.length);
    const Camera = camera[CameraIndex];
    EffectIn(ref);
    Camera(ref);
  };

  useEffect(() => {
    if (position === true) {
      const OutIndex = Math.floor(Math.random() * effectsOut.length);
      const EffectOut = effectsOut[OutIndex];
      EffectOut(textBotRef);
      setDisplayTop(display);
      setTimeout(() => {
        initPosition(textTopRef);
      }, 300);
    }
  }, [position]);

  useEffect(() => {
    if (position === false) {
      const OutIndex = Math.floor(Math.random() * effectsOut.length);
      const EffectOut = effectsOut[OutIndex];
      EffectOut(textTopRef);

      setDisplayBot(displayBottom);
      setTimeout(() => {
        initPosition(textBotRef);
      }, 300);
    }
  }, [position]);
  return (
    <>
      <div className="relative w-full h-full flex flex-col gap-14 items-center justify-center">
        <div
          className="text-2xl sm:text-4xl lg:text-6xl   text-white "
          ref={textTopRef}
        >
          {displayTop?.map((_, i) => {
            let text = _.join("");
            let lyr = text === " " ? "&nbsp;" : text;
            return (
              <span
                className="opacity-0"
                key={`top-lyr-${i}`}
                dangerouslySetInnerHTML={{ __html: lyr }}
              ></span>
            );
          })}
        </div>
        <div
          className="text-2xl sm:text-4xl lg:text-6xl  text-white "
          ref={textBotRef}
        >
          {displayBot?.map((_, i) => {
            let text = _.join("");
            let lyr = text === " " ? "&nbsp;" : text;
            return (
              <span
                className="opacity-0"
                key={`top-lyr-${i}`}
                dangerouslySetInnerHTML={{ __html: lyr }}
              ></span>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default RandomLyrics;
