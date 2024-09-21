import React, { useState, useEffect } from "react";

interface RangeBarCloneProps {
  min?: number;
  max?: number;
  value?: number;
  className?: string;
  disabled?: boolean;
  height?: string | number;
  width?: number;
  defaultValue?: number;
  layout?: "vertical" | "horizontal";
  onChange?: (value: number) => void;
}

const RangeBarClone: React.FC<RangeBarCloneProps> = ({
  min = 0,
  max = 100,
  value = 100, // Start with 100
  height = "100%",
  width = 25,
  defaultValue,
  layout = "vertical",
  onChange,
}) => {
  const [range, setRange] = useState<number>(100); // Set initial state to 100
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Initialize range based on value prop
  useEffect(() => {
    const normalizedValue = ((value - min) / (max - min)) * 100;
    setRange(normalizedValue);
  }, [value, min, max]);

  useEffect(() => {
    if (defaultValue) {
      setRange(defaultValue);
    }
  }, [defaultValue]);

  const updateRange = (clientX: number, clientY: number, rect: DOMRect) => {
    let newRange = 0;

    if (layout === "vertical") {
      const relativeY = clientY - rect.top;
      newRange = (relativeY / rect.height) * 100;

      // Invert range for vertical layout (0 at the bottom, 100 at the top)
      newRange = 100 - newRange;
    } else {
      const relativeX = clientX - rect.left;
      newRange = (relativeX / rect.width) * 100;
    }

    // Clamp the value between 0 and 100
    newRange = Math.max(0, Math.min(newRange, 100));

    setRange(newRange);

    // Call onChange with the actual value
    const newValue = (newRange / 100) * (max - min) + min;
    if (onChange) onChange(Math.round(newValue));
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const rect = e.currentTarget.getBoundingClientRect();
    updateRange(e.clientX, e.clientY, rect);
  };

  const handleMouseDown = () => {
    setIsDragging(true);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleClick = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    updateRange(e.clientX, e.clientY, rect);
  };

  return (
    <div
      style={{ height: height, width: width }}
      className="relative flex justify-center items-center z-50 cursor-pointer"
      onMouseMove={isDragging ? handleMouseMove : undefined}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onClick={handleClick} // Add click event here
    >
      <div className="absolute w-1 h-full bg-black/50 rounded-full"></div>
      <div
        style={{
          top: layout === "vertical" ? `${100 - range}%` : undefined,
          left: layout === "horizontal" ? `${range}%` : undefined,
        }}
        className={`${
          isDragging ? "" : "duration-1000"
        } absolute z-50 rounded-full bg-white hover:bg-gray-200 shadow-sm`}
        onMouseDown={handleMouseDown}
      >
        <div className="absolute -top-2 -left-2 w-4 h-4 bg-white rounded-full"></div>
      </div>
    </div>
  );
};

export default RangeBarClone;
