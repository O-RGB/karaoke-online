import React, { CSSProperties, useEffect, useState } from "react";
import InputRange from "react-input-range";
import RangeBarClone from "./range-bar-clone";

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;
interface RangeBarProps {
  layout?: "vertical" | "horizontal";
  min?: number;
  max?: number;
  defaultValue?: number;
  onRangeChange?: (value: number) => void;
  inputProps?: InputProps;
  value?: number;
}

const RangeBar: React.FC<RangeBarProps> = ({
  layout = "vertical",
  min,
  max,
  defaultValue,
  onRangeChange,
  inputProps,
  value,
}) => {
  const [range, setRange] = useState<number>(100);
  useEffect(() => {
    if (defaultValue) {
      setRange(defaultValue);
    }
  }, [defaultValue]);
  var setLayout: CSSProperties =
    layout == "vertical"
      ? {
          writingMode: "vertical-lr",
          direction: "rtl",
          verticalAlign: "middle",
          height: "100%",
          width: 20,
        }
      : {};

  const onChange = (value: number) => {
    setRange(value);
    onRangeChange?.(value);
  };
  const onChangeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    const target = event.target;
    const num = parseInt(target.value);
    if (Number(num)) {
      onRangeChange?.(num);
    }
  };

  useEffect(() => {}, [value]);

  if (layout === "vertical") {
    return (
      <RangeBarClone
        onChange={onRangeChange}
        defaultValue={defaultValue}
        min={min}
        max={max}
        value={value}
      ></RangeBarClone>
    );
  } else {
    return (
      <input
        {...inputProps}
        style={{
          ...setLayout,
          ...inputProps?.style,
          transition: "all 0.3s ease",
        }}
        onChange={onChangeHandler}
        type="range"
        defaultValue={defaultValue}
        className="transition duration-300"
        min={min}
        max={max}
        value={value}
      ></input>
    );
  }
};

export default RangeBar;
