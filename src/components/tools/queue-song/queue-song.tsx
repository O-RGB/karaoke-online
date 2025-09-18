import React, { useEffect, useId, useState } from "react";
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
import { MdLockOutline } from "react-icons/md";
import useKeyboardStore from "@/features/keyboard-state";
import Button from "@/components/common/button/button";
import { RiDeleteBin5Line } from "react-icons/ri";
import useQueuePlayer from "@/features/player/player/modules/queue-player";
import { ITrackData } from "@/features/songs/types/songs.type";
import { BiMusic } from "react-icons/bi";
import { useSynthesizerEngine } from "@/features/engine/synth-store";

const createTracklistId = (item: ITrackData) =>
  `${item.TITLE}${item.ARTIST}${item._superIndex}${item._originalIndex}`;

const SortableTableRow = ({
  item,
  index,
  isFirst,
  isLast,
  lockFirst,
  countDown,
  onKeySelected,
  onDelete,
}: {
  item: ITrackData;
  index: number;
  isFirst: boolean;
  isLast: boolean;
  lockFirst: boolean;
  countDown: number;
  onKeySelected: boolean;
  onDelete: (index: number) => void;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: createTracklistId(item),
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
      <td valign="top" className="p-2">
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
      <td valign="top" className="p-2 ">
        {index + 1}
      </td>
      <td valign="top" className="p-2">
        <div className="flex items-start gap-3 -mt-0.5">
          <div className="flex-1">
            <h3 className="text-lg font-medium truncate flex gap-2 items-center">
              <BiMusic></BiMusic>
              {item.TITLE}
            </h3>
            <p className="text-sm truncate text-white/80">{item.ARTIST}</p>
          </div>
        </div>
      </td>

      <td className="text-sm">
        {item._selectBy?.nickname ? item._selectBy?.nickname : "ระบบ"}
      </td>

      <td
        valign="middle"
        className="p-2 flex items-center justify-center w-full h-full"
      >
        <Button
          shadow={false}
          border={false}
          onClick={() => onDelete?.(index)}
          padding=""
          className="w-7 h-7"
          blur=""
          color="red"
          iconPosition="left"
          icon={<RiDeleteBin5Line className="text-white"></RiDeleteBin5Line>}
        ></Button>
      </td>
    </tr>
  );
};

interface QueueSongProps {
  stopTouchMusicPlaying?: number;
}

const QueueSong: React.FC<QueueSongProps> = ({
  stopTouchMusicPlaying = 10,
}) => {
  const componnetId = useId();
  const engine = useSynthesizerEngine((state) => state.engine);
  const [countdown, setCountDown] = useState<number>(0);

  const queueing = useKeyboardStore((state) => state.queueing);
  const searching = useKeyboardStore((state) => state.searching);
  const arrowDown = useKeyboardStore((state) => state.arrowDown);
  const arrowUp = useKeyboardStore((state) => state.arrowUp);
  const onEnter = useKeyboardStore((state) => state.onEnter);
  const resetQueueingTimeout = useKeyboardStore(
    (state) => state.resetQueueingTimeout
  );

  const [lockFirstIndex, setLockFirstIndex] = useState<boolean>(false);
  const queue = useQueuePlayer((state) => state.queue);
  const moveQueue = useQueuePlayer((state) => state.moveQueue);
  const playMusic = useQueuePlayer((state) => state.playMusic);
  const nextMusic = useQueuePlayer((state) => state.nextMusic);

  const [selected, setSelected] = useState<number>(0);

  const sensors = useSensors(
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: any) => {
    if (window.navigator.vibrate) {
      window.navigator.vibrate(50);
      resetQueueingTimeout(100000);
    }
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = queue.findIndex(
        (item) => createTracklistId(item) === active.id
      );
      const newIndex = queue.findIndex(
        (item) => createTracklistId(item) === over.id
      );

      if (oldIndex === -1 || newIndex === -1) {
        return;
      }

      if (lockFirstIndex && newIndex === 0) {
        return;
      }

      if (lockFirstIndex && oldIndex === 0) {
        return;
      }

      const newItems = arrayMove(queue, oldIndex, newIndex);
      moveQueue(newItems);

      if (window.navigator.vibrate) {
        window.navigator.vibrate(30);
        resetQueueingTimeout(5000);
      }
    }
  };
  const onCountDownUpdated = (count: number) => {
    console.log(count);
    setCountDown(count);

    if (count < stopTouchMusicPlaying) {
      setLockFirstIndex(true);
    } else {
      setLockFirstIndex(false);
    }

    if (count === 0) {
      setTimeout(() => {
        nextMusic();
      }, 500);
    }
  };

  const onDelete = (index: number) => {
    let clone = [...queue];
    clone = clone.filter((_, i) => i !== index);
    moveQueue(clone);
  };

  useEffect(() => {
    setSelected((value) => {
      let coming = value + 1;
      if (coming >= queue.length - 1) {
        return queue.length - 1;
      } else {
        return coming;
      }
    });
  }, [arrowDown]);

  useEffect(() => {
    setSelected((value) => {
      let coming = value - 1;
      if (coming <= 0) {
        return 0;
      } else {
        return coming;
      }
    });
  }, [arrowUp]);

  useEffect(() => {
    if (queueing && searching === "") {
      let clone = [...queue];
      let songPlaying = clone[selected];

      if (songPlaying) {
        playMusic(selected);
        resetQueueingTimeout(0);
        let removed = clone.filter((_, i) => i !== selected);
        moveQueue(removed);
      }
    }
  }, [onEnter]);

  useEffect(() => {}, [queue]);

  useEffect(() => {
    if (engine) {
      engine?.countdownUpdated.add(
        ["COUNTDOWN", "CHANGE"],
        0,
        onCountDownUpdated,
        componnetId
      );
    }
    return () => {
      engine?.countdownUpdated.remove(["COUNTDOWN", "CHANGE"], 0, componnetId);
    };
  }, [engine]);

  if (!queueing) {
    return <></>;
  }

  if (searching !== "") {
    return <></>;
  }

  return (
    <div
      onClick={() => {
        resetQueueingTimeout(0);
      }}
      className={`absolute top-0 h-screen z-[99] bg-black/30  text-white w-full px-4 duration-300`}
    >
      <div className="pt-4 lg:pt-[14vw]">
        <div
          onClick={(e) => {
            e.stopPropagation();
            resetQueueingTimeout(5000);
          }}
          className="w-full blur-overlay flex gap-2 blur-border border rounded-md p-2 overflow-x-auto"
        >
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <table className="w-full min-w-[300px]">
              <thead>
                <tr>
                  <th className="text-start w-[10%] p-2"></th>
                  <th className="text-start w-[1%] p-2">ที่</th>
                  <th className="text-start w-full p-2">รายละเอียด</th>
                  <th className="text-start w-[10%] p-2">โดย</th>
                  <th className="text-start w-[10%] p-2">ประเภท</th>
                </tr>
              </thead>
              <tbody className="relative">
                <SortableContext
                  items={queue.map((item) => createTracklistId(item))}
                  strategy={verticalListSortingStrategy}
                >
                  {queue.map((item, index) => (
                    <SortableTableRow
                      key={`queue-${createTracklistId(item)}-${index}`}
                      item={item}
                      index={index}
                      isFirst={index == 0}
                      isLast={index === queue.length - 1}
                      lockFirst={countdown < stopTouchMusicPlaying}
                      countDown={countdown}
                      onKeySelected={selected === index}
                      onDelete={onDelete}
                    />
                  ))}
                </SortableContext>
              </tbody>
            </table>
          </DndContext>
        </div>
      </div>
    </div>
  );
};

export default QueueSong;
