import { CHANNEL_DEFAULT } from "@/config/value";
import {
  IControllerChange,
  ILockController,
  IMuteController,
  IProgramChange,
} from "@/stores/engine/types/synth.type";
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
      return;
    }
    switch (value.controllerNumber) {
      case MAIN_VOLUME:
        const main_vol = this.getControllerByType("VOLUME");
        const main_vol_ch = main_vol?.getChannel(value.channel);
        main_vol_ch?.setValue(value.controllerValue);
        return main_vol_ch?.isLocked;
        break;
      case PAN:
        const main_pan = this.getControllerByType("PAN");
        const main_pan_ch = main_pan?.getChannel(value.channel);
        main_pan_ch?.setValue(value.controllerValue);
        return main_pan_ch?.isLocked;
        break;
      case REVERB:
        const main_reverb = this.getControllerByType("REVERB");
        const main_reverb_ch = main_reverb?.getChannel(value.channel);
        main_reverb_ch?.setValue(value.controllerValue);
        return main_reverb_ch?.isLocked;
        break;
      case CHORUSDEPTH:
        const main_chorus_depth = this.getControllerByType("CHORUSDEPTH");
        const main_chorus_depth_ch = main_chorus_depth?.getChannel(
          value.channel
        );
        main_chorus_depth_ch?.setValue(value.controllerValue);
        return main_chorus_depth_ch?.isLocked;
        break;

      default:
        break;
    }
  }

  public onProgramChange(value: IProgramChange, isUser: boolean) {
    const main_vol = this.getControllerByType("VOLUME");
    const main_vol_ch = main_vol?.getChannel(value.channel);
    main_vol_ch?.setProgram(value.program);
  }

  public onMuteChange(value: IMuteController, isUser: boolean) {
    const main_vol = this.getControllerByType("VOLUME");
    const main_vol_ch = main_vol?.getChannel(value.channel);
    main_vol_ch?.setMute(value.isMute);
  }

  public onLockChange(value: ILockController, isUser: boolean) {
    switch (value.controllerNumber) {
      case MAIN_VOLUME:
        const main_vol = this.getControllerByType("VOLUME");
        const main_vol_ch = main_vol?.getChannel(value.channel);
        main_vol_ch?.setLock(value.isLocked);
        break;
      case PAN:
        const main_pan = this.getControllerByType("PAN");
        const main_pan_ch = main_pan?.getChannel(value.channel);
        main_pan_ch?.setLock(value.isLocked);
        break;
      case REVERB:
        const main_reverb = this.getControllerByType("REVERB");
        const main_reverb_ch = main_reverb?.getChannel(value.channel);
        main_reverb_ch?.setLock(value.isLocked);
        break;
      case CHORUSDEPTH:
        const main_chorus_depth = this.getControllerByType("CHORUSDEPTH");
        const main_chorus_depth_ch = main_chorus_depth?.getChannel(
          value.channel
        );
        main_chorus_depth_ch?.setLock(value.isLocked);
        break;

      default:
        break;
    }
  }

  public setUserHolding(hole: boolean) {
    this.userIshold = hole;
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

  private changeCallback: ((event: INodeCallBack<number>) => void)[] = [];
  private programCallback: ((event: INodeCallBack<number>) => void)[] = [];
  private lockCallback: ((event: INodeCallBack<boolean>) => void)[] = [];
  private muteCallback: ((event: INodeCallBack<boolean>) => void)[] = [];

  constructor(type: NodeType, channel: number) {
    this.type = type;
    this.channel = channel;
    this.initCode(type);
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

    this.muteCallback.map((events) =>
      events({
        channel: this.channel,
        eventType: "MUTE",
        type: this.type!,
        value: mute,
      })
    );

    if (!this.muteCallback) {
      console.log(`muteCallback is null`);
    }
  }
  public setLock(locked: boolean) {
    if (!this.type) {
      return;
    }

    this.isLocked = locked;

    this.lockCallback.map((events) =>
      events({
        channel: this.channel,
        eventType: "LOCK",
        type: this.type!,
        value: locked,
      })
    );

    if (!this.lockCallback) {
      console.log(`lockCallback is null`);
    }
  }
  public setValue(value: number) {
    if (!this.type) {
      return;
    }

    this.value = value;

    this.changeCallback.map((events) =>
      events({
        channel: this.channel,
        eventType: "CHANGE",
        type: this.type!,
        value: value,
      })
    );

    if (!this.changeCallback) {
      console.log("this.callback Is Null");
    }
  }

  public setProgram(program: number) {
    if (!this.type) {
      return;
    }

    this.program = program;

    this.programCallback.map((events) =>
      events({
        channel: this.channel,
        eventType: "PROGARM",
        type: this.type!,
        value: program,
      })
    );

    if (!this.programCallback) {
      console.log(`programCallback is null`);
    }
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
