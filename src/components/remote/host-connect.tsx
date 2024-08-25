import React, { useState } from "react";
import Button from "../common/button/button";

interface HostRemoteProps {
  myKey?: string[];
  onSaveKey?: (key: string) => void;
  send?: (value: string) => void;
}

const HostRemote: React.FC<HostRemoteProps> = ({ onSaveKey, myKey, send }) => {
  const [value, setValue] = useState<string>("");
  return (
    <div>
      {myKey && (
        <div className="p-1 border border-white ">
          <textarea rows={5} value={myKey[0]} />
          <textarea rows={5} value={myKey[1]} />
        </div>
      )}
      <textarea
        onChange={(e) => {
          const value = e.target.value;
          setValue(value);
        }}
      />
      <Button onClick={() => onSaveKey?.(value)}>Save</Button>

      <br />
      <br />
      <br />

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

export default HostRemote;
