import React, { CSSProperties } from "react";

interface RangeBarProps {
  layout?: "vertical" | "horizontal";
  min?: number;
  max?: number;
  defaultValue?: number;
  onRangeChange?: (value: number) => void;
}

const RangeBar: React.FC<RangeBarProps> = ({
  layout = "vertical",
  min,
  max,
  defaultValue,
  onRangeChange,
}) => {
  var setLayout: CSSProperties =
    layout == "vertical"
      ? {
          writingMode: "vertical-lr",
          direction: "rtl",
          verticalAlign: "middle",
        }
      : {};

  const onChangeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    const target = event.target;
    const num = parseInt(target.value);
    if (Number(num)) {
      onRangeChange?.(num);
    }
  };

  return (
    <div>
      <input
        style={{ ...setLayout, height: 90, width: 20 }}
        onChange={onChangeHandler}
        type="range"
        defaultValue={defaultValue}
        min={min}
        max={max}
      ></input>
    </div>
  );
};

export default RangeBar;
