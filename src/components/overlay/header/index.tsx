import React from "react";
import TimeHeader from "./time";
import FooterPlayer from "../footer";
import Tempo from "./tempo";

interface OverlayProps {
  children: React.ReactNode;
}

const Overlay: React.FC<OverlayProps> = ({ children }) => {
  let padding = "2";
  return (
    <>
      <div className="relative w-full h-full overflow-hidden">
        <div className="absolute top-0 left-0 z-50  w-full h-[30%]">
          <div
            className={`absolute ${`right-${padding}`} ${`top-${padding}`} flex gap-2`}
          >
            <TimeHeader></TimeHeader>
            <Tempo></Tempo>
          </div>
        </div>
        <div className="relative z-40">{children}</div>
        <div className="absolute bottom-0 z-50 w-full ">
          <FooterPlayer></FooterPlayer>
        </div>
      </div>
    </>
  );
};

export default Overlay;
