import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";

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
  const sliderRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  // Calculate the percentage based on the value.
  const valueToPercentage = useCallback(
    (val: number) => ((val - min) / (max - min)) * 100,
    [min, max]
  );

  // Calculate the value based on the percentage.
  const percentageToValue = useCallback(
    (percentage: number) => min + (percentage / 100) * (max - min),
    [min, max]
  );

  // Update the slider value based on the Y coordinate.
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

  // Handle mouse/touch movement events.
  const handleMove = useCallback(
    (clientY: number) => {
      if (isDragging.current) updateValue(clientY);
    },
    [updateValue]
  );

  const handleStart = useCallback(
    (clientY: number) => {
      isDragging.current = true;
      updateValue(clientY);
    },
    [updateValue]
  );

  const handleEnd = useCallback(() => {
    isDragging.current = false;
  }, []);

  // Set up event listeners for mouse and touch events.
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => handleMove(e.clientY);
    const handleTouchMove = (e: TouchEvent) => handleMove(e.touches[0].clientY);

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
  }, [handleMove, handleEnd]);

  useEffect(() => {
    if (value) {
      setInternalValue(value);
    }
  }, [value]);

  // Display percentage for the UI.
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
          onMouseUp?.();
          handleStart(e.clientY);
        }}
        onTouchStart={(e) => {
          onTouchEnd?.();
          handleStart(e.touches[0].clientY);
        }}
      >
        <div
          className={`
            absolute w-4 h-4 
            flex items-center justify-center 
            bg-white border-[0.01rem] border-gray-400 
            rounded-full shadow-md cursor-pointer
            -left-[8px] ${!isDragging.current ? "duration-500" : "duration-0"}
            `}
          style={{ top: `${100 - displayPercentage}%` }}
        ></div>
      </div>
    </div>
  );
};

export default RangeBarClone;
