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
import Fuse, { FuseResult } from "fuse.js";
import useDesktop from "../../hooks/useDesktop";

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

  const [result, setResult] = useState<SearchNCN[] | undefined>(undefined);

  const TestLoadFolder = useTestLoad();
  const player = usePlayer();

  const [searchIndex, setSearchIndex] = useState<number>(0);
  const [search, setSearch] = useState<string | undefined>(undefined);
  const onArrowInput = (
    onArrows: "Left" | "Right" | "Up" | "Down" | "Reset" | undefined
  ) => {
    if (result) {
      if (onArrows == "Left") {
        desktop.setSearchBox(true);
        setSearchIndex((value) => {
          let test = value - 1;
          if (test <= 0) {
            return 0;
          } else {
            return test;
          }
        });
      } else if (onArrows == "Right") {
        desktop.setSearchBox(true);
        setSearchIndex((value) => {
          let test = value + 1;
          if (test > result.length - 1) {
            return result.length - 1;
          } else {
            return test;
          }
        });
      }
    }
  };

  const desktop = useDesktop();
  const timeoutIdRef: any = useRef<number | null>(null);

  const handleKeyPress = (event: any) => {
    let reset = () => {
      desktop.setQueueBox(false);
      desktop.setSearchBox(false);
      setResult(undefined);
      setSearch(undefined);
      onArrowInput(undefined);
      setSearchIndex(0);
    };

    if (timeoutIdRef.current !== null) {
      clearTimeout(timeoutIdRef.current);
    }
    if (event.key.length == 1) {
      desktop.setSearchBox(true);
      setSearch((value) => {
        let newValue = value == undefined ? event.key : value + event.key;
        let search = TestLoadFolder.Trie?.search(newValue);
        setResult(search);
        return newValue;
      });
    } else if (event.key == "Backspace") {
      desktop.setSearchBox(true);
      setSearch((value) => {
        let newValue = value?.slice(0, value.length - 1);
        if (newValue) {
          let search = TestLoadFolder.Trie?.search(newValue);
          setResult(search);
        }
        return newValue;
      });
    }
    if (event.key == "Enter" && desktop.SearchBox) {
      if (desktop.SearchBox) {
        if (result) {
          if (TestLoadFolder.Folder && result[searchIndex]?.path) {
            let path = result[searchIndex]?.path;
            let filename = result[searchIndex]?.filename;
            let fileObj = TestLoadFolder.readNCNByPath(filename, path);
            if (fileObj) {
              if (fileObj.lyr && fileObj.mid) {
                player.loadLyrics(fileObj.lyr);
                player.loadMidi(fileObj.mid).then((data) => {
                  if (data) {
                    desktop.setSearchBox(false);
                    setTimeout(() => {
                      player.setPlaying(true);
                    }, 1000);
                  }
                  reset();
                });
              }
            }
          }
        }
      }
    } else if (event.key === "ArrowLeft") {
      onArrowInput("Left");
    } else if (event.key === "ArrowRight") {
      onArrowInput("Right");
    } else if (event.key === "ArrowUp") {
      desktop.setQueueBox(true);
      desktop.setSearchBox(false);
      onArrowInput("Up");
    }

    timeoutIdRef.current = setTimeout(() => {
      reset();
    }, 5000);
  };

  // useEffect(() => {
  //   keypass.onInputKey(handleKeyPress);
  //   return () => {};
  // }, [result]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [search, searchIndex]);

  return (
    <>
      <Dropdown menu={{ items }} trigger={["contextMenu"]}>
        <div className="relative w-full h-full overflow-hidden ">
          <div className="fixed top-0 left-0 z-50  w-full h-[30%] flex justify-center items-center">
            <div className="absolute top-16 md:top-24 left-2 right-2 z-50">
              <SearchSong
                searchIndex={searchIndex}
                result={result}
                bgOverLay={bgOverLay}
                blur={blur}
                rounded={rounded}
                textColor={textColor}
                input={search}
                open={desktop.SearchBox}
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
            {!TestLoadFolder.Folder && (
              <ImportFolders
                bgOverLay={bgOverLay}
                blur={blur}
                rounded={rounded}
                textColor={textColor}
                borderColor={borderColor}
              ></ImportFolders>
            )}
          </div>
          <div
            className={`fixed top-16 md:top-24 right-2 ${
              desktop.SearchBox ? "z-40" : "z-50"
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

          {player.lyrics && (
            <div className="fixed bottom-10 md:bottom-14 right-2 left-2 z-50 duration-300">
              <LyricsBox
                bgOverLay={bgOverLay}
                blur={blur}
                rounded={rounded}
                textColor={textColor}
                borderColor={borderColor}
              ></LyricsBox>
            </div>
          )}

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
