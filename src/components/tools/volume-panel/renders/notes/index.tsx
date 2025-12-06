import { SynthNode } from "@/features/engine/modules/instrumentals/node";
import { INoteState } from "@/features/engine/modules/instrumentals/types/node.type";
import { INoteChange } from "@/features/engine/types/synth.type";
import React, { useMemo } from "react";
import NoteChild from "./note-child";

interface NotesChannelRenderProps {
  on: SynthNode<INoteState, INoteChange>[];
  off: SynthNode<INoteState, INoteChange>[];

  row: number;
  col: number;
}

const NotesChannelRender: React.FC<NotesChannelRenderProps> = ({
  on,
  off,
  row = 8,
  col = 8,
}) => {
  const grid = useMemo(() => {
    const total = row * col;
    const notesPerCell = Math.floor(128 / total);

    let list: any[][] = [];
    let index = 0;

    for (let r = 0; r < row; r++) {
      const rowList: any[] = [];
      for (let c = 0; c < col; c++) {
        const start = index;
        const end = index + notesPerCell;

        rowList.push({
          on: on.slice(start, end),
          off: off.slice(start, end),
        });

        index += notesPerCell;
      }
      list.push(rowList);
    }

    return list;
  }, [row, col, on, off]);

  return (
    <div className="flex flex-col w-full h-full gap-[1px]">
      {grid.map((rowItem, i) => (
        <div key={i} className="flex w-full h-full gap-[1px]">
          {rowItem.map((cell, j) => (
            <NoteChild key={`${i}-${j}`} on={cell.on} off={cell.off} />
          ))}
        </div>
      ))}
    </div>
  );
};

export default NotesChannelRender;
