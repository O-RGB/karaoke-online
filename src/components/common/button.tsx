import React from "react";

interface ButtonCommonProps {
  onClick?: () => void;
  children?: React.ReactNode;
  rounded?: string;
  bgOverLay?: string;
  blur?: string;
}

const ButtonCommon: React.FC<ButtonCommonProps> = ({
  onClick,
  children,
  rounded = "rounded-xl",
  bgOverLay = "bg-white/10 hover:bg-white/20",
  blur = "backdrop-blur-sm",
}) => {
  const textColor = "text-white";
  const borderColor = "border-white/30 ";
  return (
    <>
      <div
        onClick={onClick}
        className={`px-4 flex justify-center items-center ${bgOverLay} duration-300 cursor-pointer ${borderColor} ${blur} ${textColor} ${rounded}`}
      >
        {children}
      </div>
    </>
  );
};

export default ButtonCommon;
