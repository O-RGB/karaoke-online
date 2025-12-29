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

// สร้างค่าคงที่สำหรับ ID ของตัวเลือก "ไม่พบข้อมูล"
const NOT_FOUND_VALUE = "__NOT_FOUND__";

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

  const latestValueRef = useRef(value);

  const searchAsync = async (searchValue: string): Promise<IOptions[]> => {
    if (!onSearch || !searchValue.trim()) {
      setIsLoading(false);
      return [];
    }

    try {
      const result = await onSearch(searchValue);
      return result ?? [];
    } catch (error) {
      console.error("Search error:", error);
      return [];
    } finally {
      if (searchValue === latestValueRef.current) {
        setIsLoading(false);
      }
    }
  };

  const handleSearch = async (searchValue: string) => {
    const data = await searchAsync(searchValue);

    // [เพิ่ม] ตรวจสอบว่าถ้าไม่มีข้อมูลและ User ยังพิมพ์อยู่ ให้แสดง "ไม่พบข้อมูล"
    if (data.length === 0 && searchValue.trim() !== "") {
      setOptionsSearch([
        {
          label: "ไม่พบข้อมูล",
          value: NOT_FOUND_VALUE,
          // เราสามารถใช้ label เป็นตัวแสดงผลได้เลย เพราะ Dropdown จะ render label
        },
      ]);
    } else {
      setOptionsSearch(data);
    }
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
    latestValueRef.current = newValue;

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
    // [เพิ่ม] ป้องกันการกดเลือกรายการ "ไม่พบข้อมูล"
    if (data.value === NOT_FOUND_VALUE) {
      return;
    }

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
