import React, { useState } from "react";

interface ToggleCheckBoxProps {
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  className?: string;
}

const ToggleCheckBox: React.FC<ToggleCheckBoxProps> = ({
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
    </div>
  );
};

export default ToggleCheckBox;
