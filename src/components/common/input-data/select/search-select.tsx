import React, { useState, useRef, useEffect } from "react";

import Input from "../input";
import Dropdown from "../dropdown";
import { AiOutlineLoading } from "react-icons/ai";

interface SearchSelectProps extends InputProps {
  options?: IOptions[];
  onSearch?: (value: string) => Promise<IOptions[]>;
  onSelectItem?: (value: IOptions) => void;
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
  ...props
}) => {
  const [OptionsSearch, setOptionsSearch] = useState<IOptions[]>([]);
  const [value, setValue] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const searchAsync = async (value: string): Promise<IOptions[]> => {
    try {
      return (await onSearch?.(value)) ?? [];
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (value: string) => {
    const data = await searchAsync(value);
    setOptionsSearch(data);
  };

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsLoading(true);
    const newValue = e.target.value;
    setValue(newValue);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      handleSearch(newValue);
    }, 500);
  };

  const handleItemClick = (data: IOptions) => {
    onSelectItem?.(data);
    setValue("");
    setOptionsSearch([]);
  };

  return (
    <div className="w-full blur-overlay flex flex-col " ref={dropdownRef}>
      <div className="relative">
        {isLoading && (
          <div className="absolute right-2 h-full flex items-center justify-center">
            <div className="h-full flex items-center justify-center">
              <AiOutlineLoading className="text-lg text-white animate-spin font-bold"></AiOutlineLoading>
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
            if (value) {
              handleSearch(value);
            }
            props.onFocus?.(event);
          }}
          onChange={handleInputChange}
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
