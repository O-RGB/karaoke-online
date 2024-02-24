// interface ISettingSound {
//     IChannel:IChannel[]
//   voice: number;
// }

interface IChannel {
  channel: number;
  level: number;
  velocity: number;
  callBack: (level: number) => void;
}
