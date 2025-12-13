import Button from "@/components/common/button/button";
import { INSTRUMENT_DRUM } from "@/features/engine/modules/instrumentals/instrumental";
import { useSynthesizerEngine } from "@/features/engine/synth-store";
import React, { useEffect } from "react";

interface DrumChangeProps {
  program: number;
}

const DrumProgramChange: React.FC<DrumChangeProps> = ({ program = 100 }) => {
  const engine = useSynthesizerEngine((state) => state.engine);

  useEffect(() => {}, [program]);

  return (
    <>
      <div className="flex divide-x">
        {INSTRUMENT_DRUM.map((data, i) => {
          return (
            <React.Fragment key={`card-inst-${data}`}>
              <Button
                size="xs"
                variant="solid"
                color={program === 100 + i ? "primary" : "white"}
                onClick={() => {
                  engine?.setProgram?.({
                    channel: 9,
                    program: 100 + i,
                  });
                }}
                className={`text-xs !rounded-none border-b border-l`}
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
