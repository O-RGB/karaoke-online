import React from "react";

interface TempoProps {
  rounded?: string;
  bgOverLay?: string;
  blur?: string;
}

const Tempo: React.FC<TempoProps> = ({ rounded, bgOverLay, blur }) => {
  return (
    <>
      <div
        className={`${rounded} ${bgOverLay} ${blur} w-32 md:w-64 h-12 md:h-20 backdrop-blur-sm bg-white/25 border duration-300`}
      ></div>
    </>
  );
};

export default Tempo;
