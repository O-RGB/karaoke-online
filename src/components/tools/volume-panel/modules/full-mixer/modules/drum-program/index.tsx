import Button from "@/components/common/button/button";
import { INSTRUMENT_DRUM } from "@/features/engine/modules/instrumentals/instrumental";
import { useSynthesizerEngine } from "@/features/engine/synth-store";
import React, { useEffect } from "react";

interface DrumChangeProps {
  program?: number;
}

const DrumProgramChange: React.FC<DrumChangeProps> = ({ program }) => {
  const engine = useSynthesizerEngine((state) => state.engine);

  useEffect(() => {}, [program]);

  return (
    <>
      <div className="flex p-2">
        {INSTRUMENT_DRUM.map((data, i) => {
          return (
            <React.Fragment key={`card-inst-${data}`}>
              <Button
                onClick={() => {
                  engine?.setProgram?.({
                    channel: 9,
                    program: 100 + i,
                  });
                }}
                className={`text-xs ${
                  program === 100 + i ? "!bg-blue-500 text-white" : ""
                }`}
              >
                <span className="text-nowrap">
                  {i + 1}. {data}
                </span>
              </Button>
            </React.Fragment>
          );
        })}
      </div>
    </>
  );
};

export default DrumProgramChange;
