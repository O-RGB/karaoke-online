// import { AudioMeter } from "@/features/engine/lib/gain";
// import {
//   CHORUSDEPTH,
//   EventChangeType,
//   EXPRESSION,
//   INodeCallBack,
//   MAIN_VOLUME,
//   PAN,
//   REVERB,
// } from "@/features/engine/types/node.type";
// import { InstNodeProps } from "../types/node.type";
// import { IControllerChange } from "@/features/engine/types/synth.type";

// export class InstNode implements InstNodeProps {
//   // Node Config
//   public channel: number = 0;
//   public expression: number = 127;
//   public program: number = 0;
//   public isDrum: boolean = false;
//   public isActive: boolean = false;

//   // Effect
//   public chorus: number = 0;
//   public reverb: number = 0;
//   public transpose: number = 0;
//   public pan: number = 64;

//   // Function
//   public value: number = 100;
//   public isMute: boolean = false;
//   public isLocked: boolean = false;

//   // Render
//   public analyserNode?: AnalyserNode | undefined = undefined;
//   public gain: AudioMeter | undefined = undefined;

//   // Event
//   private changeCallback: ((event: INodeCallBack<number>) => void)[] = [];
//   private programCallback: ((event: INodeCallBack<number>) => void)[] = [];
//   private lockCallback: ((event: INodeCallBack<boolean>) => void)[] = [];
//   private muteCallback: ((event: INodeCallBack<boolean>) => void)[] = [];
//   private expressionCallback: ((event: INodeCallBack<number>) => void)[] = [];
//   private panCallback: ((event: INodeCallBack<number>) => void)[] = [];
//   private chorusCallback: ((event: INodeCallBack<number>) => void)[] = [];
//   private reverbCallback: ((event: INodeCallBack<number>) => void)[] = [];
//   private transposeCallback: ((event: INodeCallBack<number>) => void)[] = [];
//   private activeCallback: ((event: INodeCallBack<boolean>) => void)[] = [];
//   private drumCallback: ((event: INodeCallBack<boolean>) => void)[] = [];

//   constructor(channel: number) {
//     this.channel = channel;
//   }

//   public controllerChange(event: IControllerChange) {
//     switch (event.controllerNumber) {
//       case MAIN_VOLUME:
//         this.setValue(event.controllerValue);
//         break;
//       case PAN:
//         this.setPan(event.controllerValue);
//         break;
//       case REVERB:
//         this.setReverb(event.controllerValue);
//         break;
//       case CHORUSDEPTH:
//         this.setChorus(event.controllerValue);
//         break;
//       case EXPRESSION:
//         this.setExpression(event.controllerValue);
//         break;

//       default:
//         break;
//     }
//   }

//   public setAnalyser(analyserNode: AnalyserNode) {
//     this.analyserNode = analyserNode;
//   }

//   public getGain() {
//     if (!this.analyserNode) {
//       return 0;
//     }
//     const dataArray = new Uint8Array(this.analyserNode.frequencyBinCount);
//     this.analyserNode?.getByteFrequencyData(dataArray);
//     const value = Math.round(
//       dataArray.reduce((acc, val) => acc + val, 0) / dataArray.length
//     );
//     return value;
//   }

//   public setMute(mute: boolean) {
//     this.isMute = mute;
//     const eventContent: INodeCallBack<boolean> = {
//       channel: this.channel,
//       eventType: "MUTE",
//       value: mute,
//     };
//     this.muteCallback.forEach((events) => events(eventContent));

//     if (this.muteCallback.length === 0) {
//       console.log(`muteCallback is empty`);
//     }

//     return eventContent;
//   }

//   public setLock(locked: boolean) {
//     this.isLocked = locked;

//     const eventContent: INodeCallBack<boolean> = {
//       channel: this.channel,
//       eventType: "LOCK",
//       value: locked,
//     };
//     this.lockCallback.forEach((events) => events(eventContent));

//     if (this.lockCallback.length === 0) {
//       console.log(`lockCallback is empty`);
//     }

//     return eventContent;
//   }

//   public setValue(value: number) {
//     this.value = value;

//     const eventContent: INodeCallBack<number> = {
//       channel: this.channel,
//       eventType: "CHANGE",
//       value: value,
//     };

//     this.changeCallback.forEach((events) => events(eventContent));

//     if (this.changeCallback.length === 0) {
//       console.log("changeCallback is empty");
//     }

//     return eventContent;
//   }

//   public setProgram(program: number) {
//     this.program = program;

//     const eventContent: INodeCallBack<number> = {
//       channel: this.channel,
//       eventType: "PROGARM",
//       value: program,
//     };

//     this.programCallback.forEach((events) => events(eventContent));

//     if (this.programCallback.length === 0) {
//       console.log(`programCallback is empty`);
//     }

//     return eventContent;
//   }

//   public setExpression(expression: number) {
//     // Ensure expression is within MIDI range (0-127)
//     this.expression = Math.max(0, Math.min(127, expression));

//     const eventContent: INodeCallBack<number> = {
//       channel: this.channel,
//       eventType: "EXPRESSION",
//       value: this.expression,
//     };

//     this.expressionCallback.forEach((events) => events(eventContent));

//     return eventContent;
//   }

//   public setPan(pan: number) {
//     // Ensure pan is within MIDI range (typically 0-127, with 64 as center)
//     this.pan = Math.max(0, Math.min(127, pan));

//     const eventContent: INodeCallBack<number> = {
//       channel: this.channel,
//       eventType: "PAN",
//       value: this.pan,
//     };

//     this.panCallback.forEach((events) => events(eventContent));

//     return eventContent;
//   }

//   public setChorus(amount: number) {
//     // Typically 0-100 or 0-127 depending on implementation
//     this.chorus = Math.max(0, Math.min(100, amount));

//     const eventContent: INodeCallBack<number> = {
//       channel: this.channel,
//       eventType: "CHORUS",
//       value: this.chorus,
//     };

//     this.chorusCallback.forEach((events) => events(eventContent));

//     return eventContent;
//   }

//   public setReverb(amount: number) {
//     // Typically 0-100 or 0-127 depending on implementation
//     this.reverb = Math.max(0, Math.min(100, amount));

//     const eventContent: INodeCallBack<number> = {
//       channel: this.channel,
//       eventType: "REVERB",
//       value: this.reverb,
//     };

//     this.reverbCallback.forEach((events) => events(eventContent));

//     return eventContent;
//   }

//   public setTranspose(semitones: number) {
//     // Ensure transpose is within the defined range [-12, 12]
//     this.transpose = Math.max(-12, Math.min(12, semitones));

//     const eventContent: INodeCallBack<number> = {
//       channel: this.channel,
//       eventType: "TRANSPOSE",
//       value: this.transpose,
//     };

//     this.transposeCallback.forEach((events) => events(eventContent));

//     return eventContent;
//   }

//   public setActive(active: boolean) {
//     this.isActive = active;

//     const eventContent: INodeCallBack<boolean> = {
//       channel: this.channel,
//       eventType: "ACTIVE",
//       value: active,
//     };

//     this.activeCallback.forEach((events) => events(eventContent));

//     return eventContent;
//   }

//   public setDrum(isDrum: boolean) {
//     this.isDrum = isDrum;
//     const eventContent: INodeCallBack<boolean> = {
//       channel: this.channel,
//       eventType: "DRUM",
//       value: isDrum,
//     };

//     this.drumCallback.forEach((events) => events(eventContent));

//     return eventContent;
//   }

//   public setCallBack(
//     eventType: EventChangeType,
//     callback?: (event: INodeCallBack) => void
//   ) {
//     if (!callback) {
//       return;
//     }

//     switch (eventType) {
//       case "CHANGE":
//         this.changeCallback.push(
//           callback as (event: INodeCallBack<number>) => void
//         );
//         break;
//       case "PROGARM":
//         this.programCallback.push(
//           callback as (event: INodeCallBack<number>) => void
//         );
//         break;
//       case "LOCK":
//         this.lockCallback.push(
//           callback as (event: INodeCallBack<boolean>) => void
//         );
//         break;
//       case "MUTE":
//         this.muteCallback.push(
//           callback as (event: INodeCallBack<boolean>) => void
//         );
//         break;
//       case "EXPRESSION":
//         this.expressionCallback.push(
//           callback as (event: INodeCallBack<number>) => void
//         );
//         break;
//       case "PAN":
//         this.panCallback.push(
//           callback as (event: INodeCallBack<number>) => void
//         );
//         break;
//       case "CHORUS":
//         this.chorusCallback.push(
//           callback as (event: INodeCallBack<number>) => void
//         );
//         break;
//       case "REVERB":
//         this.reverbCallback.push(
//           callback as (event: INodeCallBack<number>) => void
//         );
//         break;
//       case "TRANSPOSE":
//         this.transposeCallback.push(
//           callback as (event: INodeCallBack<number>) => void
//         );
//         break;
//       case "ACTIVE":
//         this.activeCallback.push(
//           callback as (event: INodeCallBack<boolean>) => void
//         );
//         break;
//       case "DRUM":
//         this.drumCallback.push(
//           callback as (event: INodeCallBack<boolean>) => void
//         );
//         break;
//     }
//   }

//   public removeCallback(
//     eventType: EventChangeType,
//     callback: Function
//   ): boolean {
//     let found = false;
//     let targetArray: any[] = [];

//     switch (eventType) {
//       case "CHANGE":
//         targetArray = this.changeCallback;
//         break;
//       case "PROGARM":
//         targetArray = this.programCallback;
//         break;
//       case "LOCK":
//         targetArray = this.lockCallback;
//         break;
//       case "MUTE":
//         targetArray = this.muteCallback;
//         break;
//       case "EXPRESSION":
//         targetArray = this.expressionCallback;
//         break;
//       case "PAN":
//         targetArray = this.panCallback;
//         break;
//       case "CHORUS":
//         targetArray = this.chorusCallback;
//         break;
//       case "REVERB":
//         targetArray = this.reverbCallback;
//         break;
//       case "TRANSPOSE":
//         targetArray = this.transposeCallback;
//         break;
//       case "ACTIVE":
//         targetArray = this.activeCallback;
//         break;
//       case "DRUM":
//         targetArray = this.drumCallback;
//         break;
//     }

//     const index = targetArray.findIndex((cb) => cb === callback);
//     if (index !== -1) {
//       targetArray.splice(index, 1);
//       found = true;
//     }

//     return found;
//   }

//   public reset() {
//     // Reset all parameters to default values
//     this.value = 100;
//     this.expression = 127;
//     this.pan = 64;
//     this.program = 0;
//     this.chorus = 0;
//     this.reverb = 0;
//     this.transpose = 0;
//     this.isMute = false;
//     this.isLocked = false;
//     this.isDrum = false;
//     this.isActive = false;

//     // Notify all callbacks of the reset
//     this.setValue(this.value);
//     this.setExpression(this.expression);
//     this.setPan(this.pan);
//     this.setProgram(this.program);
//     this.setChorus(this.chorus);
//     this.setReverb(this.reverb);
//     this.setTranspose(this.transpose);
//     this.setMute(this.isMute);
//     this.setLock(this.isLocked);
//     this.setDrum(this.isDrum);
//     this.setActive(this.isActive);
//   }
// }
