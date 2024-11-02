import React, { ReactNode } from "react";
import { IoMdArrowDropdown } from "react-icons/io";
import Label from "../../display/label";

type AllowValueType = string | number | readonly string[] | undefined;
interface SelectOptionsProps {
  label?: string;
  value: AllowValueType;
}

interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "onChange"> {
  options?: SelectOptionsProps[];
  onChange?: (value: any) => void;
  defaultValue?: AllowValueType;
}

const Select = <T,>({
  options,
  onChange,
  defaultValue,
  ...props
}: SelectProps) => {
  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = event.target.value;
    onChange?.(selectedValue);
  };

  return (
    <div className="relative">
      <div className="absolute top-2.5 right-2 text-gray-500">
        <IoMdArrowDropdown></IoMdArrowDropdown>
      </div>
      <select
        {...props}
        className="appearance-none cursor-pointer w-full bg-transparent border rounded-md focus:outline-none p-1 border-blue-500 duration-300 disabled:opacity-20 disabled:pointer-events-none disabled:!cursor-not-allowed"
        value={defaultValue}
        onChange={handleChange}
      >
        {options?.map((option, index) => (
          <option key={index} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default Select;
