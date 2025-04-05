import Button from "@/components/common/button/button";
import { INSTRUMENT_DRUM } from "@/features/engine/modules/instrumentals/instrumental";
import React from "react";

interface DrumChangeProps {}

const DrumChange: React.FC<DrumChangeProps> = ({}) => {
  return (
    <>
      <div className="flex p-2">
        {INSTRUMENT_DRUM.map((data, i) => {
          return (
            <React.Fragment key={`card-inst-${data}`}>
              <Button className="text-xs">
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

export default DrumChange;
