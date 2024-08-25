import React, { useState } from "react";
import Button from "../common/button/button";

interface JoinConnectProps {
  onSaveKey?: (value?: string[]) => void;
  send?: (value: string) => void;
  answer?: string;
}

const JoinConnect: React.FC<JoinConnectProps> = ({
  onSaveKey,
  answer,
  send,
}) => {
  const [value, setValue] = useState<string>("");
  const [value2, setValue2] = useState<string>("");
  return (
    <div>
      <textarea
        placeholder="KEY"
        onChange={(e) => {
          const value = e.target.value;
          setValue(value);
        }}
      />
      <textarea
        placeholder="ICE"
        onChange={(e) => {
          const value = e.target.value;
          setValue2(value);
        }}
      />
      <Button onClick={() => onSaveKey?.([value, value2])}>
        input host key
      </Button>
      <br />
      {answer && <textarea name="" id="" value={answer}></textarea>}
      <br /> <br /> <br /> <br />
      <input
        type="text"
        onChange={(e) => {
          const value = e.target.value;
          send?.(value);
        }}
      />
    </div>
  );
};

export default JoinConnect;
