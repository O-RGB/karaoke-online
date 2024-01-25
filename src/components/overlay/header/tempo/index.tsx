import React from "react";

interface TempoProps {
  rounded?: string;
  bgOverLay?: string;
  blur?: string;
  textColor?: string;
  borderColor?: string;
}

const Tempo: React.FC<TempoProps> = ({
  rounded,
  bgOverLay,
  blur,
  textColor,
  borderColor
}) => {
  return (
    <>
      <div
        className={`${rounded} ${bgOverLay} ${blur} ${textColor} ${borderColor} w-32 md:w-64 h-12 md:h-20  border duration-300`}
      ></div>
    </>
  );
};

export default Tempo;
