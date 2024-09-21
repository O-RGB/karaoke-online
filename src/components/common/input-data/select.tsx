import React, { useState, useEffect, useRef } from "react";

import Input from "./input";
import Dropdown from "./dropdown";

interface SelectProps extends InputProps {
  options?: IOptions[];
  onSearch?: (value: string) => Promise<IOptions[]>;
  onSelectItem?: (value: IOptions) => void;
}

const Select: React.FC<SelectProps> = ({
  options,
  onSearch,
  onSelectItem,
  ...props
}) => {
  const [Options, setOptions] = useState<IOptions[]>([]);
  const [OptionsSearch, setOptionsSearch] = useState<IOptions[]>([]);
  const [value, setValue] = useState<string>("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setOptions(options ?? []);
  }, [options]);

  const searchAsync = async (value: string): Promise<IOptions[]> => {
    return (await onSearch?.(value)) ?? [];
  };

  const searchInOption = (value: string): IOptions[] => {
    return [];
  };

  const handleSearch = async (value: string) => {
    const data = options ? searchInOption(value) : await searchAsync(value);
    setOptionsSearch(data);
    setValue(value);
  };

  const handleItemClick = (data: IOptions) => {
    onSelectItem?.(data);
    setValue("");
    setOptionsSearch([]);
  };

  return (
    <div className="w-full blur-overlay flex flex-col" ref={dropdownRef}>
      <Input
        {...props}
        style={{
          backgroundColor: "transparent",
        }}
        value={value}
        placeholder="ค้นหาเพลง"
        onFocus={() => {
          handleSearch(value);
        }}
        onChange={(e) => {
          const value = e.target.value;
          handleSearch(value);
        }}
      />
      <Dropdown
        dropdownRef={dropdownRef}
        resetOption={() => {
          setOptionsSearch([]);
        }}
        options={OptionsSearch}
        onClickItem={handleItemClick}
      />
    </div>
  );
};

export default Select;
