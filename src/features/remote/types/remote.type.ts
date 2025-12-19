export type TypeUserControl = "NORMAL" | "SUPER";

// [Added] เพิ่ม Type สำหรับ Role (master/user)
export type UserRole = "master" | "user";

export interface RemoteReceivedMessages {
  from: string;
  content: RemoteSendMessage;
  userType: TypeUserControl;
}

export type TypeHostSend = "ON_YOUR_ROUND";
export type TypeNormal = "SEARCH" | "SET_SONG";

export interface RemoteSendMessage {
  message: any;
  user: TypeUserControl;
  clientId?: string;
  type?: TypeNormal | TypeHostSend;
}
