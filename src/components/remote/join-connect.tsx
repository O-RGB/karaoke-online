import React, { useState } from "react";
import Button from "../common/button/button";
import RangeBar from "../common/range-bar";

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

      <RangeBar
        min={0}
        max={127}
        onRangeChange={(v) => send?.(String(v))}
      ></RangeBar>
    </div>
  );
};

export default JoinConnect;
