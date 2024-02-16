import React, { useRef, useEffect } from "react";
import "./LevelMeter.css";

interface LevelMeterProps {
  inputVolume: number | undefined;
  up: boolean;
}

const LevelMeter: React.FC<LevelMeterProps> = ({ inputVolume, up }) => {
  return (
    <div
      style={{
        height: "100%",
        position: "relative",
        width: "100%",
      }}
    >
      {/* <div
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          background: "linear-gradient(to bottom, red, yellow, green)",
        }}
      ></div> */}

      <div
        style={{
          width: "100%",
          height: up
            ? `${inputVolume ? Math.ceil((inputVolume / 127) * 100) : 0}%`
            : "0%",
          // height: "100%",
          backgroundColor: "gray",
          position: "absolute",
          bottom: 0,
          transitionDuration: up ? "" : "3000ms",
          opacity: 0.5,
          textAlign: "center",
        }}
      >
        {inputVolume ? Math.ceil((inputVolume / 127) * 100) : ""}
      </div>
    </div>
  );
};

export default LevelMeter;
