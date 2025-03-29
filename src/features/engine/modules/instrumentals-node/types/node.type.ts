// import { AudioMeter } from "@/features/engine/lib/gain";
// import {
//   EventChangeType,
//   INodeCallBack,
// } from "@/features/engine/types/node.type";

// export interface InstNodeProps {
//   // Node Config
//   channel?: number;
//   value?: number;
//   expression?: number;
//   pan?: number;
//   program?: number;

//   // Effect
//   chorus?: number;
//   reverb?: number;
//   transpose?: number; // [-12,12]

//   // Function
//   isMute?: boolean;
//   isLocked?: boolean;
//   isDrum?: boolean;
//   isActive?: boolean;

//   // Render
//   analyserNode?: AnalyserNode;
//   gain?: AudioMeter;

//   // Methods
//   //   setAnalyser(analyserNode: AnalyserNode): void;
//   getGain?(): number;

//   setCallBack?(
//     eventType: EventChangeType,
//     callback?: (event: INodeCallBack) => void
//   ): void;

//   removeCallback?(eventType: EventChangeType, callback: Function): boolean;

//   setMute(mute: boolean): INodeCallBack<boolean>;
//   setLock(locked: boolean): INodeCallBack<boolean>;
//   setValue(value: number): INodeCallBack<number>;
//   setProgram(program: number): INodeCallBack<number>;
//   setExpression(expression: number): INodeCallBack<number>;
//   setPan(pan: number): INodeCallBack<number>;
//   setChorus(amount: number): INodeCallBack<number>;
//   setReverb(amount: number): INodeCallBack<number>;
//   setTranspose(semitones: number): INodeCallBack<number>;
//   setActive(active: boolean): INodeCallBack<boolean>;
//   setDrum(isDrum: boolean): INodeCallBack<boolean>;

//   reset?(): void;
//   getNodeState?(): Partial<InstNodeProps>;
//   applyNodeState?(state: Partial<InstNodeProps>): void;
//   //   dispose(): void;
// }
