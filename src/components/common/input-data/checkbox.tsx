import React, { useState } from "react";

interface ToggleCheckBoxProps {
  labelOn?: string; // Label to show when the checkbox is checked
  labelOff?: string; // Label to show when the checkbox is unchecked
  defaultChecked?: boolean; // Initial checked state
  onChange?: (checked: boolean) => void; // Callback when the toggle state changes
  className?: string;
}

const ToggleCheckBox: React.FC<ToggleCheckBoxProps> = ({
  labelOn = "On", // Default label when checked
  labelOff = "Off", // Default label when unchecked
  defaultChecked = false,
  className,
  onChange,
}) => {
  const [isChecked, setIsChecked] = useState(defaultChecked);

  const handleToggle = () => {
    const newCheckedState = !isChecked;
    setIsChecked(newCheckedState);
    onChange && onChange(newCheckedState);
  };

  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      <input
        className={className}
        type="checkbox"
        checked={isChecked}
        onChange={handleToggle}
        style={{ marginRight: "8px" }}
      />
      {/* <label>{isChecked ? labelOn : labelOff}</label> */}
    </div>
  );
};

export default ToggleCheckBox;
