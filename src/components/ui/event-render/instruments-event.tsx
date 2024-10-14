import useEventStore from "@/stores/event.store";
import { CHANNEL_DEFAULT } from "@/config/value";
import React, { useEffect, useRef, useState } from "react";
import { Synthetizer } from "spessasynth_lib";

interface InstrumentsEventProps {
  synth: Synthetizer;
}

const InstrumentsEvent: React.FC<InstrumentsEventProps> = ({ synth }) => {
  const storeSetInstrument = useEventStore((state) => state.setInstrument);

  const eventProgramChange = () => {
    synth?.eventHandler.addEvent("programchange", "", (e) => {
      const channel: number = e.channel;
      const program: number = e.program;

      storeSetInstrument((prevInstrument) => {
        const newInstrument = [...prevInstrument];
        newInstrument[channel] = program;
        return newInstrument;
      });
    });
  };

  useEffect(() => {
    eventProgramChange();
  }, [synth]);

  return null;
};

export default InstrumentsEvent;
