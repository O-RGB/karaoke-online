import React, { CSSProperties, useEffect } from "react";

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

  const onChangeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    const target = event.target;
    const num = parseInt(target.value);
    if (Number(num)) {
      onRangeChange?.(num);
    }
  };

  useEffect(() => {}, [value]);

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
      min={min}
      max={max}
      value={value}
    ></input>
  );
};

export default RangeBar;
