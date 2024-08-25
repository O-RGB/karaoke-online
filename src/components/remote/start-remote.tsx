import React, { useEffect, useState } from "react";
import HostRemote from "./host-connect";
import JoinConnect from "./join-connect";
import Button from "../common/button/button";

interface StartRemoteProps {
  myKey?: string[];
  answer?: string;
  getMyKey?: (isHost: boolean) => void;
  onSaveKey?: (isHost: boolean, value?: string[]) => void;
  send?: (value: string) => void;
}

const StartRemote: React.FC<StartRemoteProps> = ({
  getMyKey,
  onSaveKey,
  myKey,
  answer,
  send,
}) => {
  const [account, setAccout] = useState<boolean | undefined>();

  const onSetAccount = (isHost: boolean) => {
    setAccout(isHost);
    getMyKey?.(isHost);
  };

  useEffect(() => {}, [myKey]);

  if (account === undefined) {
    return (
      <div className="flex gap-1">
        <Button
          onClick={() => {
            onSetAccount(true);
          }}
        >
          Host
        </Button>
        <Button
          onClick={() => {
            onSetAccount(false);
          }}
        >
          Join
        </Button>
      </div>
    );
  }

  return (
    <>
      {account ? (
        <HostRemote
          send={send}
          myKey={myKey}
          onSaveKey={(value) => onSaveKey?.(true, [value])}
        ></HostRemote>
      ) : (
        <JoinConnect
          send={send}
          onSaveKey={(value) => onSaveKey?.(false, value)}
          answer={answer}
        ></JoinConnect>
      )}
    </>
  );
};

export default StartRemote;
