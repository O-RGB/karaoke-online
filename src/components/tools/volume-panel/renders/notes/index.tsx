import React, { useEffect, useRef, useMemo, useId, useState } from "react";
import { NoteEventManager } from "@/features/engine/modules/notes-modifier-manager/note";
import { INoteChange } from "@/features/engine/types/synth.type";
import { SynthChannel } from "@/features/engine/modules/instrumentals/channel";

interface NotesChannelRenderProps {
  noteModifier: NoteEventManager[];
  row: number;
  col: number;
  stop?: boolean;
  node: SynthChannel;
}

interface CellState {
  activeCount: number;
  intensity: number;
}

const NotesChannelRender: React.FC<NotesChannelRenderProps> = ({
  noteModifier,
  row = 8,
  col = 8,
  stop = false,
  node,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const componentId = useId();

  const [active, setActive] = useState<boolean>(false);

  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const dimensionsRef = useRef({
    width: 0,
    height: 0,
    cellWidth: 0,
    cellHeight: 0,
  });

  const cellsRef = useRef<CellState[]>([]);
  const dirtyCellsRef = useRef<Set<number>>(new Set());
  const rafRef = useRef<number | undefined>(undefined);

  const { total, notesPerCell } = useMemo(() => {
    const total = row * col;
    const notesPerCell = Math.floor(128 / total);
    return { total, notesPerCell };
  }, [row, col]);

  /* ---------- helper: check if should run ---------- */
  // ฟังก์ชันช่วยเช็คว่าควรจะรันแอนิเมชันหรือไม่
  const canRender = () => {
    return active && !stop && !document.hidden;
  };

  /* ---------- init cells ---------- */
  useEffect(() => {
    cellsRef.current = new Array(total).fill(0).map(() => ({
      activeCount: 0,
      intensity: 0,
    }));
  }, [total]);

  /* ---------- canvas resize ---------- */
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
      if (!ctx) return;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);

      ctxRef.current = ctx;
      dimensionsRef.current = {
        width: rect.width,
        height: rect.height,
        cellWidth: rect.width / col,
        cellHeight: rect.height / row,
      };

      drawAllCells();
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(container);

    return () => observer.disconnect();
  }, [row, col]);

  /* ---------- drawing logic ---------- */
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
    const brightness = activeCount > 0 ? 0.5 : intensity * 0.25 + 0.1;

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

  /* ---------- animation scheduler ---------- */
  const scheduleDraw = () => {
    // 1. ถ้าไม่ active, ถูกสั่ง stop หรือ tab ถูกซ่อน ให้หยุด loop ทันที
    if (!canRender()) {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = undefined;
      }
      return;
    }

    if (rafRef.current) return;

    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = undefined;

      const dirty = dirtyCellsRef.current;
      dirty.forEach((i) => drawCell(i));
      dirty.clear();

      let anyFade = false;
      cellsRef.current.forEach((cell, idx) => {
        if (cell.activeCount === 0 && cell.intensity > 0.02) {
          cell.intensity *= 0.92;
          dirty.add(idx);
          anyFade = true;
        }
      });

      // วน Loop ต่อเฉพาะเมื่อยังมีความจำเป็นต้อง fade และสภาวะเหมาะสม
      if (anyFade) scheduleDraw();
    });
  };

  /* ---------- note mapping ---------- */
  const getCellIndexByNote = (midiNote: number) => {
    const i = Math.floor(midiNote / notesPerCell);
    return Math.min(i, total - 1);
  };

  const onNoteChange = (note: INoteChange) => {
    // 2. ป้องกัน Logic ทำงานเมื่อสถานะไม่พร้อม
    if (!canRender()) return;

    const { midiNote, velocity } = note;
    const cellIndex = getCellIndexByNote(midiNote);
    const cell = cellsRef.current[cellIndex];
    if (!cell) return;

    if (velocity > 0) {
      cell.activeCount = 1;
      cell.intensity = velocity;
    } else {
      cell.activeCount = 0;
    }

    dirtyCellsRef.current.add(cellIndex);
    scheduleDraw();
  };

  /* ---------- Event: Visibility & Active Changes ---------- */
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && active) {
        // เมื่อกลับหน้าจอมา และ active ให้วาดสถานะปัจจุบันทิ้งไว้
        drawAllCells();
        scheduleDraw();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // ถ้าสถานะ active เปลี่ยนเป็น true ให้สั่งวาดใหม่
    if (active) {
      drawAllCells();
      scheduleDraw();
    }

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [active]);

  /* ---------- bind note events ---------- */
  useEffect(() => {
    const id = `grid-${Date.now()}`;
    noteModifier.forEach((manager, keyIndex) => {
      manager.note?.on(
        [keyIndex, "CHANGE"],
        (event) => onNoteChange(event.value),
        id
      );
    });

    return () => {
      noteModifier.forEach((manager, keyIndex) => {
        manager.note?.off([keyIndex, "CHANGE"], id);
      });
    };
  }, [noteModifier, notesPerCell, total, stop, active]); // เพิ่ม active ใน deps เพื่อให้ handler อัปเดต

  /* ---------- stop/active tracker ---------- */
  useEffect(() => {
    node.isActive?.on(
      ["ACTIVE", "CHANGE"],
      (event) => setActive(event.value),
      componentId
    );
    return () => node.isActive?.off(["ACTIVE", "CHANGE"], componentId);
  }, [node, componentId]);

  return (
    <div ref={containerRef} className="w-full h-full">
      <canvas ref={canvasRef} style={{ display: "block" }} />
    </div>
  );
};

export default React.memo(NotesChannelRender);
