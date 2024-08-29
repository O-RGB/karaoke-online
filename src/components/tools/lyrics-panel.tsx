"use client";
import React, { useEffect } from "react";

interface LyricsPanelProps {
  lyrics?: string[];
}

const LyricsPanel: React.FC<LyricsPanelProps> = ({ lyrics }) => {
  useEffect(() => {}, [lyrics]);
  return (
    <div className="fixed bottom-14 left-0 w-full px-2.5 ">
      <div className=" w-full h-56 lg:h-72 blur-overlay rounded-lg p-2 text-5xl text-center overflow-auto">
        {lyrics?.map((data, index) => {
          return <div key={`lyr-index-${index}`}>{data}</div>;
        })}
      </div>
    </div>
  );
};

export default LyricsPanel;
