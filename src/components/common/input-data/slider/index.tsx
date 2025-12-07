import Slider, { SliderProps } from "rc-slider";
import React, { useState } from "react";
import "rc-slider/assets/index.css";

export interface SliderCommonProps extends Omit<SliderProps, "onChange"> {
  onChange?: (value: number) => void;
  onPressStart?: () => void;
  onPressEnd?: () => void;
  color?: string;
}

const SliderCommon: React.FC<SliderCommonProps> = ({
  onChange,
  onPressStart,
  onPressEnd,
  color = "#2563eb",
  ...props
}) => {
  const [isUserInteracting, setIsUserInteracting] = useState(false);
  const lineThickness = 2;

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
      classNames={{
        handle:
          "!outline-none !shadow-none focus:!outline-none focus:!shadow-none",
      }}
      onChange={(value) => {
        if (typeof value === "number") {
          onChange?.(value);
        }
      }}
      styles={{
        track: {
          backgroundColor: color,
          borderWidth: 0,
          ...(props.vertical
            ? { width: lineThickness }
            : { height: lineThickness, marginTop: 0.5 }),
        },
        rail: {
          backgroundColor: `${color}33`,
          opacity: 1,
          ...(props.vertical
            ? { width: lineThickness }
            : { height: lineThickness, marginTop: 0.5 }),
        },
        handle: {
          transitionDuration: isUserInteracting ? "0s" : "0.7s",
          borderColor: color,
          backgroundColor: color,
          width: 18,
          height: 18,
          borderRadius: "50%",
          borderWidth: 3,
          marginLeft: props.vertical ? -8 : -0,
          marginTop: !props.vertical ? -8 : -0,
          opacity: 1,
        },
      }}
    />
  );
};

export default SliderCommon;
