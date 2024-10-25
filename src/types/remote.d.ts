type TypeFormHost =
  | "GIND_NODE"
  | "VOLUMES"
  | "PAN"
  | "REVERB"
  | "CHORUSDEPTH"
  | ""
  | "VALIDATE_PIN"
  | "SEND_SONG_LIST"
  | "UPLOAD_SONG"
  | "REQUEST_QUEUE_LIST";
type TypeFormJoiner =
  | "SET_CHANNEL"
  | "PIN_VALIDATION"
  | "SET_SONG"
  | "SEARCH_SONG";
type SendType = TypeFormJoiner | TypeFormHost;
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
