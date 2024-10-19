import React, { ReactNode, useEffect, useRef, useState } from "react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import Button from "../button/button";
import { RiDeleteBin5Line } from "react-icons/ri";

interface TableListProps {
  label?: string;
  list?: ListItem[];
  onClickItem?: (value: any, index: number) => void;
  onDeleteItem?: (value: any, index: number) => void;
  height?: number | string;
  loading?: boolean;
  listKey: string;
  renderKey?: string;
  scrollToItem?: string; // ชื่อของรายการที่ต้องการเลื่อนไป
  deleteItem?: boolean;
  itemAction?: (value: any, index: number) => ReactNode;
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
  itemAction,
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
        renderKey
          ? data.row[renderKey] === scrollToItem
          : data.value === scrollToItem
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
      <div
        style={{ height: height }}
        className={`flex flex-col divide-y w-full border p-2 overflow-auto rounded-md`}
      >
        {loading ? (
          <div className="flex items-center justify-center w-full h-full">
            <AiOutlineLoading3Quarters className="animate-spin text-gray-400"></AiOutlineLoading3Quarters>
          </div>
        ) : (
          list?.map((data, i) => (
            <div
              ref={(el: any) => (itemRefs.current[i] = el)}
              onClick={() => handleClick?.(data, i)}
              className={`${
                onFocus === i ? "bg-gray-300" : ""
              } p-1 hover:bg-gray-200 duration-300 cursor-pointer w-full text-sm flex justify-between ${
                data.className
              }`}
              key={`${listKey}-${i}`}
            >
              {renderKey ? data.row[renderKey] : data.row}
              <div className="flex gap-2">
                {itemAction?.(data.value, i)}
                <Button
                  shadow={false}
                  border={""}
                  onClick={() => onDeleteItem?.(data.value, i)}
                  padding=""
                  className="w-7 h-7"
                  color="red"
                  blur={false}
                  icon={
                    <RiDeleteBin5Line className="text-white"></RiDeleteBin5Line>
                  }
                ></Button>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
};

export default TableList;
