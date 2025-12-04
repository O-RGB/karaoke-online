import React, { useEffect, useState, useRef } from "react";
import Button, { ButtonBlur } from "../button/button";
import { FaPlus, FaMinus } from "react-icons/fa";

interface NumberButtonProps {
  onChange?: (value: number) => void;
  value?: number;
  icon?: React.ReactNode;
  className?: string;
  color?: string;
  suffix?: string;
  blur?: ButtonBlur | boolean;
  collapsible?: boolean; // <-- แบบหุบ/ขยาย
  holdable?: boolean; // <-- แบบกดแช่ (เพิ่ม/ลดต่อเนื่อง)
}

const NumberButton: React.FC<NumberButtonProps> = ({
  value = 0,
  onChange,
  icon,
  className,
  color = "text-white",
  suffix,
  blur = {
    border: false,
    backgroundColor: "primary",
  },
  collapsible = false,
  holdable = false, // default ไม่รองรับการกดแช่
}) => {
  const [int, setInt] = useState<number>(value);
  const [expanded, setExpanded] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const holdInterval = useRef<NodeJS.Timeout | null>(null);

  // AUTO COLLAPSE TIMER
  const startCollapseTimer = () => {
    if (!collapsible) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setExpanded(false);
    }, 5000);
  };

  // เพิ่ม/ลด 1 step
  const handleStep = (type: "+" | "-") => {
    const newValue = type === "+" ? int + 1 : int - 1;
    setInt(newValue);
    onChange?.(newValue);
    startCollapseTimer();
  };

  // เริ่มกดแช่
  const startHold = (type: "+" | "-") => {
    if (!holdable) return; // ❗ ไม่รองรับกดแช่

    // ทำงานทันที 1 ครั้ง
    handleStep(type);

    // เริ่ม loop ทุก 120ms
    holdInterval.current = setInterval(() => {
      handleStep(type);
    }, 120);
  };

  // หยุดกดแช่
  const stopHold = () => {
    if (holdInterval.current) {
      clearInterval(holdInterval.current);
      holdInterval.current = null;
    }
  };

  const handleExpand = () => {
    if (!collapsible) return;
    setExpanded(true);
    startCollapseTimer();
  };

  useEffect(() => {
    setInt(value);
  }, [value]);

  // ------------------------------------------------
  // UI Mode ปกติ (ไม่ collapsible)
  // ------------------------------------------------
  if (!collapsible) {
    return (
      <div
        className={`blur-overlay border blur-border rounded-md flex items-center justify-center ${className}`}
      >
        <div className={`flex justify-center items-center gap-2 ${color}`}>
          {icon}
          <div className="flex gap-2 items-center">
            {/* Minus */}
            <Button
              blur={blur}
              onMouseDown={() => startHold("-")}
              onMouseUp={stopHold}
              onMouseLeave={stopHold}
              onClick={() => !holdable && handleStep("-")}
              size="xs"
              className="!rounded-[4px] !p-2"
              icon={<FaMinus className="font-light" />}
            />

            <div className={`flex items-center justify-center gap-1 ${color}`}>
              <span className="-mt-0.5">
                {int} {suffix}
              </span>
            </div>

            {/* Plus */}
            <Button
              blur={blur}
              onMouseDown={() => startHold("+")}
              onMouseUp={stopHold}
              onMouseLeave={stopHold}
              onClick={() => !holdable && handleStep("+")}
              size="xs"
              className="!rounded-[4px] !p-2"
              icon={<FaPlus className="font-light" />}
            />
          </div>
        </div>
      </div>
    );
  }

  // ------------------------------------------------
  // UI Mode collapsible
  // ------------------------------------------------
  return (
    <div
      className={`blur-overlay border blur-border rounded-md flex items-center justify-center ${className}`}
    >
      <div className={`flex items-center ${expanded ? "gap-2" : ""} ${color}`}>
        {/* Icon-only (collapsed) */}
        {!expanded && (
          <Button
            onClick={handleExpand}
            blur={blur}
            size="xs"
            icon={icon}
            className="!rounded-[4px] !p-2"
          ></Button>
        )}

        {/* Expanded */}
        <div
          className={`
            flex items-center gap-2 
            transition-all duration-300 overflow-hidden
            ${expanded ? "max-w-36" : "max-w-0"}
          `}
        >
          <div className="p-2">{icon}</div>

          {/* Minus */}
          <Button
            blur={blur}
            onMouseDown={() => startHold("-")}
            onMouseUp={stopHold}
            onMouseLeave={stopHold}
            onClick={() => !holdable && handleStep("-")}
            size="xs"
            className="!rounded-[4px] !p-2"
            icon={<FaMinus className="font-light" />}
          />

          <span className="-mt-0.5 whitespace-nowrap">
            {int} {suffix}
          </span>

          {/* Plus */}
          <Button
            blur={blur}
            onMouseDown={() => startHold("+")}
            onMouseUp={stopHold}
            onMouseLeave={stopHold}
            onClick={() => !holdable && handleStep("+")}
            size="xs"
            className="!rounded-[4px] !p-2"
            icon={<FaPlus className="font-light" />}
          />
        </div>
      </div>
    </div>
  );
};

export default NumberButton;
