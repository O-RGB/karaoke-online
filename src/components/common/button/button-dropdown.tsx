import React from "react";

interface ButtonDropdownProps {
  children?: React.ReactNode;
  onChange?: (value: string) => void;
  options?: IOptions[];
}

const ButtonDropdown: React.FC<ButtonDropdownProps> = ({
  children,
  onChange,
  options,
}) => {
  const hanndleOnChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    onChange?.(value);
  };
  return (
    <div className="relative cursor-pointer w-full group">
      <div className="w-full">{children}</div>
      <select
        onChange={hanndleOnChange}
        className="absolute top-0 w-full h-4 bg-transparent cursor-pointer opacity-0"
        name=""
        id="test"
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
