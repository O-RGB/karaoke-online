import React, { ReactNode, useEffect, useRef, useState } from "react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import Button from "../button/button";
import { RiDeleteBin5Line } from "react-icons/ri";

interface TableListProps<TValue = any> {
  list?: ListItem<TValue>[];
  onClickItem?: (value: TValue, index: number) => void;
  onDeleteItem?: (value: TValue, index: number) => void;
  loading?: boolean;
  listKey: string;
  scrollToItem?: TValue;
  deleteItem?: boolean;
  itemAction?: (
    value: TValue,
    index: number,
    option: ListItem<TValue>
  ) => ReactNode;
  className?: string;
  hoverFocus?: boolean;
}

const TableList = <TValue,>({
  list,
  onClickItem,
  onDeleteItem,
  loading,
  listKey,
  scrollToItem,
  itemAction,
  deleteItem = true,
  className = "",
  hoverFocus = true,
}: TableListProps<TValue>) => {
  const [onFocus, setFocus] = useState<number>(-1);
  const itemRefs = useRef<Array<HTMLDivElement | null>>([]);

  const handleClick = (data: TValue, index: number) => {
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
    <div
      className={`${className} flex flex-col h-full w-full border rounded-md overflow-hidden`}
    >
      <div className="flex-1 overflow-auto p-2">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <AiOutlineLoading3Quarters className="animate-spin text-gray-400" />
          </div>
        ) : list && list.length > 0 ? (
          <div className="divide-y">
            {list.map((data, i) => (
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
                  data.className || ""
                }`}
                key={`${listKey}-${i}`}
              >
                {data.render
                  ? data.render()
                  : data.label && (
                      <span className="line-clamp-1">{data.label}</span>
                    )}
                <div className="flex gap-2">
                  {itemAction?.(data.value, i, data)}
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
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-300 text-xs">
            ไม่มีข้อมูล
          </div>
        )}
      </div>
    </div>
  );
};

export default TableList;
