import { FuseResult } from "fuse.js";
import React, { useEffect, useState } from "react";

interface QueueListsProps {
  open?: boolean;
  // input?: string;
  rounded?: string;
  bgOverLay?: string;
  textColor?: string;
  borderColor?: string;
  blur?: string;
  select?: number;
  // result?: SearchNCN[];
  // searchIndex: number;
}

const QueueLists: React.FC<QueueListsProps> = ({
  open,
  // input,
  rounded,
  bgOverLay,
  textColor,
  borderColor,
  blur,
  select = 0,
  // result,
  // searchIndex,
}) => {
  // useEffect(() => {}, [searchIndex]);

  if (open == false) {
    return <></>;
  }

  const song = [{ name: "test" }, { name: "test2" }];

  return (
    <>
      <div
        className={`w-full border ${rounded} ${bgOverLay} ${blur} ${textColor} ${borderColor} p-2`}
      >
        <div className="flex gap-4 w-full">
          <div className="text-nowrap">คิวที่</div>
          <div className="w-full">ชื่อเพลง</div>
        </div>
        <div className="flex flex-col gap-2">
          {song.map((data, index) => {
            return (
              <div key={`queue-${index}`}>
                <div className="flex gap-2 w-full">
                  <div
                    className={`w-10 p-3 border ${rounded} ${
                      select == index
                        ? "border-blue-500 bg-blue-500/20"
                        : "border-transparent"
                    }`}
                  >
                    <div className={`text-center`}>{index + 1}</div>
                  </div>
                  <div className="w-full">
                    <div
                      className={`border ${rounded} ${
                        select == index
                          ? "border-blue-500 bg-blue-500/20"
                          : "border-transparent"
                      } p-3 w-full`}
                    >
                      {data.name}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default QueueLists;
