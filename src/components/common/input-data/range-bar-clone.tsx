import useConfigStore from "@/stores/config-store";
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
  orientation?: "vertical" | "horizontal";
}

const RangeBarClone: React.FC<RangeBarProps> = ({
  min = 0,
  max = 100,
  onChange,
  value,
  disabled,
  onMouseUp,
  onTouchEnd,
  orientation = "vertical",
  ...props
}) => {
  const config = useConfigStore((state) => state.config);
  const performance = config.refreshRate?.type ?? "MIDDLE";
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
    (clientX: number, clientY: number) => {
      if (sliderRef.current) {
        const rect = sliderRef.current.getBoundingClientRect();
        let newPercentage;
        if (orientation === "vertical") {
          newPercentage = 100 - ((clientY - rect.top) / rect.height) * 100;
        } else {
          newPercentage = ((clientX - rect.left) / rect.width) * 100;
        }
        const clampedPercentage = Math.max(0, Math.min(100, newPercentage));
        const newValue = percentageToValue(clampedPercentage);
        setInternalValue(newValue);
        onChange?.(newValue);
      }
    },
    [percentageToValue, onChange, orientation]
  );

  const handleMove = useCallback(
    (clientX: number, clientY: number) => {
      if (isDragging) updateValue(clientX, clientY);
    },
    [isDragging, updateValue]
  );

  const handleStart = useCallback(
    (clientX: number, clientY: number) => {
      setIsDragging(true);
      updateValue(clientX, clientY);
    },
    [updateValue]
  );

  const handleEnd = useCallback(() => {
    setIsDragging(false);
    onMouseUp?.();
    onTouchEnd?.();
  }, [onMouseUp, onTouchEnd]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => handleMove(e.clientX, e.clientY);
    const handleTouchMove = (e: TouchEvent) =>
      handleMove(e.touches[0].clientX, e.touches[0].clientY);

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

  const orientationStyles = {
    vertical: {
      container: "h-full w-0.5",
      slider: "h-[85%] -mt-[1px]",
      thumb: "-left-[8px]",
      thumbPosition: { top: `${100 - displayPercentage}%` },
    },
    horizontal: {
      container: "w-full h-0.5",
      slider: "w-[90%] -ml-[1px]",
      thumb: "-top-[8px]",
      thumbPosition: { left: `${displayPercentage}%` },
    },
  }[orientation];

  return (
    <div
      style={{
        opacity: !disabled ? 1 : 0.5,
        pointerEvents: disabled ? "none" : undefined,
      }}
      className={`relative bg-white/50 touch-none rounded-full border ${orientationStyles.container} ${props.className}`}
    >
      <div
        ref={sliderRef}
        className={`rounded-full relative ${orientationStyles.slider}`}
        onMouseDown={(e) => {
          handleStart(e.clientX, e.clientY);
        }}
        onTouchStart={(e) => {
          handleStart(e.touches[0].clientX, e.touches[0].clientY);
        }}
      >
        <div
          className={`
            absolute w-4 h-4 
            flex items-center justify-center 
            bg-white border-[0.01rem] border-gray-400 
            rounded-full shadow-md cursor-pointer disabled:cursor-auto
            ${orientationStyles.thumb} ${
            !isDragging
              ? performance === "LOW"
                ? ""
                : "duration-1000"
              : "duration-0"
          }
            `}
          style={orientationStyles.thumbPosition}
        ></div>
      </div>
    </div>
  );
};

export default RangeBarClone;
