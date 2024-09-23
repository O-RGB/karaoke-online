import React from "react";
import Button from "../common/button/button";
import { MdOutlineSettingsInputSvideo } from "react-icons/md";
import RemoteFunction from "../options/remote-function";

interface OptionsPanelProps {
  className?: string;
  buttonClass?: string;
}

const OptionsPanel: React.FC<OptionsPanelProps> = ({
  className,
  buttonClass = "w-8 lg:w-10 h-8 lg:h-10",
}) => {
  return (
    <>
      <div className={`${className}`}>
        <RemoteFunction buttonClass={buttonClass}></RemoteFunction>
        <Button
          padding={""}
          className={buttonClass}
          icon={
            <MdOutlineSettingsInputSvideo className="text-white"></MdOutlineSettingsInputSvideo>
          }
        ></Button>
      </div>
    </>
  );
};

export default OptionsPanel;
