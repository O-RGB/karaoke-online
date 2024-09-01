"use client";
import React, { useEffect, useState } from "react";

interface LyricsPanelProps {
  lyrics?: string[];
}

const LyricsPanel: React.FC<LyricsPanelProps> = ({ lyrics }) => {
  const [lyrScreen, setLyrScreen] = useState<string[][]>([]);

  function splitArrayIntoPairs<T>(array: T[]): T[][] {
    const result: T[][] = [];

    for (let i = 0; i < array.length; i += 2) {
      result.push(array.slice(i, i + 2));
    }

    return result;
  }

  const testRun = () => {
    if (lyrics) {
      const res = splitArrayIntoPairs(lyrics);
      setLyrScreen(res);
    }
  };

  useEffect(() => {
    testRun();
  }, [lyrics]);

  // ทำ UI เทสเท่านั้น
  return (
    <div className="fixed bottom-20 lg:bottom-16 left-0 w-full px-5 ">
      <div className=" w-full h-56 lg:h-72 blur-overlay border blur-border rounded-lg p-2  text-xl md:text-3xl lg:text-6xl text-center overflow-auto">
        {lyrScreen?.map((data, index) => {
          const [top, bottom] = data;
          return (
            <div
              key={`lyr-index-${index}`}
              className="flex flex-col py-7 items-center justify-center text-white"
            >
              <span className="min-h-10 md:min-h-16 lg:min-h-20 flex items-center">
                {top}
              </span>{" "}
              <br />
              <span className="min-h-10 md:min-h-16 lg:min-h-20 flex items-center">
                {bottom}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LyricsPanel;
