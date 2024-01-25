import React from "react";

interface LyricsBoxProps {
  rounded?: string;
  bgOverLay?: string;
  blur?: string;
  textColor?: string;
  borderColor?: string;
}

const LyricsBox: React.FC<LyricsBoxProps> = ({
  rounded,
  bgOverLay,
  blur,
  textColor,
  borderColor,
}) => {
  return (
    <>
      <div
        className={`${rounded} ${bgOverLay} ${blur} ${textColor} ${borderColor} w-full p-2 h-[200px] md:h-[300px] border duration-300`}
      >
        <div className="flex flex-col gap-10 md:gap-20 text-3xl md:text-6xl justify-center items-center h-full">
          <div>... Test ...</div>
          <div>เนื้อเพลง</div>
        </div>
      </div>
    </>
  );
};

export default LyricsBox;
