export type TypeMixer =
  | "MUTE"
  | "GIND_NODE"
  | "VOLUMES"
  | "PAN"
  | "REVERB"
  | "CHORUSDEPTH"
  | "PITCH";

export type TypeEvent = "CONTROLLER" | "PROGRAM";

export type TypeFormHost =
  // TIME MUSIC
  | "TIME_CHANGE"
  | "SET_TIME_CHANGE"

  // LOGIN
  | "VALIDATE_PIN"

  // SONG PLAYER
  | "SEND_SONG_LIST"
  | "UPLOAD_SONG"
  | "REQUEST_QUEUE_LIST"
  | "SONG_INFO_PLAYING"

  // SONG ACTION
  | "PLAY"
  | "PAUSED"
  | "NEXT_SONG"
  | "SET_SONG_INDEX_QUEUE"
  | "SORT_QUEUE";

export type TypeFormJoiner =
  | "SET_CHANNEL"
  | "PIN_VALIDATION"
  | "SET_SONG"
  | "SEARCH_SONG";
export type SendType = TypeFormJoiner | TypeFormHost | TypeMixer | TypeEvent;
export type TypeUserControl = "NORMAL" | "SUPER";

export interface RemoteReceivedMessages {
  from: string;
  content: RemoteSendMessage;
  user: TypeUserControl;
}

export interface RemoteSendMessage {
  message: any;
  type: SendType;
  user: TypeUserControl;
  clientId?: string;
}
