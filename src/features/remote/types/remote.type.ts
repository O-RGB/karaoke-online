import {
  INodeKey,
  INodeOption,
} from "@/features/engine/modules/instrumentals/types/node.type";

export type TypeUserControl = "NORMAL" | "SUPER";

export interface RemoteReceivedMessages {
  from: string;
  content: RemoteSendMessage;
  user: TypeUserControl;
}

export interface TypeMessage {
  type: INodeKey | "GAIN" | "SEARCH" | "SET_SONG";
  event: INodeOption;
}

export interface RemoteSendMessage {
  message: any;
  user: TypeUserControl;
  clientId?: string;
  type?: TypeMessage;
}
