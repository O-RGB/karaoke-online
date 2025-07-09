import React from "react";
import { IoMdArrowDropdown } from "react-icons/io";

interface SelectProps<T extends string>
  extends Omit<
    React.SelectHTMLAttributes<HTMLSelectElement>,
    "onChange" | "options" | "defaultValue"
  > {
  options?: ListItem<T>[];
  onChange?: (value: T) => void;
  defaultValue?: T;
}

const Select = <T extends string>({
  options,
  onChange,
  defaultValue,
  ...props
}: SelectProps<T>) => {
  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = event.target.value as T;
    onChange?.(selectedValue);
  };

  return (
    <div className="relative">
      <div className="absolute top-2.5 right-2 text-gray-500">
        <IoMdArrowDropdown />
      </div>
      <select
        {...props}
        className="appearance-none cursor-pointer w-full bg-transparent border rounded-md focus:outline-none p-1 border-blue-500 duration-300 disabled:opacity-20 disabled:pointer-events-none disabled:!cursor-not-allowed"
        value={defaultValue}
        onChange={handleChange}
      >
        {options?.map((option, index) => (
          <option key={index} value={option.value}>
            {option.label ?? option.value}
          </option>
        ))}
      </select>
    </div>
  );
};

export default Select;
