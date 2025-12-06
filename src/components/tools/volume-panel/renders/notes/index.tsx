import { SynthNode } from "@/features/engine/modules/instrumentals/node";
import { INoteState } from "@/features/engine/modules/instrumentals/types/node.type";
import { INoteChange } from "@/features/engine/types/synth.type";
import React, { useEffect, useRef, useMemo } from "react";

interface NotesChannelRenderProps {
  on: SynthNode<INoteState, INoteChange>[];
  off: SynthNode<INoteState, INoteChange>[];
  row: number;
  col: number;
}

interface CellState {
  activeCount: number;
  intensity: number;
}

const NotesChannelRender: React.FC<NotesChannelRenderProps> = ({
  on,
  off,
  row = 8,
  col = 8,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const dimensionsRef = useRef({
    width: 0,
    height: 0,
    cellWidth: 0,
    cellHeight: 0,
  });

  const cellsRef = useRef<CellState[]>([]);
  const dirtyCellsRef = useRef<Set<number>>(new Set());
  const rafRef = useRef<number>();

  const { total, notesPerCell } = useMemo(() => {
    const total = row * col;
    const notesPerCell = Math.floor(128 / total);
    return { total, notesPerCell };
  }, [row, col]);

  useEffect(() => {
    cellsRef.current = new Array(total).fill(0).map(() => ({
      activeCount: 0,
      intensity: 0,
    }));
  }, [total]);

  // Resize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const updateSize = () => {
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

        drawAllCells();
      }
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(container);
    return () => observer.disconnect();
  }, [row, col]);

  const drawCell = (i: number) => {
    const ctx = ctxRef.current;
    if (!ctx) return;

    const { cellWidth, cellHeight } = dimensionsRef.current;
    const gap = 1;

    const r = Math.floor(i / col);
    const c = i % col;

    const x = c * cellWidth;
    const y = r * cellHeight;

    const { activeCount, intensity } = cellsRef.current[i];

    const brightness = activeCount > 0 ? 0.4 : intensity * 0.2 + 0.1;

    ctx.clearRect(x, y, cellWidth, cellHeight);
    ctx.fillStyle = `rgba(255,255,255,${brightness})`;
    ctx.fillRect(x + gap / 2, y + gap / 2, cellWidth - gap, cellHeight - gap);
  };

  const drawAllCells = () => {
    const ctx = ctxRef.current;
    if (!ctx) return;

    ctx.clearRect(
      0,
      0,
      dimensionsRef.current.width,
      dimensionsRef.current.height
    );

    for (let i = 0; i < total; i++) {
      drawCell(i);
    }
  };

  //
  // ultra-low-GPU redraw scheduler
  //
  const scheduleDraw = () => {
    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = undefined;

      const dirty = dirtyCellsRef.current;
      dirty.forEach((i) => drawCell(i));
      dirty.clear();

      // soft fade-out
      let anyFade = false;
      cellsRef.current.forEach((cell, idx) => {
        if (cell.activeCount === 0 && cell.intensity > 0.02) {
          cell.intensity *= 0.92;
          dirty.add(idx);
          anyFade = true;
        }
      });

      if (anyFade) scheduleDraw();
    });
  };

  //
  // connect NOTE_ON / NOTE_OFF
  //
  useEffect(() => {
    const id = `gpu-opt-${Date.now()}`;

    const onNote = (i: number) => {
      const cell = cellsRef.current[i];
      cell.activeCount++;
      cell.intensity = 1;
      dirtyCellsRef.current.add(i);
      scheduleDraw();
    };

    const offNote = (i: number) => {
      const cell = cellsRef.current[i];
      cell.activeCount = Math.max(0, cell.activeCount - 1);
      dirtyCellsRef.current.add(i);
      scheduleDraw();
    };

    on.forEach((node, idx) => {
      const i = Math.floor(idx / notesPerCell);
      if (i < total) node.linkEvent(["NOTE_ON", "CHANGE"], () => onNote(i), id);
    });

    off.forEach((node, idx) => {
      const i = Math.floor(idx / notesPerCell);
      if (i < total)
        node.linkEvent(["NOTE_OFF", "CHANGE"], () => offNote(i), id);
    });

    return () => {
      on.forEach((node, idx) => {
        const i = Math.floor(idx / notesPerCell);
        if (i < total) node.unlinkEvent(["NOTE_ON", "CHANGE"], id);
      });

      off.forEach((node, idx) => {
        const i = Math.floor(idx / notesPerCell);
        if (i < total) node.unlinkEvent(["NOTE_OFF", "CHANGE"], id);
      });
    };
  }, [on, off, notesPerCell, total]);

  return (
    <div ref={containerRef} className="w-full h-full">
      <canvas ref={canvasRef} style={{ display: "block" }} />
    </div>
  );
};

export default React.memo(NotesChannelRender);
