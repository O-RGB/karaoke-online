import {
  midiControllers,
  modulatorSources,
  NON_CC_INDEX_OFFSET,
  Synthetizer,
} from "spessasynth_lib";

const volumeSynth = (synth: Synthetizer): FeatureSynth | null => {
  const uploadPanVolume = (channel: number, value: number) => {
    synth.controllerChange(channel, midiControllers.pan, value);
  };

  const uploadLockedVolume = (channel: number, isLocked: boolean) => {
    synth.lockController(channel, midiControllers.mainVolume, isLocked);
  };
  const uploadLockedPitchWheel = (channel: number, isLocked: boolean) => {
    synth.lockController(
      channel,
      NON_CC_INDEX_OFFSET + modulatorSources.pitchWheel,
      isLocked
    );
  };

  const updateMuteVolume = (channel: number, isMuted: boolean) => {
    synth.muteChannel(channel, isMuted);
  };

  const updatePerset = (channel: number, value: number) => {
    synth.programChange(channel, value);
  };

  const updatePitch = (channel: number | null, semitones: number = 0) => {
    const PITCH_CENTER = 8192;
    const PITCH_RANGE = 16384;
    const SEMITONE_STEP = PITCH_RANGE / 24;

    const pitchValue = Math.round(PITCH_CENTER + semitones * SEMITONE_STEP);
    const MSB = (pitchValue >> 7) & 0x7f;
    const LSB = pitchValue & 0x7f;

    const sendPitch = (channel: number) => {
      uploadLockedPitchWheel(channel, false);
      synth.pitchWheel(channel, MSB, LSB);
    };

    if (channel !== null) {
      sendPitch(channel);
    } else {
      for (let i = 0; i < 16; i++) {
        sendPitch(i);
      }
    }
  };

  const updateMainVolume = (channel: number, vol: number) => {
    synth.controllerChange(channel, midiControllers.mainVolume, vol);
  };

  return {
    updateMainVolume,
    updatePerset,
    updatePitch,
    updateMuteVolume,
    uploadLockedVolume,
    uploadPanVolume,
  };
};

export default volumeSynth;
