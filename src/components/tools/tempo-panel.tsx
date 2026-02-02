import { useSynthesizerEngine } from "@/features/engine/synth-store";
import React, { useEffect, useId, useMemo, useState } from "react";
import useConfigStore from "../../features/config/config-store";

interface TempoPanelProps {}

const TempoPanel: React.FC<TempoPanelProps> = () => {
  const componentId = useId();
  const engine = useSynthesizerEngine((state) => state.engine);

  const [tempo, setTempo] = useState<number>(0);
  const [beat, setBeat] = useState<number>(0);
  const [numerator, setNumerator] = useState<number>(0);

  const onTempoUpdated = (tempo: number) => {
    setTempo(tempo);
  };

  const onBeatUpdated = (beat: number) => {
    setBeat(beat);
  };

  const onNumeratorUpdated = (numerator: number) => {
    setNumerator(numerator);
  };

  useEffect(() => {
    if (!engine) return;

    engine.tempoUpdated.on(["TEMPO", "CHANGE"], 0, onTempoUpdated, componentId);
    engine.beatUpdated.on(["BEAT", "CHANGE"], 0, onBeatUpdated, componentId);
    engine.numeratorUpdated.on(
      ["NUMERATOR", "CHANGE"],
      0,
      onNumeratorUpdated,
      componentId
    );

    return () => {
      engine.tempoUpdated.off(["TEMPO", "CHANGE"], 0, componentId);
      engine.beatUpdated.off(["BEAT", "CHANGE"], 0, componentId);
      engine.numeratorUpdated.off(["NUMERATOR", "CHANGE"], 0, componentId);
    };
  }, [engine, componentId]);

  const beatDots = useMemo(() => {
    if (numerator <= 0) return null;

    return Array.from({ length: numerator }, (_, index) => (
      <div
        key={index}
        className={`h-2 w-2 rounded-full ${
          index !== beat - 1 ? "bg-white/30" : "bg-white"
        }`}
      />
    ));
  }, [numerator, beat]);

  const isShow = useConfigStore((state) => state.config.widgets?.tempo?.show);
  if (isShow === false) return null;

  return (
    <div className="blur-overlay blur-border border rounded-md h-[35px] w-32 text-white">
      <div className="flex items-center justify-between h-full px-2">
        <div className="flex mb-1">
          {String(Math.round(tempo)).padStart(3, "0")}
        </div>

        <div className="flex gap-1">{beatDots}</div>

        <div className="flex mb-1">
          {beat}:{numerator}
        </div>
      </div>
    </div>
  );
};

export default TempoPanel;
