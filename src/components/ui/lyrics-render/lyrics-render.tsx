import useLyricsStore from "@/stores/lyrics-store";
import useTickStore from "@/stores/tick-store";
import { groupThaiCharacters } from "@/lib/app-control";
import React, { useEffect, useRef, useState } from "react";
import { usePlayer } from "@/stores/player-store";

interface LyricsRenderProps {}

const LyricsRender: React.FC<LyricsRenderProps> = ({}) => {
  const tick = useTickStore((state) => state.tick);
  const setCharIndex = useLyricsStore((state) => state.setCharIndex);
  const setDisplay = useLyricsStore((state) => state.setDisplay);
  const setDisplayBottom = useLyricsStore((state) => state.setDisplayBottom);
  const setPosition = useLyricsStore((state) => state.setPosition);

  const cursorIndices = usePlayer((state) => state.cursorIndices);
  const lyrics = usePlayer((state) => state.lyrics);
  // const lyricsCut = lyrics.slice(3);

  const position = useRef<boolean>(true);
  const [lyricsIndex, setLyricsIndex] = useState<number>(0);
  const [tickMapper, setTickMapper] = useState<TickMapper>();
  const [lyricsCut, setLyricsCut] = useState<string[]>([]);

  const reset = () => {
    setLyricsCut([]);
    setDisplay([]);
    setDisplayBottom([]);
    setTimeout(() => {
      let lyr = lyrics.slice(3);

      if (lyr.length > 0) {
        setDisplay([[lyr[0]]]);
        setLyricsCut(lyr);
      }
      if (lyr.length > 1) {
        setDisplayBottom([[lyr[1]]]);
      }
      setPosition(true);
      tickMapper?.reset();
      position.current = true;

      setLyricsIndex(0);
    }, 100);
  };

  const renderLyricsDisplay = () => {
    if (!tickMapper) {
      return;
    }
    try {
      const charIndices = tickMapper?.getValue(tick);

      if (charIndices) {
        charIndices.forEach((index) => {
          let lineIndex = 0;

          while (index >= lyricsCut[lineIndex].length) {
            index -= lyricsCut[lineIndex].length + 1;
            lineIndex++;
          }

          if (lineIndex > lyricsIndex) {
            let displayTop = [];
            let displayBottom = [];

            if (lineIndex % 2 === 0) {
              displayTop = groupThaiCharacters(lyricsCut[lineIndex + 1]);
              displayBottom = groupThaiCharacters(lyricsCut[lineIndex]);
              setPosition(false);
            } else {
              displayTop = groupThaiCharacters(lyricsCut[lineIndex]);
              displayBottom = groupThaiCharacters(lyricsCut[lineIndex + 1]);
              setPosition(true);
            }

            setLyricsIndex(lineIndex);
            position.current = !position.current;

            setDisplay(displayTop);
            setDisplayBottom(displayBottom);
          }
          setCharIndex(index + 1);
        });
      }
    } catch (error) {}
  };

  useEffect(() => {
    if (cursorIndices && lyrics) {
      reset();
      const mapper = new TickMapper(cursorIndices);
      setTickMapper(mapper);
    }
  }, [cursorIndices, lyrics]);

  useEffect(() => {
    renderLyricsDisplay();
  }, [tick]);

  return null;

  return (
    <div className="fixed top-56 left-44 border z-50">
      tick: {tick} <br />
      position: {JSON.stringify(position)} <br />
      lyricsIndex: {lyricsIndex}
    </div>
  );
};

export default LyricsRender;

interface TimePoint {
  tick: number;
  value: number[];
}

class TickMapper {
  private timePoints: TimePoint[];

  constructor(data: Map<number, number[]>) {
    // แปลง Map เป็น array ของ TimePoint และเรียงตามลำดับ
    this.timePoints = Array.from(data.entries())
      .map(([tick, values]) => ({
        tick: Number(tick),
        value: values,
      }))
      .sort((a, b) => a.tick - b.tick);
  }

  reset() {
    this.timePoints = [];
  }
  getValue(tick: number): number[] {
    // ถ้า tick น้อยกว่าจุดแรก ใช้ค่าแรก
    if (tick <= this.timePoints[0].tick) {
      return this.timePoints[0].value;
    }

    // ถ้า tick มากกว่าจุดสุดท้าย ใช้ค่าสุดท้าย
    if (tick >= this.timePoints[this.timePoints.length - 1].tick) {
      return this.timePoints[this.timePoints.length - 1].value;
    }

    // Binary search
    let left = 0;
    let right = this.timePoints.length - 1;

    while (left < right - 1) {
      // หยุดเมื่อเหลือ 2 จุดที่ติดกัน
      const mid = Math.floor((left + right) / 2);
      if (this.timePoints[mid].tick === tick) {
        return this.timePoints[mid].value;
      }

      if (this.timePoints[mid].tick < tick) {
        left = mid;
      } else {
        right = mid;
      }
    }

    return this.timePoints[left].value;
  }
}
