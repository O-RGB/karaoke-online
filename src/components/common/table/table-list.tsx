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
  scrollToItem?: string;
  deleteItem?: boolean;
  itemAction?: (value: any, index: number, name: string) => ReactNode;
  className?: string;
  hoverFocus?: boolean;
}

const TableList: React.FC<TableListProps> = ({
  label,
  list,
  onClickItem,
  onDeleteItem,
  height,
  loading,
  listKey,
  renderKey,
  scrollToItem,
  itemAction,
  deleteItem = true,
  className,
  hoverFocus = true,
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
      const index = list.findIndex((data) => data.value === scrollToItem);
      if (index !== -1 && itemRefs.current[index]) {
        itemRefs.current[index]?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
        setFocus(index);
      }
    }
  }, [scrollToItem, list]);

  return (
    <div className="flex flex-col h-full w-full">
      <div
        className={`${className} flex-1 flex flex-col divide-y w-full border p-2 rounded-md`}
      >
        {loading ? (
          <div className="flex items-center justify-center w-full h-full">
            <AiOutlineLoading3Quarters className="animate-spin text-gray-400" />
          </div>
        ) : list && list.length > 0 ? (
          list.map((data, i) => (
            <div
              ref={(el: any) => (itemRefs.current[i] = el)}
              onClick={() => handleClick?.(data.value, i)}
              className={`${
                hoverFocus
                  ? `${
                      onFocus === i ? "bg-gray-300" : ""
                    } hover:bg-gray-200 duration-300 cursor-pointer`
                  : ""
              } p-1 w-full text-sm flex items-center justify-between ${
                data.className
              }`}
              key={`${listKey}-${i}`}
            >
              {data.row}
              <div className="flex gap-2">
                {itemAction?.(data.value, i, data.row)}
                {deleteItem && (
                  <Button
                    shadow={false}
                    border={""}
                    onClick={() => onDeleteItem?.(data.value, i)}
                    padding=""
                    className="w-7 h-7"
                    color="red"
                    blur={false}
                    icon={<RiDeleteBin5Line className="text-white" />}
                  />
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="flex items-center justify-center w-full min-h-full text-gray-300 text-xs">
            ไม่มีข้อมูล
          </div>
        )}
      </div>
    </div>
  );
};

export default TableList;
