import React, { useEffect, useRef, useState } from "react";
import TimeHeader from "./header/time";
import FooterPlayer from "./footer";
import Tempo from "./header/tempo";
import { Dropdown, MenuProps } from "antd";
import SearchSong from "./search";
import LyricsBox from "./lyrics";
import ReadMidiFileAndSound from "./test";

interface OverlayProps {
  children: React.ReactNode;
}

const Overlay: React.FC<OverlayProps> = ({ children }) => {
  const rounded = "rounded-xl";
  const bgOverLay = "bg-black/20";
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

  const [onSearchSong, setSearchSong] = useState<boolean>(false);
  const [textSearchSong, setTextSearchSong] = useState<string | undefined>(
    undefined
  );
  const timeoutIdRef: any = useRef<number | null>(null);

  const handleKeyPress = (event: any) => {
    setSearchSong(true);

    if (event.key.length == 1) {
      setTextSearchSong((value) =>
        value == undefined ? event.key : value + event.key
      );
    } else if (event.key == "Backspace") {
      setTextSearchSong((value) => value?.slice(0, value.length - 1));
    }

    if (timeoutIdRef.current !== null) {
      clearTimeout(timeoutIdRef.current);
    }

    timeoutIdRef.current = setTimeout(() => {
      setSearchSong(false);
    }, 3000);
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, []);

  return (
    <>
      <Dropdown menu={{ items }} trigger={["contextMenu"]}>
        <div className="relative w-full h-full overflow-hidden ">
          <div className="fixed top-0 left-0 z-50  w-full h-[30%] ">
            <div className="absolute top-16 md:top-24 left-2 right-2 z-50">
              <SearchSong
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
