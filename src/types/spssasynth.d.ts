interface ISoundFontList {
  id: string;
  bankOffset: number;
}

interface ISetChannelGain {
  channel: number;
  value: number;
}

interface IInstruments {
  name: string;
  icon: InstrumentsType | undefined;
}

interface IAudioGain {
  channel: number;
  gain: number;
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
