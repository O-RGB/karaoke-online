import React, { useState, useEffect, useRef } from "react";

import Input from "../input";
import Dropdown from "../dropdown";
import { AiOutlineLoading } from "react-icons/ai";

interface SearchSelectProps extends InputProps {
  options?: IOptions[];
  onSearch?: (value: string) => Promise<IOptions[]>;
  onSelectItem?: (value: IOptions) => void;
  loading?: boolean;
  optionsStyle?: {
    className: string;
    itemHoverColor: string;
    textColor: string;
  };
}

const SearchSelect: React.FC<SearchSelectProps> = ({
  options,
  onSearch,
  onSelectItem,
  optionsStyle,
  loading,
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
    <div className="w-full blur-overlay flex flex-col " ref={dropdownRef}>
      <div className="relative">
        {loading && (
          <div className="absolute right-2 h-full flex items-center justify-center">
            <div className="h-full flex items-center justify-center">
              <AiOutlineLoading className="text-lg text-white animate-spin"></AiOutlineLoading>
            </div>
          </div>
        )}
        <Input
          {...props}
          style={{
            backgroundColor: "transparent",
            height: "36px",
          }}
          value={value}
          placeholder="ค้นหาเพลง"
          onFocus={(event) => {
            handleSearch(value);
            props.onFocus?.(event);
          }}
          onChange={(e) => {
            const value = e.target.value;
            handleSearch(value);
          }}
        />
      </div>
      <Dropdown
        {...optionsStyle}
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

export default SearchSelect;
