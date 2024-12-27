import Slider, { SliderProps } from "rc-slider";
import React, { useState, useRef, useEffect } from "react";
import "rc-slider/assets/index.css";

interface SliderCommonProps extends Omit<SliderProps, "onChange"> {
  onChange?: (value: number) => void;
  onPressStart?: () => void;
  onPressEnd?: () => void;
  color?: string;
}

const SliderCommon: React.FC<SliderCommonProps> = ({
  onChange,
  onPressStart,
  onPressEnd,
  color,
  ...props
}) => {
  const [isUserInteracting, setIsUserInteracting] = useState(false);

  return (
    <Slider
      {...props}
      onBeforeChange={() => {
        setIsUserInteracting(true);
        onPressStart?.();
      }}
      onChangeComplete={() => {
        setIsUserInteracting(false);
        onPressEnd?.();
      }}
      onChange={(value) => {
        if (typeof value === "number") {
          onChange?.(value);
        }
      }}
      styles={{
        handle: {
          transitionDuration: isUserInteracting ? "0s" : "1s",
          borderColor: color,
          backgroundColor: color,
        },
        track: {
          backgroundColor: color,
        },
        rail: {
          backgroundColor: `${color}33`,
        },
      }}
    />
  );
};

export default SliderCommon;
