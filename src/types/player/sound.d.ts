// interface ISettingSound {
//     IChannel:IChannel[]
//   voice: number;
// }

interface IChannel {
  channel: number;
  value: number;
  level?: number;
  control: number;
  fun: Function;
}