import React, { useEffect, useState } from "react";
import { FaCheck } from "react-icons/fa";

interface ToggleCheckBoxProps {
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  label?: string;
  labelPosition?: "left" | "right";
  disabled?: boolean;
}

const ToggleCheckBox: React.FC<ToggleCheckBoxProps> = ({
  defaultChecked = false,
  onChange,
  label,
  labelPosition = "right",
  disabled = false,
}) => {
  const [isChecked, setIsChecked] = useState(false);

  const handleToggle = () => {
    if (disabled) return;
    const newCheckedState = !isChecked;
    setIsChecked(newCheckedState);
    onChange && onChange(newCheckedState);
  };


  useEffect(() => {
    setIsChecked(defaultChecked)
  }, [defaultChecked])

  return (
    <div
      className={`flex items-center gap-2 cursor-pointer ${disabled ? "opacity-50" : ""}`}
      onClick={handleToggle}
    >
      {labelPosition === "left" && label && (
        <span className="text-sm">{label}</span>
      )}

      <div className="relative">
        <input
          type="checkbox"
          checked={isChecked}
          onChange={handleToggle}
          disabled={disabled}
          className="sr-only"
        />
        <div className={`w-5 h-5 flex items-center justify-center border rounded ${isChecked ? "bg-blue-500 border-blue-500" : "bg-white border-gray-300"
          }`}>
          {isChecked && <FaCheck size={12} className="text-white" />}
        </div>
      </div>

      {labelPosition === "right" && label && (
        <span className="text-sm">{label}</span>
      )}
    </div>
  );
};

export default ToggleCheckBox;