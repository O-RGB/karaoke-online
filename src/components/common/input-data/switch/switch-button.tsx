import React, { useState, useEffect } from "react";
import Button, { ButtonColor } from "../../button/button";

interface SwitchButtonProps {
  iconOpen?: React.ReactNode;
  iconClose?: React.ReactNode;
  labelOpen?: string;
  labelClose?: string;
  colorClose?: ButtonColor;
  onChange?: (open: boolean) => void;
  className?: string;
  disabled?: boolean; // ✅ เพิ่ม
}

const SwitchButton: React.FC<SwitchButtonProps> = ({
  iconClose,
  iconOpen,
  labelClose,
  labelOpen,
  colorClose,
  onChange,
  className,
  disabled = false, // ✅ default
}) => {
  const [open, setOpen] = useState<boolean>(true);

  const handleOnClick = () => {
    if (disabled) return;

    const v = !open;
    setOpen(v);
    onChange?.(v);
  };

  const disabledStyle = disabled ? "opacity-50 cursor-not-allowed" : "";

  return (
    <Button
      disabled={disabled}
      blur={{
        border: true,
        backgroundColor: !open ? colorClose : "primary",
      }}
      onClick={handleOnClick}
      className={`${className ?? ""} ${disabledStyle}`}
      icon={iconClose && <div>{open ? iconOpen : iconClose}</div>}
    >
      {labelClose && (
        <div className="text-sm -mt-0.5">{open ? labelOpen : labelClose}</div>
      )}
    </Button>
  );
};

export default SwitchButton;
