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
    <div className="flex justify-center items-center border p-2 w-12 h-full bg-gray-100 hover:bg-gray-200 duration-300 cursor-pointer">
      {children}
    </div>
  );
}

function ValueBar({ children }: { children: React.ReactNode }) {
  return <div></div>;
}

const FooterPlayer: React.FC<FooterPlayerProps> = ({ children }) => {
  return (
    <div className="h-12 w-full group">
      <div className="border-[0.5px] border-opacity-10 h-full translate-y-12 group-hover:translate-y-0 duration-300 backdrop-blur-sm bg-white/25">
        <div className="flex h-full">
          <ButtonPlayer>
            <FaPlay></FaPlay>
          </ButtonPlayer>
          <ButtonPlayer>
            <FaPause></FaPause>
          </ButtonPlayer>
          <ButtonPlayer>
            <FaStop></FaStop>
          </ButtonPlayer>
          <ButtonPlayer>
            <FaBackward></FaBackward>
          </ButtonPlayer>
          <ButtonPlayer>
            <FaForward></FaForward>
          </ButtonPlayer>
          <ButtonPlayer>
            <FaRecordVinyl></FaRecordVinyl>
          </ButtonPlayer>
        </div>
      </div>
    </div>
  );
};

export default FooterPlayer;
