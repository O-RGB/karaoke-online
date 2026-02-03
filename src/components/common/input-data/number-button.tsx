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
  collapsible?: boolean;
  holdable?: boolean;
  disabled?: boolean; // ✅ เพิ่ม
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
  holdable = false,
  disabled = false, // ✅ default
}) => {
  const [int, setInt] = useState<number>(value);
  const [expanded, setExpanded] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const holdInterval = useRef<NodeJS.Timeout | null>(null);

  const startCollapseTimer = () => {
    if (!collapsible || disabled) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setExpanded(false);
    }, 5000);
  };

  const handleStep = (type: "+" | "-") => {
    if (disabled) return;

    const newValue = type === "+" ? int + 1 : int - 1;
    setInt(newValue);
    onChange?.(newValue);
    startCollapseTimer();
  };

  const startHold = (type: "+" | "-") => {
    if (!holdable || disabled) return;

    handleStep(type);

    holdInterval.current = setInterval(() => {
      handleStep(type);
    }, 120);
  };

  const stopHold = () => {
    if (holdInterval.current) {
      clearInterval(holdInterval.current);
      holdInterval.current = null;
    }
  };

  const handleExpand = () => {
    if (!collapsible || disabled) return;
    setExpanded(true);
    startCollapseTimer();
  };

  const pauseCollapse = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const resumeCollapse = () => {
    if (!collapsible || !expanded || disabled) return;
    startCollapseTimer();
  };

  useEffect(() => {
    setInt(value);
  }, [value]);

  useEffect(() => {
    if (disabled) {
      stopHold();
      pauseCollapse();
    }
  }, [disabled]);

  const disabledStyle = disabled
    ? "opacity-50 cursor-not-allowed pointer-events-none"
    : "";

  if (!collapsible) {
    return (
      <div
        className={`blur-overlay border blur-border rounded-md flex items-center justify-center ${className} ${disabledStyle}`}
      >
        <div className={`flex justify-center items-center ${color}`}>
          {icon}
          <div className="flex gap-2 items-center">
            <Button
              disabled={disabled}
              variant="ghost"
              color="white"
              onMouseDown={() => startHold("-")}
              onMouseUp={stopHold}
              onMouseLeave={stopHold}
              onClick={() => !holdable && handleStep("-")}
              size="xs"
              className="!rounded-none !p-2"
              icon={<FaMinus />}
            />

            <div className="flex items-center gap-1">
              {int} {suffix}
            </div>

            <Button
              disabled={disabled}
              variant="ghost"
              color="white"
              onMouseDown={() => startHold("+")}
              onMouseUp={stopHold}
              onMouseLeave={stopHold}
              onClick={() => !holdable && handleStep("+")}
              size="xs"
              className="!rounded-none !p-2"
              icon={<FaPlus />}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onMouseEnter={pauseCollapse}
      onMouseLeave={resumeCollapse}
      className={`blur-overlay border blur-border rounded-md flex items-center justify-center ${className} ${disabledStyle}`}
    >
      <div className={`flex items-center ${color}`}>
        {!expanded && (
          <Button
            disabled={disabled}
            onClick={handleExpand}
            variant="ghost"
            color="white"
            size="xs"
            icon={icon}
            className="!rounded-none !p-2"
          />
        )}

        <div
          className={`
            flex items-center transition-all duration-300 overflow-hidden
            ${expanded ? "max-w-36" : "max-w-0"}
          `}
        >
          <div className="p-2">{icon}</div>

          <Button
            disabled={disabled}
            variant="ghost"
            color="white"
            onMouseDown={() => startHold("-")}
            onMouseUp={stopHold}
            onMouseLeave={stopHold}
            onClick={() => !holdable && handleStep("-")}
            size="xs"
            className="!rounded-none !p-2"
            icon={<FaMinus />}
          />

          <div className="px-1 whitespace-nowrap">
            {int}
            {suffix}
          </div>

          <Button
            disabled={disabled}
            variant="ghost"
            color="white"
            onMouseDown={() => startHold("+")}
            onMouseUp={stopHold}
            onMouseLeave={stopHold}
            onClick={() => !holdable && handleStep("+")}
            size="xs"
            className="!rounded-none !p-2"
            icon={<FaPlus />}
          />
        </div>
      </div>
    </div>
  );
};

export default NumberButton;
