import React, { useEffect, useState } from "react";
import { RiRemoteControlFill } from "react-icons/ri";
import Button from "../common/button/button";
import Modal from "../common/modal";
import HostRemote from "../remote/host";
import { useSynth } from "@/hooks/spessasynth-hook";

interface RemoteFunctionProps {}

const RemoteFunction: React.FC<RemoteFunctionProps> = ({}) => {
  const [onRemoteOpen, setRemoteOpen] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);
  const { player } = useSynth();

  const setRemote = () => {
    setRemoteOpen((v) => !v);
  };

  const hanndleOnChange = () => {
    setOpen((value) => !value);
  };

  useEffect(() => {
    if (onRemoteOpen) {
      if (player?.paused) {
        hanndleOnChange();
      }
    }
  }, [player?.paused]);

  return (
    <>
      <Modal title={"ขอเพลงผ่านมือถือ"} isOpen={open} onClose={hanndleOnChange}>
        <HostRemote></HostRemote>
      </Modal>
      <Button
        color={onRemoteOpen ? "blue" : "default"}
        blur={!onRemoteOpen}
        onClick={setRemote}
        icon={
          <RiRemoteControlFill className="text-white"></RiRemoteControlFill>
        }
      ></Button>
    </>
  );
};

export default RemoteFunction;
