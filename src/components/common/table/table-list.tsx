import React, { useEffect, useRef, useState } from "react";
import Label from "../label";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

interface TableListProps {
  label?: string;
  list?: any[];
  onClickItem?: (key: any, index: number) => void;
  onDeleteItem?: (key: any, index: number) => void;
  height?: number;
  loading?: boolean;
  listKey: string;
  renderKey?: string;
  scrollToItem?: string; // ชื่อของรายการที่ต้องการเลื่อนไป
}

const TableList: React.FC<TableListProps> = ({
  label,
  list,
  onClickItem,
  onDeleteItem,
  height = 310,
  loading,
  listKey,
  renderKey,
  scrollToItem,
}) => {
  const [onFocus, setFocus] = useState<number>(-1);
  const itemRefs = useRef<Array<HTMLDivElement | null>>([]);

  const handleClick = (data: any, index: number) => {
    setFocus(index);
    onClickItem?.(data, index);
  };

  useEffect(() => {
    setFocus(-1);
  }, [loading]);

  useEffect(() => {
    if (scrollToItem && list) {
      const index = list.findIndex((data) =>
        renderKey ? data[renderKey] === scrollToItem : data === scrollToItem
      );
      if (index !== -1 && itemRefs.current[index]) {
        itemRefs.current[index]?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
        setFocus(index);
      }
    }
  }, [scrollToItem, list, renderKey]);

  return (
    <>
      <div key={`${listKey}`} className="w-full">
        {label && <Label>{label}</Label>}
        <div
          style={{ height: height }}
          className="relative w-full flex flex-col divide-y border p-2 overflow-auto rounded-md"
        >
          <div className={`flex flex-col divide-y w-full h-full`}>
            {loading ? (
              <div className="flex items-center justify-center w-full h-full">
                <AiOutlineLoading3Quarters className="animate-spin text-gray-400"></AiOutlineLoading3Quarters>
              </div>
            ) : (
              list?.map((data, i) => (
                <div
                  ref={(el: any) => (itemRefs.current[i] = el)} // อ้างอิงถึงรายการนี้
                  onClick={() => handleClick?.(data, i)}
                  className={`${
                    onFocus === i ? "bg-gray-300" : ""
                  } p-2 hover:bg-gray-200 duration-300 cursor-pointer w-full`}
                  key={`${listKey}-${i}`}
                >
                  {renderKey ? data[renderKey] : data}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default TableList;
