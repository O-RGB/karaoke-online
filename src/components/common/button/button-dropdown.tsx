import React, { useEffect } from "react";
import { FaLock } from "react-icons/fa";

interface ButtonDropdownProps {
  children?: React.ReactNode;
  onChange?: (value: string) => void;
  options?: IOptions[];
  value?: string;
  className?: string;
  disabled?: boolean;
}

const ButtonDropdown: React.FC<ButtonDropdownProps> = ({
  children,
  onChange,
  options,
  value,
  className,
  disabled,
}) => {
  const hanndleOnChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    onChange?.(value);
  };

  useEffect(() => {}, [value]);
  return (
    <div
      className={`relative group ${className} ${
        disabled ? "pointer-events-none" : "cursor-pointer"
      }`}
    >
      <div className="w-full">{children}</div>
      <select
        disabled={disabled}
        onChange={hanndleOnChange}
        className="absolute top-0 w-full h-6 bg-transparent cursor-pointer opacity-0"
        name=""
        id="test"
        value={value}
      >
        {options?.map((data, index) => {
          return (
            <React.Fragment key={`option-key-${index}`}>
              <option value={data.value}>{data.label}</option>
            </React.Fragment>
          );
        })}
      </select>
    </div>
  );
};

export default ButtonDropdown;
