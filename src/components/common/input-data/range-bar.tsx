import React, { CSSProperties, useEffect, useState } from "react";
import RangeBarClone from "./range-bar-clone";
import SliderCommon from "./slider";

const RangeBar: React.FC<RangeBarProps> = ({
  layout = "vertical",
  min,
  max,
  defaultValue,
  // onChange,
  // inputProps,
  value,
}) => {
  const [range, setRange] = useState<number>(100);
  useEffect(() => {
    // if (defaultValue) {
    //   setRange(defaultValue);
    // }
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
      : {
          width: "100%",
        };

  const onChange = (value: number) => {
    setRange(value);
    onChange?.(value);
  };
  const onChangeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    const target = event.target;
    const num = parseInt(target.value);
    if (Number(num)) {
      onChange?.(num);
    }
  };

  if (layout === "vertical") {
    return (
      // <RangeBarClone
      // // onChange={onChange}
      // // min={min}
      // // max={max}
      // // value={value}
      // // disabled={inputProps?.disabled}
      // ></RangeBarClone>
      <SliderCommon></SliderCommon>
    );
  } else {
    return (
      <input
        // {...inputProps}
        // style={{
        //   ...setLayout,
        //   ...inputProps?.style,
        //   transition: "all 0.3s ease",
        // }}
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
