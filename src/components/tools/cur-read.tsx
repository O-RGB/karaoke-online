import React, { useState, useEffect, useRef } from "react";
import { Sequencer } from "spessasynth_lib";

interface LyricsWidgetProps {
  lyrics: string[];
  cursors: number[];
  player: Sequencer;
}

const LyricsWidget: React.FC<LyricsWidgetProps> = ({
  lyrics,
  cursors,
  player,
}) => {
  const [lines, setLines] = useState<string[]>([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [cursorPosition, setCursorPosition] = useState(0);
  const lastTickRef = useRef(0);

  const [ticks, setTicks] = useState<number>(0);

  const getMidiInfo = () => {
    const ticksPerBeat = player.midiData.timeDivision;
    const tempoChanges = player.midiData.tempoChanges;
    const tempo = tempoChanges[0].tempo;

    return {
      ticksPerBeat,
      tempoChanges,
      tempo,
    };
  };

  const getTicks = () => {
    const { tempo, ticksPerBeat } = getMidiInfo();

    let secondsPerBeat = 60.0 / tempo;
    let ticksPerSecond = ticksPerBeat / secondsPerBeat;
    let ticks = player.currentTime * ticksPerSecond;

    return {
      secondsPerBeat,
      ticksPerSecond,
      ticks,
    };
  };

  useEffect(() => {
    const { ticks } = getTicks();
    updateLyricsPosition(ticks);
    lastTickRef.current = ticks;
  }, [player.currentTime]);

  useEffect(() => {
    setLines(lyrics);
  }, [lyrics]);

  const updateLyricsPosition = (currentTick: number) => {
    let newLineIndex = 0;
    let newCursorPosition = 0;

    for (let i = 0; i < cursors.length; i++) {
      if (currentTick >= cursors[i]) {
        newLineIndex = Math.floor(i / 2);
        newCursorPosition = i % 2 === 0 ? lines[newLineIndex].length : 0;
      } else {
        break;
      }
    }

    setCurrentLineIndex(newLineIndex);
    setCursorPosition(newCursorPosition);
  };

  const renderLine = (line: string, index: number) => {
    const isCurrent = index === currentLineIndex;
    const lineClasses = `text-4xl font-bold ${
      isCurrent ? "text-yellow-300" : "text-gray-400"
    }`;
    const cursorClasses = `text-4xl font-bold text-red-500`;

    return (
      <div key={index} className="relative mb-4">
        <span className={lineClasses}>{line}</span>
        {isCurrent && (
          <span
            className={`${cursorClasses} absolute left-0 top-0 overflow-hidden whitespace-nowrap`}
            style={{ width: `${cursorPosition}ch` }}
          >
            {line}
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-black p-4">
      {lines.map((line, index) => renderLine(line, index))}
    </div>
  );
};

export default LyricsWidget;
