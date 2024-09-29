import { DragDropContext } from "@/context/drag-drop-context";
import { useContext } from "react";

export const useDragDrop = () => useContext(DragDropContext);
