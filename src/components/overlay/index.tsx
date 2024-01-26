import React, { useEffect, useRef, useState } from "react";
import TimeHeader from "./header/time";
import FooterPlayer from "./footer";
import Tempo from "./header/tempo";
import { Dropdown, MenuProps } from "antd";
import SearchSong from "./search";
import LyricsBox from "./lyrics";
import ReadMidiFileAndSound from "./test";
import ImportFolders from "./import/folders";
import useSongPlaying from "../../hooks/useSong";
import useTestLoad from "../../hooks/useTestLoad";
import usePlayer from "../../hooks/usePlayer";

interface OverlayProps {
  children: React.ReactNode;
}

const Overlay: React.FC<OverlayProps> = ({ children }) => {
  const rounded = "rounded-xl";
  const bgOverLay = "bg-black/30";
  const blur = "backdrop-blur-sm";
  const textColor = "text-white";
  const borderColor = "border-white/30 ";

  const items: MenuProps["items"] = [
    {
      label: "1st menu item",
      key: "1",
    },
    {
      label: "2nd menu item",
      key: "2",
    },
    {
      label: "3rd menu item",
      key: "3",
    },
  ];

  const [result, setResult] = useState<SearchNCN | undefined>(undefined);
  const songPlaying = useSongPlaying();
  const TestLoadFolder = useTestLoad();
  const player = usePlayer();
  const search = (search: string) => {
    arrayTemp.map((data, index) => {
      let art = data.artist.includes(search);
      if (art) {
        setResult(data);
        return;
      }

      let filename = data.filename.includes(search);
      if (filename) {
        setResult(data);
        return;
      }

      let name = data.name.includes(search);
      if (name) {
        setResult(data);
        return;
      }
    });
  };

  const arrayTemp: SearchNCN[] = [
    {
      name: "ทำได้เพียง",
      artist: "25",
      filename: "00001",
      path: ["foldertest", "0"],
    },
    {
      name: "ปลอมไว้",
      artist: "ร่วมกับปลอม",
      filename: "00002",
      path: ["foldertest", "2"],
    },
  ];

  function getValueFromPath(path: string[], data: Folder): File | undefined {
    let current: any = data;
    for (const key of path) {
      if (current.hasOwnProperty(key)) {
        current = current[key] as Folder;
      } else {
        return undefined; // Path not found
      }
    }
    return current;
  }

  const [onSearchSong, setSearchSong] = useState<boolean>(false);
  const [textSearchSong, setTextSearchSong] = useState<string | undefined>(
    undefined
  );
  const timeoutIdRef: any = useRef<number | null>(null);

  const handleKeyPress = (event: any) => {
    setSearchSong(true);

    let reset = () => {
      setSearchSong(false);
      setResult(undefined);
      setTextSearchSong(undefined);
    };

    if (event.key.length == 1) {
      setTextSearchSong((value) => {
        let newValue = value == undefined ? event.key : value + event.key;
        search(newValue);
        return newValue;
      });
    } else if (event.key == "Backspace") {
      setTextSearchSong((value) => value?.slice(0, value.length - 1));
    } else if (event.key == "Enter") {
      // song.setCursor(result);
      console.log("endter", TestLoadFolder.Folder, result);

      let temp: any = {};
      let app: any = {};
      if (TestLoadFolder.Folder && result?.path) {
        temp = TestLoadFolder.Folder;
        let firstPath = result.path[0];
        let index = result.path.splice(1, result.path.length);
        let filename = result.filename;

        let main = "Cursor";

        let cur = getValueFromPath(
          [firstPath, main, ...index, filename + ".cur"],
          TestLoadFolder.Folder
        );

        main = "Lyrics";
        let lyr = getValueFromPath(
          [firstPath, main, ...index, filename + ".lyr"],
          TestLoadFolder.Folder
        );
        main = "Song";
        let mid = getValueFromPath(
          [firstPath, main, ...index, filename + ".mid"],
          TestLoadFolder.Folder
        );

        if (mid) {
          player.loadMidi(mid);
          setTimeout(() => {
            player.setPlaying(true);
          }, 1000);
        }
        reset();
      }
    }

    if (timeoutIdRef.current !== null) {
      clearTimeout(timeoutIdRef.current);
    }

    timeoutIdRef.current = setTimeout(() => {
      reset();
    }, 3000);
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [TestLoadFolder, result]);

  return (
    <>
      <Dropdown menu={{ items }} trigger={["contextMenu"]}>
        <div className="relative w-full h-full overflow-hidden ">
          <div className="fixed top-0 left-0 z-50  w-full h-[30%] flex justify-center items-center">
            <div className="absolute top-16 md:top-24 left-2 right-2 z-50">
              <SearchSong
                result={result}
                bgOverLay={bgOverLay}
                blur={blur}
                rounded={rounded}
                textColor={textColor}
                input={textSearchSong}
                open={onSearchSong}
                borderColor={borderColor}
              ></SearchSong>
            </div>
            <div className={`absolute right-2 top-2 flex gap-2`}>
              <TimeHeader
                bgOverLay={bgOverLay}
                blur={blur}
                rounded={rounded}
                textColor={textColor}
                borderColor={borderColor}
              ></TimeHeader>
              <Tempo
                bgOverLay={bgOverLay}
                blur={blur}
                rounded={rounded}
                textColor={textColor}
                borderColor={borderColor}
              ></Tempo>
            </div>
          </div>

          <div
            className={`fixed w-full h-full flex justify-center items-center z-50`}
          >
            <ImportFolders
              bgOverLay={bgOverLay}
              blur={blur}
              rounded={rounded}
              textColor={textColor}
              borderColor={borderColor}
            ></ImportFolders>
          </div>
          <div
            className={`fixed top-16 md:top-24 right-2 ${
              onSearchSong ? "z-40" : "z-50"
            }  duration-300`}
          >
            <ReadMidiFileAndSound
              bgOverLay={bgOverLay}
              blur={blur}
              rounded={rounded}
              textColor={textColor}
              borderColor={borderColor}
            ></ReadMidiFileAndSound>
          </div>

          <div className="fixed bottom-10 md:bottom-14 right-2 left-2 z-40 duration-300">
            <LyricsBox
              bgOverLay={bgOverLay}
              blur={blur}
              rounded={rounded}
              textColor={textColor}
              borderColor={borderColor}
            ></LyricsBox>
          </div>

          <div className="relative z-0">{children}</div>
          <div className="fixed bottom-0 z-50 w-full ">
            <FooterPlayer
              bgOverLay={bgOverLay}
              blur={blur}
              rounded={rounded}
              textColor={textColor}
              borderColor={borderColor}
            ></FooterPlayer>
          </div>
        </div>
      </Dropdown>
    </>
  );
};

export default Overlay;
