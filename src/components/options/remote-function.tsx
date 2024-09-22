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
    const paused = player?.paused;
    console.log(paused);
    if (onRemoteOpen) {
      let end: number = player?.midiData.duration ?? 0;
      let currentTime: number = player?.currentTime ?? 0;

      end = Math.floor(end);
      currentTime = Math.floor(currentTime);

      console.log(end, currentTime);
      if (paused === true && end === currentTime) {
        hanndleOnChange();
      }
    }

    if (paused === false) {
      setOpen(false);
    }

    console.log("use effect");
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
