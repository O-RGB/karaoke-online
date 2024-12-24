// import { create } from "zustand";
// import {
//   RemoteReceivedMessages,
//   SendType,
//   TypeUserControl,
// } from "../../../remote/types/remote.type";
// import { useSynthesizerEngine } from "@/stores/engine/synth-store";
// import useMixerStoreNew from "./event-mixer-store";
// import { IControllerChange } from "@/stores/engine/types/synth.type";
// import { usePeerStore } from "@/stores/peer-store";

// interface RemoteEventProps {
//   send: (
//     type: SendType,
//     user: TypeUserControl,
//     message: any,
//     clientId?: string
//   ) => void;
//   receivedType: (data: RemoteReceivedMessages) => void;
// }

// const useRemoteEventStore = create<RemoteEventProps>((set, get) => ({
//   send: (
//     type: SendType,
//     user: TypeUserControl,
//     message: any,
//     clientId?: string
//   ) => {
//     const sendSuperUserMessage = usePeerStore.getState().sendSuperUserMessage;
//     const sendMessage = usePeerStore.getState().sendMessage;

//     const sending = user === "SUPER" ? sendSuperUserMessage : sendMessage;

//     console.log(type, user, message, clientId);

//     switch (type) {
//       case "CONTROLLER":
//         sendSuperUserMessage({
//           message,
//           type,
//           user,
//           clientId,
//         });
//         break;

//       case "GIND_NODE":
//         sendSuperUserMessage({
//           message,
//           type,
//           user,
//           clientId,
//         });

//       default:
//         break;
//     }
//   },
//   receivedType: (data: RemoteReceivedMessages) => {
//     const engine = useSynthesizerEngine.getState().engine;
//     const {
//       setCurrntGain,
//       setVolumes,
//       setPan,
//       setReverb,
//       setChorusDepth,
//       setEventController,
//     } = useMixerStoreNew.getState();
//     const message = data.content.message;

//     // Mixer
//     switch (data.content.type) {
//       case "MUTE":
//         let mute = message as ISetMuteChannel;
//         engine?.setMute(mute.channel, mute.mute);
//         break;
//       case "GIND_NODE":
//         let gind = message as number[];
//         setCurrntGain(gind);
//         break;
//       case "VOLUMES":
//         let vol = message as ISetChannelGain;
//         setVolumes(vol.channel, vol.value, true);
//         break;
//       case "PAN":
//         let pan = message as ISetChannelGain;
//         setPan(pan.channel, pan.value, true);
//         break;
//       case "REVERB":
//         let reverb = message as ISetChannelGain;
//         setReverb(reverb.channel, reverb.value, true);
//         break;
//       case "CHORUSDEPTH":
//         let chorusdepth = message as ISetChannelGain;
//         setChorusDepth(chorusdepth.channel, chorusdepth.value, true);
//         break;
//       case "CONTROLLER":
//         let controller = message as IControllerChange;
//         setEventController(controller);
//         break;

//       default:
//         break;
//     }
//   },
// }));

// export default useRemoteEventStore;
