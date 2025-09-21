import React, { useState, useRef, useEffect } from "react";
import { AiOutlineLoading } from "react-icons/ai";
import { Dropdown } from "../dropdown/dropdown";
import InputCommon from "../../data-input/input";

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
  options = [],
  onSearch,
  onSelectItem,
  optionsStyle,
  ...props
}) => {
  const [OptionsSearch, setOptionsSearch] = useState<IOptions[]>([]);
  const [value, setValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const inputContainerRef = useRef<HTMLDivElement>(null);

  const searchAsync = async (value: string): Promise<IOptions[]> => {
    if (!onSearch || !value.trim()) {
      setIsLoading(false);
      return [];
    }

    try {
      const result = await onSearch(value);
      return result ?? [];
    } catch (error) {
      console.error("Search error:", error);
      return [];
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
    const newValue = e.target.value;
    setValue(newValue);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (newValue.trim()) {
      setIsLoading(true);
      debounceTimerRef.current = setTimeout(() => {
        handleSearch(newValue);
      }, 500);
    } else {
      setOptionsSearch([]);
      setIsLoading(false);
    }
  };

  const handleItemClick = (data: IOptions) => {
    onSelectItem?.(data);
    setValue("");
    setOptionsSearch([]);
  };

  const resetOptions = () => {
    setOptionsSearch([]);
  };

  return (
    <div className="relative" ref={inputContainerRef}>
      <Dropdown
        dropdownRef={dropdownRef}
        resetOption={resetOptions}
        options={OptionsSearch}
        onClickItem={handleItemClick}
        inputContainerRef={inputContainerRef}
        {...optionsStyle}
      >
        <div className="relative">
          {isLoading && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 z-10">
              <div className="animate-spin">
                <AiOutlineLoading />
              </div>
            </div>
          )}
          <InputCommon
            {...props}
            value={value}
            placeholder="ค้นหาเพลง"
            onFocus={(event) => {
              if (value.trim()) {
                handleSearch(value);
              }
              props.onFocus?.(event);
            }}
            onChange={handleInputChange}
          />
        </div>
      </Dropdown>
    </div>
  );
};

export default SearchSelect;
