interface ISoundFontList {
  id: string;
  bankOffset: number;
}

interface ISetChannelGain {
  channel: number;
  value: number;
}
interface ISetMuteChannel {
  channel: number;
  mute: boolean;
}

interface IInstruments {
  name: string;
  icon: InstrumentsType | undefined;
}

interface IAudioGain {
  channel: number;
  gain: number;
}

// Define types
interface ITempoChange {
  ticks: number;
  tempo: number;
}

interface ITempoTimeChange {
  time: number;
  tempo: number;
}

type InstrumentsType =
  | "MdPiano"
  | "FaGuitar"
  | "FaBell"
  | "FaMusic"
  | "FaChurch"
  | "FaKeyboard"
  | "FaDrum"
  | "FaUsers"
  | "FaMicrophone"
  | "FaCloudRain"
  | "FaGem"
  | "FaCloud"
  | "FaSun"
  | "FaGhost"
  | "FaRobot"
  | "FaDrumSteelpan"
  | "FaWind"
  | "FaWater"
  | "FaDove"
  | "FaPhone"
  | "FaHelicopter"
  | "FaHandsClapping"
  | "FaBomb";

interface IPersetSoundfont {
  bank: number;
  presetName: string;
  program: number;
}
