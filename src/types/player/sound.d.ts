// interface ISettingSound {
//     IChannel:IChannel[]
//   voice: number;
// }

interface IChannel {
  channel: number;
  level: number;
  callBack: (level: number) => void;
}
