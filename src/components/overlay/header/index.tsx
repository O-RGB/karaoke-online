import React, { useEffect, useState } from "react";
import TimeHeader from "./time";
import FooterPlayer from "../footer";
import Tempo from "./tempo";
import { Dropdown, MenuProps } from "antd";
import SearchSong from "../search";

interface OverlayProps {
  children: React.ReactNode;
}

const Overlay: React.FC<OverlayProps> = ({ children }) => {
  let padding = "2";
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
  const [clickDotTimeoutId, setClickDotTimeoutId] = useState<
    NodeJS.Timeout | undefined
  >(undefined);

  const handleKeyPress = (e: any) => {
    if (clickDotTimeoutId) {
      clearTimeout(clickDotTimeoutId);
    }
    setSearchSong(true);
    console.log(e.key);
    if (e.key != "Backspace") {
      setTextSearchSong((value) => (value == undefined ? "" : value + e.key));
    } else {
      setTextSearchSong((value) => value?.slice(0, value.length - 1));
    }

    // const newTimeout = setTimeout(() => {
    //   setSearchSong(false);
    //   setTextSearchSong(undefined);
    // }, 3000);

    // setClickDotTimeoutId(newTimeout);
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
        <div className="relative w-full h-full overflow-hidden">
          <div className="absolute top-0 left-0 z-50  w-full h-[30%]">
            <div className="absolute top-16 md:top-24 left-2 right-2">
              <SearchSong
                input={textSearchSong}
                open={onSearchSong}
              ></SearchSong>
            </div>
            <div className={`absolute right-2 top-2 flex gap-2`}>
              <TimeHeader></TimeHeader>
              <Tempo></Tempo>
            </div>
          </div>
          <div className="relative z-40">{children}</div>
          <div className="absolute bottom-0 z-50 w-full ">
            <FooterPlayer></FooterPlayer>
          </div>
        </div>
      </Dropdown>
    </>
  );
};

export default Overlay;
