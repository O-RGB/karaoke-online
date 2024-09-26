import React, { useState } from "react";

import Button from "../button/button";

interface SwitchButtonProps {
  iconOpen?: React.ReactNode;
  iconClose?: React.ReactNode;
  labelOpen?: string;
  labelClose?: string;
  colorClose?: string;
  onChange?: (open: boolean) => void;
}

const SwitchButton: React.FC<SwitchButtonProps> = ({
  iconClose,
  iconOpen,
  labelClose,
  labelOpen,
  colorClose = "bg-red-500 hover:bg-red-500",
  onChange,
}) => {
  const [open, setOpen] = useState<boolean>(true);

  const handleOnClick = () => {
    let v = !open;
    setOpen(v);
    onChange?.(v);
  };
  return (
    <Button
      shadow=""
      border="border blur-border"
      blur={
        !open
          ? "blur-overlay bg-red-500/80 hover:bg-red-500/50"
          : "blur-overlay bg-white/10 hover:bg-white/20"
      }
      onClick={handleOnClick}
      className={[open ? " hover:bg-white/30" : colorClose].join(" ")}
      padding="p-1 px-2"
    >
      <div
        className={["flex gap-1 items-center justify-center text-white"].join(
          " "
        )}
      >
        <span>{open ? iconOpen : iconClose}</span>
        <span className="text-sm -mt-0.5">{open ? labelOpen : labelClose}</span>
      </div>
    </Button>
  );
};

export default SwitchButton;
