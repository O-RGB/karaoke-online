import React, { ReactNode, useState, useEffect } from "react";
import { FaCheck } from "react-icons/fa";

interface SwitchRadioOption<T> {
  label?: string | React.ReactNode;
  value: T;
  children: ReactNode;
}

interface SwitchRadioProps<T> {
  value?: T;
  onChange?: (value: T) => void;
  options: SwitchRadioOption<T>[];
  disabled?: boolean;
}

const SwitchRadio = <T,>({
  value,
  onChange,
  options,
  disabled = false,
}: SwitchRadioProps<T>) => {
  const [selectedValue, setSelectedValue] = useState<T>(
    value || options[0]?.value
  );

  useEffect(() => {
    if (value !== undefined) {
      setSelectedValue(value);
    }
  }, [value]);

  const handleChange = (newValue: T) => {
    setSelectedValue(newValue);
    if (onChange) {
      onChange(newValue);
    }
  };

  return (
    <div className={`flex gap-2 flex-nowrap`}>
      {options.map((option, index) => {
        const isChecked = option.value === selectedValue;
        return (
          <div
            className={`${
              disabled
                ? "opacity-50 cursor-not-allowed"
                : "opacity-100 hover:opacity-75"
            } flex items-center gap-2 duration-300`}
            key={index}
            onClick={() =>
              disabled == false ? handleChange(option.value) : {}
            }
            style={{
              cursor: "pointer",
              padding: "5px",
              paddingLeft: "8px",
              paddingRight: "8px",
              border: isChecked ? "1px solid #3b82f6" : "1px solid gray",
              borderRadius: "5px",
              backgroundColor: "white",
            }}
          >
            <div
              style={{
                height: "18px",
                width: isChecked ? "18px" : "0px",
                overflow: "hidden",
                opacity: isChecked ? 1 : 0,
              }}
              className="flex items-center justify-center bg-blue-500 rounded-full duration-300"
            >
              <FaCheck className="text-xs text-white"></FaCheck>
            </div>

            <span className="text-sm">
              {option.label ? option.label : option.children}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default SwitchRadio;
