import React from "react";
import {
  FaPlay,
  FaPause,
  FaStop,
  FaBackward,
  FaForward,
  FaRecordVinyl,
  FaKeyboard,
} from "react-icons/fa";
import { IoMdSettings } from "react-icons/io";

import usePlayer from "../../../hooks/usePlayer";
import useDesktop from "../../../hooks/useDesktop";
import ButtonCommon from "../../common/button";

interface FooterPlayerProps {
  children?: React.ReactNode;
  bgOverLay?: string;
  blur?: string;
  rounded?: string;
  textColor?: string;
  borderColor?: string;
}

const FooterPlayer: React.FC<FooterPlayerProps> = ({
  children,
  bgOverLay,
  blur,
  rounded,
  textColor,
  borderColor,
}) => {
  const player = usePlayer();
  const desktop = useDesktop();

  function ButtonPlayer({
    children,
    onClick,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
  }) {
    return (
      <ButtonCommon
        onClick={onClick}
        rounded=""
        // className="flex justify-center items-center p-2 w-8 md:w-12 h-full bg-black/25 hover:bg-black/50 duration-300 cursor-pointer"
      >
        {children}
      </ButtonCommon>
    );
  }

  function ValueBar({ children }: { children: React.ReactNode }) {
    return <div></div>;
  }

  return (
    <div className="h-8 md:h-12 w-full group">
      {/*  translate-y-12 group-hover:translate-y-0 */}
      <div
        className={`${bgOverLay} ${blur} ${textColor} ${borderColor} border h-full w-full duration-300 flex justify-between`}
      >
        <div className="flex h-full">
          {!player.playing ? (
            <ButtonPlayer
              onClick={() => {
                player.setPlaying(true);
              }}
            >
              <FaPlay className="text-[10px] md:text-base"></FaPlay>
            </ButtonPlayer>
          ) : (
            <ButtonPlayer
              onClick={() => {
                player.setPlaying(false);
              }}
            >
              <FaPause className="text-[10px] md:text-base"></FaPause>
            </ButtonPlayer>
          )}

          <ButtonPlayer>
            <FaStop className="text-[10px] md:text-base"></FaStop>
          </ButtonPlayer>
          <ButtonPlayer>
            <FaBackward className="text-[10px] md:text-base"></FaBackward>
          </ButtonPlayer>
          <ButtonPlayer>
            <FaForward className="text-[10px] md:text-base"></FaForward>
          </ButtonPlayer>
          {/* <ButtonPlayer>
            <FaRecordVinyl className="text-[10px] md:text-base"></FaRecordVinyl>
          </ButtonPlayer> */}
        </div>
        <div className="flex">
          <ButtonPlayer
            onClick={() => {
              desktop.setSearchInput(true);
            }}
          >
            <FaKeyboard className="text-[10px] md:text-base"></FaKeyboard>
          </ButtonPlayer>
          <ButtonPlayer onClick={() => {}}>
            <IoMdSettings className="text-[10px] md:text-base"></IoMdSettings>
          </ButtonPlayer>
        </div>
      </div>
    </div>
  );
};

export default FooterPlayer;
