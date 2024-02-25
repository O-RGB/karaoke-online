// interface ISettingSound {
//     IChannel:IChannel[]
//   voice: number;
// }

interface IChannel {
  channel: number;
  level: number;
  velocity: number;
  instrumental: number;
  callBack: (level: number) => void;
}
