import React, { useState, useEffect, useRef, useCallback } from "react";

interface RangeBarCloneProps {
  onChange?: (value: number) => void;
  min?: number;
  max?: number;
  value?: number;
  disabled?: boolean;
  onMouseUp?: () => void;
  onTouchEnd?: () => void;
}

const RangeBarClone: React.FC<RangeBarCloneProps> = ({
  min = 0,
  max = 100,
  onChange,
  value,
  disabled,
  onMouseUp,
  onTouchEnd,
}) => {
  const [internalValue, setInternalValue] = useState(value ?? min);
  const sliderRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const valueToPercentage = useCallback(
    (val: number) => {
      return ((val - min) / (max - min)) * 100;
    },
    [min, max]
  );

  const percentageToValue = useCallback(
    (percentage: number) => {
      return min + (percentage / 100) * (max - min);
    },
    [min, max]
  );

  const updateValue = useCallback(
    (clientY: number) => {
      if (sliderRef.current) {
        const rect = sliderRef.current.getBoundingClientRect();
        const newPercentage = 100 - ((clientY - rect.top) / rect.height) * 100;
        const clampedPercentage = Math.max(0, Math.min(100, newPercentage));
        const newValue = percentageToValue(clampedPercentage);
        setInternalValue(newValue);
        onChange?.(newValue);
      }
    },
    [percentageToValue, onChange]
  );

  useEffect(() => {
    const handleMove = (clientY: number) => {
      if (isDragging.current) {
        updateValue(clientY);
      }
    };

    const handleMouseMove = (e: MouseEvent) => handleMove(e.clientY);
    const handleTouchMove = (e: TouchEvent) => handleMove(e.touches[0].clientY);

    const handleEnd = () => {
      isDragging.current = false;
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("touchmove", handleTouchMove);
    document.addEventListener("mouseup", handleEnd);
    document.addEventListener("touchend", handleEnd);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("mouseup", handleEnd);
      document.removeEventListener("touchend", handleEnd);
    };
  }, [updateValue]);

  useEffect(() => {
    if (value !== undefined && isDragging) {
      setInternalValue(value);
    }
  }, [value]);

  const handleStart = (clientY: number) => {
    isDragging.current = true;
    updateValue(clientY);
  };

  const displayPercentage = valueToPercentage(internalValue);

  return (
    <div
      style={{
        opacity: !disabled ? 1 : 0.5,
        pointerEvents: disabled ? "none" : undefined,
      }}
      className="h-full w-0.5 flex items-center justify-center bg-white/50 touch-none rounded-full"
    >
      <div
        ref={sliderRef}
        className="h-[85%] w-4 rounded-full relative"
        onMouseDown={(e) => {
          onMouseUp?.();
          handleStart(e.clientY);
        }}
        onTouchStart={(e) => {
          onTouchEnd?.();
          handleStart(e.touches[0].clientY);
        }}
      >
        <div
          className="absolute bottom-0 left-0 right-0 rounded-full"
          style={{ height: `${displayPercentage}%` }}
        />
        <div
          className={`${
            isDragging.current ? "" : "duration-1000"
          } absolute w-4 h-4 flex items-center justify-center bg-white border-[0.01rem] border-gray-400 rounded-full shadow-md -left-[0.43rem] -translate-y-1/2 cursor-pointer`}
          style={{ top: `${100 - displayPercentage}%` }}
        >
          <div className="p-4"></div>
        </div>
      </div>
    </div>
  );
};

export default RangeBarClone;
