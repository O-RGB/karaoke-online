import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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

const RandomLyrics: React.FC<RandomLyricsProps> = React.memo(
  ({ position, display, displayBottom }) => {
    const textTopRef = useRef<HTMLDivElement | null>(null);
    const textBotRef = useRef<HTMLDivElement | null>(null);

    const [displayTop, setDisplayTop] = useState<string[][]>();
    const [displayBot, setDisplayBot] = useState<string[][]>();

    const initPosition = useCallback((ref: React.RefObject<HTMLDivElement>) => {
      if (ref.current) {
        const EffectIn = effects[Math.floor(Math.random() * effects.length)];
        const Camera = camera[Math.floor(Math.random() * camera.length)];
        requestAnimationFrame(() => {
          EffectIn(ref);
          Camera(ref);
        });
      }
    }, []);

    useEffect(() => {
      let animationFrameId: number;
      if (position) {
        const EffectOut =
          effectsOut[Math.floor(Math.random() * effectsOut.length)];
        EffectOut(textBotRef);
        setDisplayTop(display);
        animationFrameId = requestAnimationFrame(() => {
          initPosition(textTopRef);
        });
      } else {
        const EffectOut =
          effectsOut[Math.floor(Math.random() * effectsOut.length)];
        EffectOut(textTopRef);
        setDisplayBot(displayBottom);
        animationFrameId = requestAnimationFrame(() => {
          initPosition(textBotRef);
        });
      }
      return () => cancelAnimationFrame(animationFrameId);
    }, [position, display, displayBottom, initPosition]);

    const renderLyrics = useMemo(
      () => (lyrics: string[][] | undefined, prefix: string) => {
        return lyrics?.map((line, i) => {
          const text = line.join("");
          const lyr = text === " " ? "&nbsp;" : text;
          return (
            <span
              className="opacity-0 drop-shadow-lg outline-8"
              key={`${prefix}-lyr-${i}`}
              dangerouslySetInnerHTML={{ __html: lyr }}
            />
          );
        });
      },
      []
    );

    return (
      <div className="relative w-full h-full flex flex-col gap-6 lg:gap-14 items-center justify-center">
        <div
          className="text-2xl sm:text-4xl lg:text-6xl text-white"
          ref={textTopRef}
        >
          {renderLyrics(displayTop, "top")}
        </div>
        <div
          className="text-2xl sm:text-4xl lg:text-6xl text-white"
          ref={textBotRef}
        >
          {renderLyrics(displayBot, "bot")}
        </div>
      </div>
    );
  }
);

export default RandomLyrics;
