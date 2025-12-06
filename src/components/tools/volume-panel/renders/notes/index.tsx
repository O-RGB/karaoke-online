import { SynthNode } from "@/features/engine/modules/instrumentals/node";
import { INoteState } from "@/features/engine/modules/instrumentals/types/node.type";
import { INoteChange } from "@/features/engine/types/synth.type";
import React, { useEffect, useRef, useMemo, useCallback } from "react";

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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const cellStatesRef = useRef<number[]>([]);
  const pendingUpdateRef = useRef<Set<number>>(new Set());
  const updateTimeoutRef = useRef<NodeJS.Timeout>();
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const dimensionsRef = useRef({
    width: 0,
    height: 0,
    cellWidth: 0,
    cellHeight: 0,
  });

  const { total, notesPerCell } = useMemo(() => {
    const total = row * col;
    const notesPerCell = Math.floor(128 / total);
    return { total, notesPerCell };
  }, [row, col]);

  useEffect(() => {
    cellStatesRef.current = new Array(total).fill(0);
  }, [total]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const updateCanvasSize = () => {
      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;

      canvas.style.width = rect.width + "px";
      canvas.style.height = rect.height + "px";

      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;

      const ctx = canvas.getContext("2d", { alpha: true });
      if (ctx) {
        ctx.scale(dpr, dpr);
        ctxRef.current = ctx;

        dimensionsRef.current = {
          width: rect.width,
          height: rect.height,
          cellWidth: rect.width / col,
          cellHeight: rect.height / row,
        };

        const allCells = new Set(Array.from({ length: total }, (_, i) => i));
        drawCells(allCells);
      }
    };

    updateCanvasSize();

    const resizeObserver = new ResizeObserver(updateCanvasSize);
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  }, [total, row, col]);

  const drawCells = useCallback(
    (cellIndices: Set<number>) => {
      const ctx = ctxRef.current;
      if (!ctx || cellIndices.size === 0) return;

      const { cellWidth, cellHeight } = dimensionsRef.current;
      const gap = 1;

      cellIndices.forEach((cellIndex) => {
        const r = Math.floor(cellIndex / col);
        const c = cellIndex % col;
        const x = c * cellWidth;
        const y = r * cellHeight;
        const count = cellStatesRef.current[cellIndex];
        const active = count > 0;

        ctx.clearRect(x, y, cellWidth, cellHeight);

        ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
        ctx.fillRect(
          x + gap / 2,
          y + gap / 2,
          cellWidth - gap,
          cellHeight - gap
        );

        if (active) {
          ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
          ctx.fillRect(
            x + gap / 2,
            y + gap / 2,
            cellWidth - gap,
            cellHeight - gap
          );
        }
      });
    },
    [row, col]
  );

  const scheduleUpdate = useCallback(
    (cellIndex: number) => {
      pendingUpdateRef.current.add(cellIndex);

      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }

      updateTimeoutRef.current = setTimeout(() => {
        drawCells(pendingUpdateRef.current);
        pendingUpdateRef.current.clear();
      }, 16);
    },
    [drawCells]
  );

  useEffect(() => {
    const id = `canvas-notes-${Date.now()}-${Math.random()}`;

    const incrementCell = (cellIndex: number) => {
      cellStatesRef.current[cellIndex]++;
      scheduleUpdate(cellIndex);
    };

    const decrementCell = (cellIndex: number) => {
      cellStatesRef.current[cellIndex] = Math.max(
        0,
        cellStatesRef.current[cellIndex] - 1
      );
      scheduleUpdate(cellIndex);
    };

    on.forEach((node, noteIndex) => {
      const cellIndex = Math.floor(noteIndex / notesPerCell);
      if (cellIndex < total) {
        node.linkEvent(
          ["NOTE_ON", "CHANGE"],
          () => incrementCell(cellIndex),
          id
        );
      }
    });

    off.forEach((node, noteIndex) => {
      const cellIndex = Math.floor(noteIndex / notesPerCell);
      if (cellIndex < total) {
        node.linkEvent(
          ["NOTE_OFF", "CHANGE"],
          () => decrementCell(cellIndex),
          id
        );
      }
    });

    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }

      on.forEach((node, noteIndex) => {
        const cellIndex = Math.floor(noteIndex / notesPerCell);
        if (cellIndex < total) {
          node.unlinkEvent(["NOTE_ON", "CHANGE"], id);
        }
      });

      off.forEach((node, noteIndex) => {
        const cellIndex = Math.floor(noteIndex / notesPerCell);
        if (cellIndex < total) {
          node.unlinkEvent(["NOTE_OFF", "CHANGE"], id);
        }
      });
    };
  }, [on, off, total, notesPerCell, scheduleUpdate]);

  return (
    <div ref={containerRef} className="w-full h-full">
      <canvas ref={canvasRef} style={{ display: "block" }} />
    </div>
  );
};

export default React.memo(NotesChannelRender);
