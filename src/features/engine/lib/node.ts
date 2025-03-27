import { CHANNEL_DEFAULT } from "@/config/value";
import {
  IControllerChange,
  ILockController,
  IMuteController,
  IProgramChange,
} from "@/features/engine/types/synth.type";
import {
  CHORUSDEPTH,
  ControllerItemList,
  EventChangeType,
  INodeCallBack,
  MAIN_VOLUME,
  NodeType,
  PAN,
  REVERB,
} from "../types/node.type";
import { AudioMeter } from "./gain";

export class MainNodeController {
  public dataController: ControllerItemList[] = [];
  private userIshold: boolean = false;

  constructor() {
    this.dataController = [
      {
        name: "VOLUME",
        controller: new DataController("VOLUME"),
      },
      {
        name: "PAN",
        controller: new DataController("PAN"),
      },
      {
        name: "REVERB",
        controller: new DataController("REVERB"),
      },
      {
        name: "CHORUSDEPTH",
        controller: new DataController("CHORUSDEPTH"),
      },
    ];
  }

  public addEventCallBack(
    type: NodeType,
    eventType: EventChangeType,
    channel: number,
    callback?: (event: INodeCallBack) => void
  ) {
    const controller = this.getControllerByType(type);
    controller?.setEventCallBack(channel, eventType, callback);
  }

  public getControllerByType(type: NodeType) {
    return this.dataController.find((x) => x.name === type)?.controller;
  }

  public onControllerChange(value: IControllerChange, isUser: boolean) {
    if (this.userIshold ? isUser === false : isUser === true) {
      return {};
    }
    let controller: DataController | undefined = undefined;
    switch (value.controllerNumber) {
      case MAIN_VOLUME:
        controller = this.getControllerByType("VOLUME");
        break;
      case PAN:
        controller = this.getControllerByType("PAN");
        break;
      case REVERB:
        controller = this.getControllerByType("REVERB");
        break;
      case CHORUSDEPTH:
        controller = this.getControllerByType("CHORUSDEPTH");
        break;
    }
    const node = controller?.getChannel(value.channel);
    const event = node?.setValue(value.controllerValue);

    return { isLock: node?.isLocked, event };
  }

  public onProgramChange(value: IProgramChange, isUser: boolean) {
    const main_vol = this.getControllerByType("VOLUME");
    const main_vol_ch = main_vol?.getChannel(value.channel);
    return main_vol_ch?.setProgram(value.program);
  }

  public onMuteChange(value: IMuteController, isUser: boolean) {
    const main_vol = this.getControllerByType("VOLUME");
    const main_vol_ch = main_vol?.getChannel(value.channel);
    return main_vol_ch?.setMute(value.isMute);
  }

  public onLockChange(value: ILockController, isUser: boolean) {
    let controller: DataController | undefined = undefined;
    switch (value.controllerNumber) {
      case MAIN_VOLUME:
        controller = this.getControllerByType("VOLUME");
        break;
      case PAN:
        controller = this.getControllerByType("PAN");
        break;
      case REVERB:
        controller = this.getControllerByType("REVERB");
        break;
      case CHORUSDEPTH:
        controller = this.getControllerByType("CHORUSDEPTH");
        break;
    }

    const node = controller?.getChannel(value.channel);
    const locked = node?.setLock(value.isLocked);
    return locked;
  }

  public setUserHolding(hole: boolean) {
    this.userIshold = hole;
  }

  public getDataController() {
    return this.dataController;
  }

  public searchProgram(program: number[]): NodeController | undefined {
    for (const x of this.dataController) {
      const found = x.controller.controller.find((y) =>
        program.includes(y.program)
      );
      if (found) return found;
    }
    return undefined;
  }

  public initAnalyser(channel: number, analyser: AnalyserNode) {
    const node = this.getDataController();
    const volume = node.find((v) => v.name === "VOLUME");

    if (volume) {
      volume.controller.setAnalyser(channel, analyser);
    }
  }
}

export class DataController {
  public type: NodeType | undefined = undefined;
  public controller: NodeController[] = [];

  constructor(type: NodeType) {
    this.type = type;
    let node: NodeController[] = [];
    for (let ch = 0; ch < CHANNEL_DEFAULT.length; ch++) {
      node.push(new NodeController(type, ch));
    }
    this.controller = node;
  }

  public setAnalyser(channel: number, analyserNode: AnalyserNode) {
    this.controller[channel].setAnalyser(analyserNode);
  }

  public setMuteAll(mute: boolean) {
    for (let ch = 0; ch < CHANNEL_DEFAULT.length; ch++) {
      const node = this.controller[ch];
      node.setMute(mute);
    }
  }

  public getChannel(channel: number) {
    return this.controller[channel];
  }

  public setEventCallBack(
    channel: number,
    eventType: EventChangeType,
    callback?: (event: INodeCallBack) => void
  ) {
    const node = this.controller[channel];
    node.setCallBack(eventType, callback);
  }
}

export class NodeController {
  public type: NodeType | undefined = undefined;
  public channel: number = 0;
  public value: number = 100;
  public isMute: boolean = false;
  public isLocked: boolean = false;
  public code: number = 0;
  public program: number = 0;
  public analyserNode?: AnalyserNode | undefined = undefined;
  public gainNode: AudioMeter | undefined = undefined;

  private changeCallback: ((event: INodeCallBack<number>) => void)[] = [];
  private programCallback: ((event: INodeCallBack<number>) => void)[] = [];
  private lockCallback: ((event: INodeCallBack<boolean>) => void)[] = [];
  private muteCallback: ((event: INodeCallBack<boolean>) => void)[] = [];

  constructor(type: NodeType, channel: number) {
    this.type = type;
    this.channel = channel;
    this.initCode(type);
  }

  public setAnalyser(analyserNode: AnalyserNode) {
    this.analyserNode = analyserNode;
  }

  public getGain() {
    if (!this.analyserNode) {
      return 0;
    }
    const dataArray = new Uint8Array(this.analyserNode.frequencyBinCount);
    this.analyserNode?.getByteFrequencyData(dataArray);
    const value = Math.round(
      dataArray.reduce((acc, val) => acc + val, 0) / dataArray.length
    );
    return value;
  }

  public setCallBack(
    eventType: EventChangeType,
    callback?: (event: INodeCallBack) => void
  ) {
    if (!callback) {
      return;
    }

    switch (eventType) {
      case "CHANGE":
        this.changeCallback.push(
          callback as (event: INodeCallBack<number>) => void
        );
        break;
      case "PROGARM":
        this.programCallback.push(
          callback as (event: INodeCallBack<number>) => void
        );
        break;
      case "LOCK":
        this.lockCallback.push(
          callback as (event: INodeCallBack<boolean>) => void
        );
        break;
      case "MUTE":
        this.muteCallback.push(
          callback as (event: INodeCallBack<boolean>) => void
        );
        break;
    }
  }

  public setMute(mute: boolean) {
    if (!this.type) {
      return;
    }

    this.isMute = mute;
    const eventContent: INodeCallBack<boolean> = {
      channel: this.channel,
      eventType: "MUTE",
      // type: this.type!,
      value: mute,
    };
    this.muteCallback.map((events) => events(eventContent));

    if (!this.muteCallback) {
      console.log(`muteCallback is null`);
    }

    return eventContent;
  }
  public setLock(locked: boolean) {
    if (!this.type) {
      return;
    }

    this.isLocked = locked;

    const eventContent: INodeCallBack<boolean> = {
      channel: this.channel,
      eventType: "LOCK",
      // type: this.type!,
      value: locked,
    };
    this.lockCallback.map((events) => events(eventContent));

    if (!this.lockCallback) {
      console.log(`lockCallback is null`);
    }

    return eventContent;
  }
  public setValue(value: number) {
    if (!this.type) {
      return;
    }

    this.value = value;

    const eventContent: INodeCallBack<number> = {
      channel: this.channel,
      eventType: "CHANGE",
      // type: this.type!,
      value: value,
    };

    this.changeCallback.map((events) => events(eventContent));

    if (!this.changeCallback) {
      console.log("this.callback Is Null");
    }

    return eventContent;
  }

  public setProgram(program: number) {
    if (!this.type) {
      return;
    }

    this.program = program;

    const eventContent: INodeCallBack<number> = {
      channel: this.channel,
      eventType: "PROGARM",
      // type: this.type!,
      value: program,
    };

    this.programCallback.map((events) => events(eventContent));

    if (!this.programCallback) {
      console.log(`programCallback is null`);
    }

    return eventContent;
  }

  private initCode(type: NodeType) {
    switch (type) {
      case "VOLUME":
        this.code = MAIN_VOLUME;
        break;
      case "PAN":
        this.code = PAN;
        break;
      case "REVERB":
        this.code = REVERB;
        break;
      case "CHORUSDEPTH":
        this.code = CHORUSDEPTH;
        break;

      default:
        break;
    }
  }
}
