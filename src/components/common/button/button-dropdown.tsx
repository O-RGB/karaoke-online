import React, { useEffect } from "react";

interface ButtonDropdownProps {
  children?: React.ReactNode;
  onChange?: (value: string) => void;
  options?: IOptions[];
  value?: string;
}

const ButtonDropdown: React.FC<ButtonDropdownProps> = ({
  children,
  onChange,
  options,
  value,
}) => {
  const hanndleOnChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    onChange?.(value);
  };

  useEffect(() => {}, [value]);
  return (
    <div className="relative cursor-pointer w-full group">
      <div className="w-full">{children}</div>
      <select
        defaultValue={value}
        onChange={hanndleOnChange}
        className="absolute top-0 w-full h-5 bg-transparent cursor-pointer opacity-0"
        name=""
        id="test"
      >
        {options?.map((data, index) => {
          return (
            <React.Fragment key={`option-key-${index}`}>
              <option value={data.value} selected={data.value === value}>
                {data.label}
              </option>
            </React.Fragment>
          );
        })}
      </select>
    </div>
  );
};

export default ButtonDropdown;
