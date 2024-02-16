import React, { useRef, useEffect } from "react";

interface LevelMeterProps {
  inputVolume: number | undefined;
  up: boolean;
}

const LevelMeter: React.FC<LevelMeterProps> = ({ inputVolume, up }) => {
  useEffect(() => {}, [inputVolume]);

  return (
    <div
      style={{
        height: "100%",
        position: "relative",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
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
      className="bg-white/40"
        style={{
          width: "40%",

          height: up
            ? `${inputVolume ? Math.ceil((inputVolume / 127) * 100) : 0}%`
            : "0%",
          // height: "100%",
          // backgroundColor: "white",
          position: "absolute",
          borderRadius: "5px 5px 0px 0px",
          bottom: 0,
          transitionDuration: up ? "30ms" : "3000ms",
          opacity: 0.7,
          textAlign: "center",
        }}
      ></div>
    </div>
  );
};

export default LevelMeter;
