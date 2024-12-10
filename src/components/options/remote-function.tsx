import React, { useEffect, useState } from "react";
import { RiRemoteControlFill } from "react-icons/ri";
import Button from "../common/button/button";
import Modal from "../common/modal";
import HostRemote from "../remote/host";
import { useSpessasynthStore } from "@/stores/spessasynth/spessasynth-store";

interface RemoteFunctionProps {
  buttonClass?: string;
}

const RemoteFunction: React.FC<RemoteFunctionProps> = ({ buttonClass }) => {
  const [onRemoteOpen, setRemoteOpen] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);
  const { player } = useSpessasynthStore();

  const setRemote = () => {
    setRemoteOpen((v) => !v);
  };

  const hanndleOnChange = () => {
    setOpen((value) => !value);
  };

  useEffect(() => {
    const paused = player?.paused;
    if (onRemoteOpen) {
      let end: number = player?.midiData.duration ?? 0;
      let currentTime: number = player?.currentTime ?? 0;

      end = Math.floor(end);
      currentTime = Math.floor(currentTime);

      if (paused === true && end === currentTime) {
        hanndleOnChange();
      }
    }
    if (paused === false) {
      setOpen(false);
    }
  }, [player?.paused]);

  return (
    <>
      <Modal
        footer={<></>}
        title={"ขอเพลงผ่านมือถือ"}
        isOpen={open}
        onClose={hanndleOnChange}
      >
        <HostRemote></HostRemote>
      </Modal>
      <Button
        padding={""}
        className={buttonClass}
        color={onRemoteOpen ? "amber" : "default"}
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
