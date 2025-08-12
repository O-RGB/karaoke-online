import React, { useEffect, useState } from "react";
import Button from "../button/button";
import { FaPlus, FaMinus } from "react-icons/fa";

interface NumberButtonProps {
  onChange?: (value: number) => void;
  value?: number;
  icon?: React.ReactNode;
  className?: string;
  color?: string;
  suffix?: string;
}

const NumberButton: React.FC<NumberButtonProps> = ({
  value = 0,
  onChange,
  icon,
  className,
  color = "text-white",
  suffix,
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
      className={`blur-overlay border blur-border rounded-md px-2 py-1 h-fit w-fit ${className}`}
    >
      <div className={`flex justify-center items-center gap-2 ${color}`}>
        {icon}{" "}
        <div className="flex gap-2 items-center">
          <Button
            className="hover:bg-white/30 h-5"
            onClick={() => handleOnChnage("-")}
            padding="p-1"
            icon={<FaMinus className={`text-[9px] ${color}`}></FaMinus>}
          ></Button>
          <div className={`flex items-center justify-center gap-1 ${color}`}>
            <span className="-mt-0.5">
              {int} {suffix}
            </span>
          </div>
          <Button
            className="hover:bg-white/30 h-5"
            onClick={() => handleOnChnage("+")}
            padding="p-1"
            icon={<FaPlus className={`text-[9px] ${color}`}></FaPlus>}
          ></Button>
        </div>
      </div>
    </div>
  );
};

export default NumberButton;
