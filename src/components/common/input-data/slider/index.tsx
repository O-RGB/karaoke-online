import Slider, { SliderProps } from "rc-slider";
import React, { useState, useRef, useEffect } from "react";
import "rc-slider/assets/index.css";

interface SliderCommonProps extends Omit<SliderProps, "onChange"> {
  onChange?: (value: number) => void;
}

const SliderCommon: React.FC<SliderCommonProps> = ({ onChange, ...props }) => {
  const [isUserInteracting, setIsUserInteracting] = useState(false);

  return (
    <Slider
      {...props}
      onBeforeChange={() => {
        setIsUserInteracting(true);
      }}
      onChangeComplete={() => {
        setIsUserInteracting(false);
      }}
      onChange={(value) => {
        if (typeof value === "number") {
          onChange?.(value);
        }
      }}
      styles={{
        handle: {
          transitionDuration: isUserInteracting ? "0s" : "1s",
        },
      }}
    />
  );
};

export default SliderCommon;
