import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";

interface RangeBarProps {
  min?: number;
  max?: number;
  onChange?: (value: number) => void;
  value?: number;
  disabled?: boolean;
  onMouseUp?: () => void;
  onTouchEnd?: () => void;
  className?: string;
}

const RangeBarClone: React.FC<RangeBarProps> = ({
  min = 0,
  max = 100,
  onChange,
  value,
  disabled,
  onMouseUp,
  onTouchEnd,
  ...props
}) => {
  const [internalValue, setInternalValue] = useState(value ?? min);
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);

  const valueToPercentage = useCallback(
    (val: number) => ((val - min) / (max - min)) * 100,
    [min, max]
  );

  const percentageToValue = useCallback(
    (percentage: number) => min + (percentage / 100) * (max - min),
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

        // if (isDragging === false) {
          onChange?.(newValue);
        // }
      }
    },
    [percentageToValue, onChange, isDragging]
  );

  const handleMove = useCallback(
    (clientY: number) => {
      if (isDragging) updateValue(clientY);
    },
    [isDragging, updateValue]
  );

  const handleStart = useCallback(
    (clientY: number) => {
      setIsDragging(true);
      onMouseUp?.();
      updateValue(clientY);
    },
    [updateValue]
  );

  const handleEnd = useCallback(() => {
    setIsDragging(false);

    onTouchEnd?.();
  }, [onMouseUp, onTouchEnd]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => handleMove(e.clientY);
    const handleTouchMove = (e: TouchEvent) => handleMove(e.touches[0].clientY);

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("touchmove", handleTouchMove);
      document.addEventListener("mouseup", handleEnd);
      document.addEventListener("touchend", handleEnd);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("mouseup", handleEnd);
      document.removeEventListener("touchend", handleEnd);
    };
  }, [isDragging, handleMove, handleEnd]);

  useEffect(() => {
    if (value !== undefined) {
      setInternalValue(value);
    }
  }, [value]);

  const displayPercentage = useMemo(
    () => valueToPercentage(internalValue),
    [internalValue, valueToPercentage]
  );

  return (
    <div
      style={{
        opacity: !disabled ? 1 : 0.5,
        pointerEvents: disabled ? "none" : undefined,
      }}
      className={`relative h-full w-0.5 bg-white/50 touch-none rounded-full border ${props.className}`}
    >
      <div
        ref={sliderRef}
        className="h-[90%] rounded-full relative -mt-0.5"
        onMouseDown={(e) => {
          handleStart(e.clientY);
        }}
        onTouchStart={(e) => {
          handleStart(e.touches[0].clientY);
        }}
      >
        <div
          className={`
            absolute w-4 h-4 
            flex items-center justify-center 
            bg-white border-[0.01rem] border-gray-400 
            rounded-full shadow-md cursor-pointer
            -left-[8px] ${!isDragging ? "duration-1000" : "duration-0"}
            `}
          style={{ top: `${100 - displayPercentage}%` }}
        ></div>
      </div>
    </div>
  );
};

export default RangeBarClone;
