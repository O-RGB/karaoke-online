import { create } from "zustand";
import {
  RemoteReceivedMessages,
  SendType,
  TypeUserControl,
} from "../../../remote/types/remote.type";
import { useSynthesizerEngine } from "@/stores/engine/synth-store";
import useMixerStoreNew from "./event-mixer-store";

interface RemoteEventProps {
  send: (type: SendType, user: TypeUserControl, clientId?: string) => void;
  receivedType: (data: RemoteReceivedMessages) => void;
}

const useRemoteEventStore = create<RemoteEventProps>((set, get) => ({
  send: (type: SendType, user: TypeUserControl, clientId?: string) => {

      

  },
  receivedType: (data: RemoteReceivedMessages) => {
    const engine = useSynthesizerEngine.getState().engine;
    const { setCurrntGain, setVolumes, setPan, setReverb, setChorusDepth } =
      useMixerStoreNew.getState();
    const message = data.content.message;

    // Mixer
    switch (data.content.type) {
      case "MUTE":
        let mute = message as ISetMuteChannel;
        engine?.setMute(mute.channel, mute.mute);
        break;
      case "GIND_NODE":
        let gind = message as number[];
        setCurrntGain(gind);
        break;
      case "VOLUMES":
        let vol = message as ISetChannelGain;
        setVolumes(vol.channel, vol.value, true);
        break;
      case "PAN":
        let pan = message as ISetChannelGain;
        setPan(pan.channel, pan.value, true);
        break;
      case "REVERB":
        let reverb = message as ISetChannelGain;
        setReverb(reverb.channel, reverb.value, true);
        break;
      case "CHORUSDEPTH":
        let chorusdepth = message as ISetChannelGain;
        setChorusDepth(chorusdepth.channel, chorusdepth.value, true);
        break;

      default:
        break;
    }
  },
}));

export default useRemoteEventStore;

// const setCurrntGain = useMixerStoreNew((state) => state.setCurrntGain);
//   const setVolumes = useMixerStoreNew((state) => state.setVolumes);
//   const setPan = useMixerStoreNew((state) => state.setPan);
//   const setReverb = useMixerStoreNew((state) => state.setReverb);
//   const setChorusDepth = useMixerStoreNew((state) => state.setChorusDepth);
