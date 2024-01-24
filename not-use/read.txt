import React, { useEffect, useState } from "react";
import { loadInstruments } from "../sound-font/soundFont";
import soundFontPlayer, { InstrumentName } from "soundfont-player";
import { Music } from "./sound";
import {
  instrumentChannel,
  instrumentNameToChannelMapping,
} from "../sound-font/config";
import MidiPlayer from "midi-player-js";

interface ReadKaraokeProps {}

interface CursorFile {
  value: number;
}

interface LyricsFile {
  line: string;
}
interface test {
  [key: string]: string;
}
interface instrument {
  [key: string]: soundFontPlayer.Player;
}

interface instrumentProgram {
  [key: string]: number;
}

const ReadKaraoke: React.FC<ReadKaraokeProps> = ({}) => {
  const [midiTimeValues, setMidiTimeValues] = useState<CursorFile[]>([]);
  const [lyrics, setLyrics] = useState<LyricsFile[]>([]);
  const [lyricsFile, setLyricsFile] = useState<File | null>(null);
  const [cursorFile, setCursorFile] = useState<File | null>(null);
  const [midFile, setMidFile] = useState<File | null>(null);

  const [time, setTIme] = useState<number>(0);
  const [inst, setInst] = useState<instrument | undefined>(undefined);

  const [ch1, setCh1] = useState<number[] | undefined>(undefined);
  const [ch2, setCh2] = useState<number[] | undefined>(undefined);
  const [ch3, setCh3] = useState<number[] | undefined>(undefined);
  const [ch4, setCh4] = useState<number[] | undefined>(undefined);
  const [ch5, setCh5] = useState<number[] | undefined>(undefined);
  const [ch6, setCh6] = useState<number[] | undefined>(undefined);
  const [ch7, setCh7] = useState<number[] | undefined>(undefined);
  const [ch8, setCh8] = useState<number[] | undefined>(undefined);
  const [ch9, setCh9] = useState<number[] | undefined>(undefined);
  const [ch10, setCh10] = useState<number[] | undefined>(undefined);

  useEffect(() => {
    if (!inst) {
      const temp: instrument = {};

      // สร้าง Promise สำหรับแต่ละเครื่องดนตรี
      const loadInstruments = Object.keys(instrumentNameToChannelMapping).map(
        async (key: any) => {
          const audio = await soundFontPlayer.instrument(
            new AudioContext(),
            key
          );
          temp[key] = audio;
        }
      );

      // รอให้ทุก Promise ใน loadInstruments ทำงานเสร็จ
      Promise.all(loadInstruments)
        .then(() => {
          console.log("Load");
          setInst(temp);
        })
        .catch((error) => {
          console.error("Error loading instruments:", error);
        });
    }
  }, []);

  const handleLyricsFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files && event.target.files[0];
    setLyricsFile(file);
  };

  const handleCursorFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files && event.target.files[0];
    setCursorFile(file);
  };
  const handleMidFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files && event.target.files[0];
    setMidFile(file);
  };

  const loadCursor = async (file: File) => {
    try {
      const data = await file.arrayBuffer();
      const cursorData: CursorFile[] = [];
      const view = new DataView(data);

      let offset = 0;
      while (offset < view.byteLength) {
        const tmpByte1 = view.getUint8(offset);
        const tmpByte2 = view.getUint8(offset + 1);

        if (tmpByte2 === 0xff) {
          break;
        }

        const value = tmpByte1 + tmpByte2 * 256;
        console.log(value);

        cursorData.push({ value });
        offset += 2;
      }

      return cursorData;
    } catch (error) {
      console.error("Error loading cursor:", error);
    }
  };

  const loadLyrics = async (lyricsFile: File): Promise<LyricsFile[]> => {
    const data = await lyricsFile.text();
    const lines = data.split("\n");

    const lyrics: LyricsFile[] = lines.map((line) => ({ line }));

    return lyrics;
  };

  const fetchData = async () => {
    if (lyricsFile) {
      const lyricsData = await loadLyrics(lyricsFile);
      setLyrics(lyricsData);
    }

    if (cursorFile) {
      const cursorData = await loadCursor(cursorFile);
      if (cursorData) {
        setMidiTimeValues(cursorData);
      }
    }
  };

  const play = async () => {
    if (midFile) {
      try {
        const data = await midFile.arrayBuffer();

        // Initialize player and register event handler
        var Player = new MidiPlayer.Player();

        // Load a MIDI file
        Player.loadArrayBuffer(data);
        Player.enableTrack(1);

        let s = Player.getSongTime();
        console.log(Player.tempo);
        console.log(Player.division);
        console.log(Player.format);
        console.log(Player.tick);
        console.log(Player.tracks);
        setTIme(s);

        let x = Player.instruments;
        console.log(x);
        Player.play();

        //Program Change
        //

        let keySoung: instrumentProgram = {};
        Player.on("midiEvent", (event: any) => {
          if (inst && event.name == "Note on") {
            let getKey = instrumentChannel[keySoung[event.channel]];
            if (event.name == "Note on" && event.velocity > 0) {
              try {
                console.log(event);

                inst[getKey].play(event.noteNumber);
              } catch (error) {}
            } else if (event.name == "Note on" && event.velocity === 0) {
              try {
                inst[getKey].stop();
              } catch (error) {}
            }
          }

          if (event.name == "Program Change") {
            if (event.value == 0) {
              keySoung[event.channel] = 1;
            } else {
              keySoung[event.channel] = event.value;
            }
          }
        });
      } catch (error) {
        console.error("Error loading or playing MIDI file:", error);
      }
    }
  };

  return (
    <div className="flex flex-col gap-3 p-4">
      {/* {JSON.stringify(inst)} */}
      <div
        onClick={() => {
          //   if (inst) {
          //     inst["electric_piano_2"].then((data) => {
          //       data.play("G4");
          //     });
          //   }
          if (inst) {
            console.log("click");
            inst[instrumentChannel[1]].play("C4");
            inst[instrumentChannel[1]].play("E4");
            inst[instrumentChannel[1]].play("G4");
          }
        }}
      >
        testplay
      </div>
      <div className="flex flex-col">
        <label htmlFor="">Lyr File: </label>
        <input
          type="file"
          accept=".lyr"
          className="pl-6"
          onChange={handleLyricsFileChange}
        />
      </div>
      <div className="flex flex-col">
        <label htmlFor="">Cur File: </label>
        <input
          type="file"
          accept=".cur"
          className="pl-6"
          onChange={handleCursorFileChange}
        />
      </div>
      <div className="flex flex-col">
        <label htmlFor="">Mid File: </label>
        <input
          type="file"
          accept=".mid"
          className="pl-6"
          onChange={handleMidFileChange}
        />

        <button onClick={play} className="p-2 border  w-fit">
          Play
        </button>
        {time}
      </div>

      <div className="flex flex-col w-fit">
        <button onClick={fetchData} className="p-2 border ">
          Read File
        </button>
      </div>

      {/* แสดงข้อมูลที่ได้จาก midiTimeValues และ lyrics ได้ที่นี่ */}

      <div className="w-full flex gap-3">
        <div className="grid grid-cols-12">
          {midiTimeValues.map((data, index) => {
            return <div key={`midi-time-${index}`}>{data.value}</div>;
          })}
        </div>
        <div>
          {lyrics.map((data, index) => {
            return <div key={`lyrics-line-${index}`}>{data.line}</div>;
          })}
        </div>
      </div>
      <div className="w-full h-full border p-2 flex flex-col gap-2">
        <div className="flex gap-3">
          CH1:
          {ch1?.map((data, index) => {
            return <div key={`ch1-index-${index}`}>{data}</div>;
          })}
        </div>
        <div className="flex gap-3">
          CH2:
          {ch2?.map((data, index) => {
            return <div key={`ch2-index-${index}`}>{data}</div>;
          })}
        </div>
        <div className="flex gap-3">
          CH3:
          {ch3?.map((data, index) => {
            return <div key={`ch3-index-${index}`}>{data}</div>;
          })}
        </div>
        <div className="flex gap-3">
          CH4:
          {ch4?.map((data, index) => {
            return <div key={`ch4-index-${index}`}>{data}</div>;
          })}
        </div>
        <div className="flex gap-3">
          CH5:
          {ch5?.map((data, index) => {
            return <div key={`ch5-index-${index}`}>{data}</div>;
          })}
        </div>
        <div className="flex gap-3">
          CH6:
          {ch6?.map((data, index) => {
            return <div key={`ch6-index-${index}`}>{data}</div>;
          })}
        </div>
        <div className="flex gap-3">
          CH7:
          {ch7?.map((data, index) => {
            return <div key={`ch7-index-${index}`}>{data}</div>;
          })}
        </div>
        <div className="flex gap-3">
          CH8:
          {ch8?.map((data, index) => {
            return <div key={`ch8-index-${index}`}>{data}</div>;
          })}
        </div>
        <div className="flex gap-3">
          CH9:
          {ch9?.map((data, index) => {
            return <div key={`ch9-index-${index}`}>{data}</div>;
          })}
        </div>
        <div className="flex gap-3">
          CH10:
          {ch10?.map((data, index) => {
            return <div key={`ch10-index-${index}`}>{data}</div>;
          })}
        </div>
      </div>
    </div>
  );
};

export default ReadKaraoke;
