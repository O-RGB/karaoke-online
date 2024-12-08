import useEventStore from "@/stores/player/event.store";
import { CHANNEL_DEFAULT } from "@/config/value";
import React, { useEffect, useRef, useState } from "react";
import { Synthetizer } from "spessasynth_lib";
import { useSpessasynthStore } from "@/stores/spessasynth-store";

interface InstrumentsEventProps {}

const InstrumentsEvent: React.FC<InstrumentsEventProps> = ({}) => {
  const storeSetInstrument = useEventStore((state) => state.setInstrument);
  const synth = useSpessasynthStore.getState().synth;
  const eventProgramChange = () => {
    synth?.eventHandler.addEvent("programchange", "", (e) => {
      const channel: number = e.channel;
      const program: number = e.program;

      console.log("programchange", channel, program);
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
