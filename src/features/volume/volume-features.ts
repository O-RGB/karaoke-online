import {
  midiControllers,
  modulatorSources,
  NON_CC_INDEX_OFFSET,
  Synthetizer,
} from "spessasynth_lib";

const volumeSynth = (synth: Synthetizer): FeatureSynth | null => {
  const updateChorusDepth = (channel: number, value: number) => {
    synth?.controllerChange(channel, 93, value);
  };

  const updateReverb = (channel: number, value: number) => {
    synth?.controllerChange(channel, 91, value);
  };

  const updatePreset = (channel: number, value: number) => {
    synth?.programChange(channel, value);
  };

  const updatePanVolume = (channel: number, value: number) => {
    synth.controllerChange(channel, midiControllers.pan, value);
  };

  const updateLockedVolume = (channel: number, isLocked: boolean) => {
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

  const updatePitch = (channel: number | null, semitones: number = 0) => {
    const PITCH_CENTER = 8192;
    const PITCH_RANGE = 16384;
    const SEMITONE_STEP = PITCH_RANGE / 24;

    const pitchValue = Math.max(
      0,
      Math.min(
        PITCH_RANGE - 1,
        Math.round(PITCH_CENTER + semitones * SEMITONE_STEP)
      )
    );
    const MSB = (pitchValue >> 7) & 0x7f;
    const LSB = pitchValue & 0x7f;

    const sendPitch = (channel: number) => {
      uploadLockedPitchWheel(channel, false);
      synth.setPitchBendRange(channel, Math.abs(semitones));
      synth.pitchWheel(channel, MSB, LSB);
      if (semitones !== 0) {
        uploadLockedPitchWheel(channel, true);
      }
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
    updatePreset,
    updatePitch,
    updateMuteVolume,
    updateLockedVolume,
    updatePanVolume,
    updateReverb,
    updateChorusDepth,
  };
};

export default volumeSynth;
