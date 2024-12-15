import Synthesizer from "js-synthesizer/dist/lib/Synthesizer";

export async function setupJsSynthesizer() {
  const audioContext = new AudioContext();

  const { Synthesizer } = await import("js-synthesizer");
  const synth = new Synthesizer();
  synth.init(audioContext.sampleRate);

  const node = synth.createAudioNode(audioContext, 8192);
  node.connect(audioContext.destination);

  synth.setGain(0.1);

  return { audio: audioContext, synth };
}

export const jsSynthesizerCurrentTime = async (
  synthesizer: Synthesizer,
  timeDivision: number
) => {
  const _bpm = (await synthesizer?.retrievePlayerBpm()) || 0;
  const currentTick = (await synthesizer?.retrievePlayerCurrentTick()) || 0;

  if (_bpm === 0 || timeDivision === 0) {
    console.error("Invalid BPM, tick data, or timeDivision");
    return;
  }

  const secondsPerTick = 60.0 / (_bpm * timeDivision);
  const currentTime = currentTick * secondsPerTick;
  return { currentTime };
};
