import React, { useState } from "react";
import Button, { ButtonColor } from "../../button/button";

interface SwitchButtonProps {
  iconOpen?: React.ReactNode;
  iconClose?: React.ReactNode;
  labelOpen?: string;
  labelClose?: string;
  colorClose?: ButtonColor;
  onChange?: (open: boolean) => void;
  className?: string;
}

const SwitchButton: React.FC<SwitchButtonProps> = ({
  iconClose,
  iconOpen,
  labelClose,
  labelOpen,
  colorClose,
  onChange,
  className,
}) => {
  const [open, setOpen] = useState<boolean>(true);

  const handleOnClick = () => {
    let v = !open;
    setOpen(v);
    onChange?.(v);
  };
  return (
    <Button
      blur={{
        border: true,
        backgroundColor: !open ? colorClose : "primary",
      }}
      onClick={handleOnClick}
      className={className}
      icon={iconClose && <span>{open ? iconOpen : iconClose}</span>}
    >
      {labelClose && (
        <span className="text-sm -mt-0.5">{open ? labelOpen : labelClose}</span>
      )}
    </Button>
  );
};

export default SwitchButton;
