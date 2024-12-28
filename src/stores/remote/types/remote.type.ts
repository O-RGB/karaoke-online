// export type TypeMixer =
//   | "MUTE"
//   | "GIND_NODE"
//   | "VOLUMES"
//   | "PAN"
//   | "REVERB"
//   | "CHORUSDEPTH"
//   | "PITCH";

// export type TypeEvent =
//   | "CONTROLLER"
//   | "PROGRAM"
//   | "CONTROLLER_CHANGE"
//   | "CONTROLLER_LOCK";

// export type TypeFormHost =
//   // TIME MUSIC
//   | "TIME_CHANGE"
//   | "SET_TIME_CHANGE"

//   // LOGIN
//   | "VALIDATE_PIN"

//   // SONG PLAYER
//   | "SEND_SONG_LIST"
//   | "UPLOAD_SONG"
//   | "REQUEST_QUEUE_LIST"
//   | "SONG_INFO_PLAYING"

//   // SONG ACTION
//   | "PLAY"
//   | "PAUSED"
//   | "NEXT_SONG"
//   | "SET_SONG_INDEX_QUEUE"
//   | "SORT_QUEUE";

// export type TypeFormJoiner =
//   | "SET_CHANNEL"
//   | "PIN_VALIDATION"
//   | "SET_SONG"
//   | "SEARCH_SONG";

export type NodeHostType =
  | "HOST_CONTROLLER"
  | "HOST_PROGRAM"
  | "HOST_LOCK"
  | "HOST_MUTE"
  | "HOST_GAIN";
export type NodeJoinType =
  | "JOIN_CONTROLLER"
  | "JOIN_PROGRAM"
  | "JOIN_LOCK"
  | "JOIN_MUTE";

export type SendType = NodeHostType | NodeJoinType;
export type TypeUserControl = "NORMAL" | "SUPER";

export interface RemoteReceivedMessages {
  from: string;
  content: RemoteSendMessage;
  user: TypeUserControl;
}

export interface RemoteSendMessage {
  message: any;
  // type: SendType;
  user: TypeUserControl;
  clientId?: string;
}
