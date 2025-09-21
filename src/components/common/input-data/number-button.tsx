import React, { useEffect, useState } from "react";
import Button, { ButtonBlur } from "../button/button";
import { FaPlus, FaMinus } from "react-icons/fa";

interface NumberButtonProps {
  onChange?: (value: number) => void;
  value?: number;
  icon?: React.ReactNode;
  className?: string;
  color?: string;
  suffix?: string;
  blur?: ButtonBlur | boolean;
}

const NumberButton: React.FC<NumberButtonProps> = ({
  value = 0,
  onChange,
  icon,
  className,
  color = "text-white",
  suffix,
  blur = {
    border: false,
    backgroundColor: "primary",
  },
}) => {
  const [int, setInt] = useState<number>(0);

  const handleOnChnage = (from: "+" | "-") => {
    let cloneValue: number = int;
    if (from === "-") {
      cloneValue = cloneValue - 1;
    } else {
      cloneValue = cloneValue + 1;
    }
    setInt(cloneValue);
    onChange?.(cloneValue);
  };

  useEffect(() => {
    setInt(value);
  }, [value]);
  return (
    <div
      className={`blur-overlay border blur-border rounded-md pl-2 pr-1 py-1 h-fit w-fit ${className}`}
    >
      <div className={`flex justify-center items-center gap-2 ${color}`}>
        {icon}{" "}
        <div className="flex gap-2 items-center">
          <Button
            blur={blur}
            onClick={() => handleOnChnage("-")}
            size="xs"
            className="!w-6 !rounded-[3px]"
            icon={<FaMinus className="font-light"></FaMinus>}
          ></Button>
          <div className={`flex items-center justify-center gap-1 ${color}`}>
            <span className="-mt-0.5">
              {int} {suffix}
            </span>
          </div>
          <Button
            blur={blur}
            onClick={() => handleOnChnage("+")}
            size="xs"
            className="!w-6 !rounded-[3px]"
            icon={<FaPlus className="font-light"></FaPlus>}
          ></Button>
        </div>
      </div>
    </div>
  );
};

export default NumberButton;
