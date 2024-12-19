type TypeMixer =
  | "MUTE"
  | "GIND_NODE"
  | "VOLUMES"
  | "PAN"
  | "REVERB"
  | "CHORUSDEPTH"
  | "PITCH";

type TypeEvent = "CONTROLLER" | "PROGRAM";

type TypeFormHost =
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

type TypeFormJoiner =
  | "SET_CHANNEL"
  | "PIN_VALIDATION"
  | "SET_SONG"
  | "SEARCH_SONG";
type SendType = TypeFormJoiner | TypeFormHost | TypeMixer | TypeEvent;
type TypeUserControl = "NORMAL" | "SUPER";

// interface RemoteEncode<T = any> {
//   type: SendType;
//   message: T;
//   user: TypeUserControl;
// }

interface RemoteReceivedMessages {
  from: string;
  content: RemoteSendMessage;
  user: TypeUserControl;
}

interface RemoteSendMessage {
  message: any;
  type: SendType;
  user: TypeUserControl;
  clientId?: string;
}
