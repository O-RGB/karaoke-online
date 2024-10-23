import React, { useEffect, useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  TouchSensor,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { HiMiniBars2 } from "react-icons/hi2";
import { useKeyboardEvents } from "@/hooks/keyboard-hook";
import { useSpessasynthStore } from "@/stores/spessasynth-store";
import useTickStore from "@/stores/tick-store";
import { MdLockOutline } from "react-icons/md";
import { useAppControlStore } from "@/stores/player-store";

interface SongItem {
  id: string;
  number: number;
  details: string;
  type: string;
}

const SortableTableRow = ({
  item,
  index,
  isFirst,
  isLast,
  lockFirst,
  countDown,
  onKeySelected,
}: {
  item: SongItem;
  index: number;
  isFirst: boolean;
  isLast: boolean;
  lockFirst: boolean;
  countDown: number;
  onKeySelected: boolean;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: item.id,
    transition: {
      duration: 150,
      easing: "cubic-bezier(0.25, 1, 0.5, 1)",
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    backgroundColor: isDragging ? "rgba(255, 255, 255, 0.1)" : undefined,
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`${isLast ? "" : "border-b border-white/20"} ${
        onKeySelected
          ? "bg-blue-500/50"
          : lockFirst && isFirst
          ? "bg-black/30"
          : "border-gray-300"
      }  transition-colors ${isDragging ? "shadow-lg" : ""}`}
    >
      <td className="p-2">
        <div className="flex items-center gap-2">
          <div
            {...attributes}
            {...listeners}
            className="touch-none cursor-grab active:cursor-grabbing p-1"
          >
            <span className="w-6 h-4">
              {lockFirst && isFirst ? (
                <span className="flex gap-1 items-center text-sm">
                  <MdLockOutline className=""></MdLockOutline>
                  <span className="w-4">{countDown}</span>
                </span>
              ) : (
                <HiMiniBars2 className="" />
              )}
            </span>
          </div>
        </div>
      </td>
      <td className="p-2">{item.number}</td>
      <td className="p-2">{item.details}</td>
      <td className="p-2">{item.type}</td>
    </tr>
  );
};

interface QueueSongProps {
  stopTouchMusicPlaying?: number;
}

const QueueSong: React.FC<QueueSongProps> = ({
  stopTouchMusicPlaying = 10,
}) => {
  const {
    queueing,
    searching,
    resetQueueingTimeout,
    resetSearchingTimeout,
    arrowDown,
    arrowUp,
    onEnter,
  } = useKeyboardEvents();
  const player = useSpessasynthStore((state) => state.player);
  const [lockFirstIndex, setLockFirstIndex] = useState<boolean>(false);
  const playingQueue = useAppControlStore((state) => state.playingQueue);
  const setPlayingQueue = useAppControlStore((state) => state.setPlayingQueue);
  const setSongPlaying = useAppControlStore((state) => state.setSongPlaying);

  const [countdown, setCountDown] = useState<number>(stopTouchMusicPlaying);
  const tick = useTickStore((state) => state.tick);
  const [selected, setSelected] = useState<number>(0);

  const sensors = useSensors(
    // ปรับแต่ง TouchSensor ให้เหมาะกับมือถือ
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250, // หน่วงเวลานิดหน่อยเพื่อไม่ให้ทำงานเมื่อ scroll
        tolerance: 5, // ระยะที่ยอมให้นิ้วเคลื่อนที่ได้ก่อนเริ่ม drag
      },
    }),
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // ระยะที่ต้องลากก่อนเริ่มทำงาน
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: any) => {
    // เพิ่ม haptic feedback ถ้าเบราว์เซอร์รองรับ
    if (window.navigator.vibrate) {
      window.navigator.vibrate(50);
      resetQueueingTimeout(100000);
    }
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      //   playingQueue((items) => {
      const oldIndex = playingQueue.findIndex(
        (item) => item.songInfo.id === active.id
      );
      const newIndex = playingQueue.findIndex(
        (item) => item.songInfo.id === over.id
      );

      // ถ้า lockFirstIndex เปิดอยู่ และพยายามจะย้ายไปที่ตำแหน่งแรก
      if (lockFirstIndex && newIndex === 0) {
        return;
      }

      // ถ้า lockFirstIndex เปิดอยู่ และพยายามจะย้ายตำแหน่งแรก
      if (lockFirstIndex && oldIndex === 0) {
        return;
      }

      const newItems = arrayMove(playingQueue, oldIndex, newIndex);
      const updated = newItems.map((item, index) => ({
        ...item,
        number: index + 1,
      }));

      setPlayingQueue(updated);
      //   });

      // vibrate เมื่อวางเสร็จ
      if (window.navigator.vibrate) {
        window.navigator.vibrate(30);
        resetQueueingTimeout();
      }
    }
  };

  useEffect(() => {
    const lastTime = Math.floor(player?.duration ?? 0);
    const count = lastTime - Math.floor(player?.currentTime ?? 0);
    if (count < stopTouchMusicPlaying) {
      //lock
      setLockFirstIndex(true);
      setCountDown(count + 1);
    } else {
      setLockFirstIndex(false);
      setCountDown(stopTouchMusicPlaying);
    }
  }, [queueing ? tick : undefined]);
  useEffect(() => {
    resetSearchingTimeout(0);
    setSelected((value) => {
      let coming = value + 1;
      if (coming >= playingQueue.length - 1) {
        return playingQueue.length - 1;
      } else {
        return coming;
      }
    });
  }, [arrowDown]);

  useEffect(() => {
    resetSearchingTimeout(0);
    setSelected((value) => {
      let coming = value - 1;
      if (coming <= 1) {
        return 1;
      } else {
        return coming;
      }
    });
  }, [arrowUp]);

  useEffect(() => {
    if (queueing && searching === "") {
      let clone = [...playingQueue];
      if (clone.length > 0) {
        let songPlaying = clone[selected];
        if (songPlaying) {
          let removed = clone.filter((_, i) => i !== selected);
          setPlayingQueue(removed);
          setSongPlaying(songPlaying.file, songPlaying.songInfo);
          resetQueueingTimeout(0);
        }
      }
    }
  }, [onEnter]);

  if (!queueing) {
    return <></>;
  }

  if (searching !== "") {
    return <></>;
  }

  if (!player) return <></>;

  return (
    <div
      onClick={() => {
        resetQueueingTimeout();
      }}
      className={`z-[99] pt-[58px] h-screen bg-black/30 fixed text-white w-full px-5 duration-300`}
    >
      <div className="w-full blur-overlay flex gap-2 blur-border border rounded-md p-2 overflow-x-auto">
        <table className="w-full min-w-[300px]">
          <thead>
            <tr>
              <th className="text-start w-[10%] p-2"></th>
              <th className="text-start w-[1%] p-2">ที่</th>
              <th className="text-start w-full p-2">รายละเอียด</th>
              <th className="text-start w-[10%] p-2">ประเภท</th>
            </tr>
          </thead>
          <tbody className="relative">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={playingQueue.map((item) => item.songInfo.id)}
                strategy={verticalListSortingStrategy}
              >
                {playingQueue.map(
                  (item, index) =>
                    index > 0 && (
                      <SortableTableRow
                        key={`queue-${index}`}
                        item={{
                          details: item.songInfo.name,
                          id: item.songInfo.id,
                          number: index,
                          type: item.songInfo.type.toString(),
                        }}
                        index={index}
                        isFirst={index == 1}
                        isLast={index === playingQueue.length - 1}
                        lockFirst={countdown < stopTouchMusicPlaying}
                        countDown={countdown}
                        onKeySelected={selected === index}
                      />
                    )
                )}
              </SortableContext>
            </DndContext>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default QueueSong;
