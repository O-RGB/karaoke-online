export interface IChannelEvent {
  onMainlock?: (channel: number, isLocked: boolean) => void;
  onPersetChange?: (channel: number, value: number) => void;
  onPresetlock?: (channel: number, isLocked: boolean) => void;
  onPenChange: (channel: number, value: number) => void;
  onPenlock?: (channel: number, isLocked: boolean) => void;
  onReverbChange: (channel: number, value: number) => void;
  onReverblock?: (channel: number, isLocked: boolean) => void;
  onChorusDepthChange: (channel: number, value: number) => void;
  onChorusDepthlock?: (channel: number, isLocked: boolean) => void;
}
