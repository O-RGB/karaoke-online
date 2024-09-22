import React, { useState } from "react";
import Button from "../common/button/button";
import { CgRemote } from "react-icons/cg";
import { RiRemoteControlFill } from "react-icons/ri";
import { MdOutlineSettingsInputSvideo } from "react-icons/md";
import RemoteFunction from "../options/remote-function";

interface OptionsPanelProps {}

const OptionsPanel: React.FC<OptionsPanelProps> = ({}) => {
  const [onRemoteSet, setRemoteSet] = useState<boolean>(false);
  return (
    <>
      <div className="fixed top-[40%] right-5 z-50">
        <div className="flex flex-col gap-1">
          <RemoteFunction></RemoteFunction>

          <Button
            icon={
              <MdOutlineSettingsInputSvideo className="text-white"></MdOutlineSettingsInputSvideo>
            }
          ></Button>
        </div>
      </div>
    </>
  );
};

export default OptionsPanel;
