import React, { useState } from "react";
import { TbPlayerSkipForwardFilled } from "react-icons/tb";
import Button from "../button/button";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

interface NextSongButtonProps {
  disabled?: boolean;
  onClick?: () => void;
  children?: React.ReactNode;
  border?: string;
}

const NextSongButton: React.FC<NextSongButtonProps> = ({
  disabled,
  onClick,
  children,
  border,
}) => {
  const [delayOnClicked, setDelayOnClicked] = useState<boolean>(false);
  const handleOnClick = () => {
    setDelayOnClicked(true);
    onClick?.();
    setTimeout(() => {
      setDelayOnClicked(false);
    }, 1000);
  };
  return (
    <>
      <Button
        className="hover:bg-white/20"
        blur={false}
        disabled={disabled}
        border={border}
        shadow=""
        padding="p-4"
        onClick={handleOnClick}
        shape={false}
        icon={
          delayOnClicked ? (
            <AiOutlineLoading3Quarters className="animate-spin text-white"></AiOutlineLoading3Quarters>
          ) : (
            <TbPlayerSkipForwardFilled className="text-white" />
          )
        }
      >
        {children}
      </Button>
    </>
  );
};

export default NextSongButton;
