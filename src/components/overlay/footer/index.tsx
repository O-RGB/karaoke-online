import React from "react";
import {
  FaPlay,
  FaPause,
  FaStop,
  FaBackward,
  FaForward,
  FaRecordVinyl,
} from "react-icons/fa";

interface FooterPlayerProps {
  children?: React.ReactNode;
  bgOverLay?: string;
  blur?: string;
  rounded?: string;
  textColor?: string;
  borderColor?: string;
}
function ButtonPlayer({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex justify-center items-center border p-2 w-8 md:w-12 h-full bg-gray-100 hover:bg-gray-200 duration-300 cursor-pointer">
      {children}
    </div>
  );
}

function ValueBar({ children }: { children: React.ReactNode }) {
  return <div></div>;
}

const FooterPlayer: React.FC<FooterPlayerProps> = ({
  children,
  bgOverLay,
  blur,
  rounded,
  textColor,
  borderColor,
}) => {
  return (
    <div className="h-8 md:h-12 w-full group">
      {/*  translate-y-12 group-hover:translate-y-0 */}
      <div
        className={`${bgOverLay} ${blur}   ${textColor} ${borderColor} border h-full duration-300`}
      >
        <div className="flex h-full">
          <ButtonPlayer>
            <FaPlay className="text-[10px] md:text-base text-gray-500"></FaPlay>
          </ButtonPlayer>
          <ButtonPlayer>
            <FaPause className="text-[10px] md:text-base text-gray-500"></FaPause>
          </ButtonPlayer>
          <ButtonPlayer>
            <FaStop className="text-[10px] md:text-base text-gray-500"></FaStop>
          </ButtonPlayer>
          <ButtonPlayer>
            <FaBackward className="text-[10px] md:text-base text-gray-500"></FaBackward>
          </ButtonPlayer>
          <ButtonPlayer>
            <FaForward className="text-[10px] md:text-base text-gray-500"></FaForward>
          </ButtonPlayer>
          <ButtonPlayer>
            <FaRecordVinyl className="text-[10px] md:text-base text-gray-500"></FaRecordVinyl>
          </ButtonPlayer>
        </div>
      </div>
    </div>
  );
};

export default FooterPlayer;
