import React, { useEffect, useState } from "react";
import UpdateFile from "../common/input-data/upload";
interface CharTiming {
  char: string;
  timing: number;
}

// ฟังก์ชันสำหรับ Mapping เวลาเข้ากับแต่ละตัวอักษรในแต่ละบรรทัดของเนื้อเพลง
const mapTimingsToLyrics = (
  lyrics: string[],
  timings: number[]
): CharTiming[][] => {
  let charIndex = 0;
  return lyrics.map((line) => {
    const lineTimings = line.split("").map((char) => ({
      char,
      timing: timings[charIndex++] || 0, // หากไม่มีเวลาให้ใช้ค่า 0
    }));
    return lineTimings;
  });
};

// Component สำหรับแสดงเนื้อเพลง
const LyricsDisplay: React.FC<{ lyrics: CharTiming[][] }> = ({ lyrics }) => {
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);

  useEffect(() => {
    if (currentLineIndex < lyrics.length) {
      const currentLine = lyrics[currentLineIndex];
      if (currentCharIndex < currentLine.length) {
        const timeout = setTimeout(() => {
          setCurrentCharIndex(currentCharIndex + 1);
        }, currentLine[currentCharIndex].timing);

        return () => clearTimeout(timeout);
      } else if (currentLineIndex < lyrics.length - 1) {
        setCurrentLineIndex(currentLineIndex + 1);
        setCurrentCharIndex(0);
      }
    }
  }, [currentCharIndex, currentLineIndex, lyrics]);

  return (
    <div>
      {lyrics.slice(0, currentLineIndex + 1).map((line, lineIndex) => (
        <p key={lineIndex}>
          {line
            .slice(
              0,
              lineIndex === currentLineIndex
                ? currentCharIndex + 1
                : line.length
            )
            .map((item, charIndex) => (
              <span key={charIndex}>{item.char}</span>
            ))}
        </p>
      ))}
    </div>
  );
};

type TimeStep = number; // Each time step is a 2-byte word (0-65535)

const KaraokePlayer: React.FC = () => {
  const [lyrics, setLyrics] = useState<string[]>([]);
  const [timings, setTimings] = useState<number[]>([]);
  const [mappedLyrics, setMappedLyrics] = useState<CharTiming[][]>([]);
  const songDurationMs = 260000; // 4 นาที 20 วินาที (260 วินาที) ในมิลลิวินาที

  const handleFileUpload = async (file: File) => {
    const arrayBuffer = await file.arrayBuffer();
    const view = new DataView(arrayBuffer);
    const steps: TimeStep[] = [];

    for (let i = 0; i < arrayBuffer.byteLength; i += 2) {
      steps.push(view.getUint16(i, true)); // True for little-endian format
    }
    // const msPerStep = 2; // Adjust according to the actual MIDI time step conversion
    // const timingsInMs = steps.map((step) => step * msPerStep);

    setTimings(steps);
  };

  const handleFileUploadLyr = async (file: File) => {
    const arrayBuffer = await file.arrayBuffer();
    const decoder = new TextDecoder("windows-874");
    const contentUtf8 = decoder.decode(arrayBuffer);
    const lines = contentUtf8.split("\r\n"); // หรือ '\r\n' ตามที่เหมาะสม
    setLyrics(lines);
  };

  useEffect(() => {}, []);

  useEffect(() => {
    if (lyrics.length > 0 && timings.length > 0) {
      const mapped = mapTimingsToLyrics(lyrics, timings);
      setMappedLyrics(mapped);
    }
  }, [lyrics, timings]);

  //   useEffect(() => {
  //     if (timeSteps.length === 0) return;

  //     const timer = setInterval(() => {
  //       if (currentCharacterIndex < lyrics.length) {
  //         setCurrentCharacterIndex((prev) => prev + 1);
  //       }
  //     }, timeSteps[currentCharacterIndex] || 100); // Default to 100ms if no step is found

  //     return () => clearInterval(timer);
  //   }, [currentCharacterIndex, timeSteps]);

  return (
    <div className="text-center text-lg text-white">
      <UpdateFile
        onSelectFile={handleFileUpload}
        label="Input Cur"
      ></UpdateFile>
      <UpdateFile
        onSelectFile={handleFileUploadLyr}
        label="Input Lyr"
      ></UpdateFile>

<div className="break-all">

{JSON.stringify(timings)}
</div>
      <div>
        <h1>Lyrics Display</h1>
        {mappedLyrics.length > 0 && <LyricsDisplay lyrics={mappedLyrics} />}
      </div>

      {/* <div>
        {lyrics?.map((data, index) => {
          return <div key={`lyr-${index}`}>{data}</div>;
        })}
      </div> */}
      {/* <p>
        {lyrics.split("").map((char, index) => (
          <span
            key={index}
            className={index <= currentCharacterIndex ? "text-blue-500" : ""}
          >
            {char}
          </span>
        ))}
      </p> */}
    </div>
  );
};

export default KaraokePlayer;
