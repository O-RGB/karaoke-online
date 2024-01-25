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

const FooterPlayer: React.FC<FooterPlayerProps> = ({ children }) => {
  return (
    <div className="h-8 md:h-12 w-full group">
      {/*  translate-y-12 group-hover:translate-y-0 */}
      <div className="border-[0.5px] border-opacity-10 h-full duration-300 backdrop-blur-sm bg-white/25">
        <div className="flex h-full">
          <ButtonPlayer>
            <FaPlay className="text-[10px] md:text-base"></FaPlay>
          </ButtonPlayer>
          <ButtonPlayer>
            <FaPause className="text-[10px] md:text-base"></FaPause>
          </ButtonPlayer>
          <ButtonPlayer>
            <FaStop className="text-[10px] md:text-base"></FaStop>
          </ButtonPlayer>
          <ButtonPlayer>
            <FaBackward className="text-[10px] md:text-base"></FaBackward>
          </ButtonPlayer>
          <ButtonPlayer>
            <FaForward className="text-[10px] md:text-base"></FaForward>
          </ButtonPlayer>
          <ButtonPlayer>
            <FaRecordVinyl className="text-[10px] md:text-base"></FaRecordVinyl>
          </ButtonPlayer>
        </div>
      </div>
    </div>
  );
};

export default FooterPlayer;
