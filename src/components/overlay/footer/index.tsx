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
import usePlayer from "../../../hooks/usePlayer";
import useDesktop from "../../../hooks/useDesktop";

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
      <div
        onClick={onClick}
        className="flex justify-center items-center border p-2 w-8 md:w-12 h-full bg-gray-100 hover:bg-gray-200 duration-300 cursor-pointer"
      >
        {children}
      </div>
    );
  }

  function ValueBar({ children }: { children: React.ReactNode }) {
    return <div></div>;
  }

  return (
    <div className="h-8 md:h-12 w-full group">
      {/*  translate-y-12 group-hover:translate-y-0 */}
      <div
        className={`${bgOverLay} ${blur}   ${textColor} ${borderColor} border h-full duration-300 flex justify-between`}
      >
        <div className="flex h-full">
          {!player.playing ? (
            <ButtonPlayer
              onClick={() => {
                player.setPlaying(true);
              }}
            >
              <FaPlay className="text-[10px] md:text-base text-gray-500"></FaPlay>
            </ButtonPlayer>
          ) : (
            <ButtonPlayer
              onClick={() => {
                player.setPlaying(false);
              }}
            >
              <FaPause className="text-[10px] md:text-base text-gray-500"></FaPause>
            </ButtonPlayer>
          )}

          <ButtonPlayer>
            <FaStop className="text-[10px] md:text-base text-gray-500"></FaStop>
          </ButtonPlayer>
          <ButtonPlayer>
            <FaBackward className="text-[10px] md:text-base text-gray-500"></FaBackward>
          </ButtonPlayer>
          <ButtonPlayer>
            <FaForward className="text-[10px] md:text-base text-gray-500"></FaForward>
          </ButtonPlayer>
          {/* <ButtonPlayer>
            <FaRecordVinyl className="text-[10px] md:text-base text-gray-500"></FaRecordVinyl>
          </ButtonPlayer> */}
        </div>
        <div>
          <ButtonPlayer onClick={() => {
            desktop.setSearchInput(true)
          }}>
            <FaKeyboard className="text-[10px] md:text-base text-gray-500"></FaKeyboard>
          </ButtonPlayer>
        </div>
      </div>
    </div>
  );
};

export default FooterPlayer;
