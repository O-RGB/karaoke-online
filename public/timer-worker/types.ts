// types.ts

export type TimingMode = "Tick" | "Time";

// ------------------------------------------------------------------
// 1. Timing Message (สำหรับ Engine เท่านั้น ส่งถี่ๆ 20fps+)
// ------------------------------------------------------------------
export interface TimingMessage {
  type: TimingMode; // "Tick" หรือ "Time"
  value: number; // Ticks (ถ้าโหมด Tick) หรือ Seconds (ถ้าโหมด Time)
}

// ------------------------------------------------------------------
// 2. Display Message (สำหรับ UI หน้าจอ ส่งแยกมาต่างหาก)
// ------------------------------------------------------------------
export interface DisplayResponseMessage {
  type: "displayUpdate";
  bpm: number;
  elapsedSeconds: number; // วินาทีปัจจุบัน (เอาไปโชว์ 00:01)
  countdown: number; // วินาทีนับถอยหลัง
  totalSeconds: number; // ความยาวเพลงรวม (วินาที)
}

// ------------------------------------------------------------------
// 3. Seek Response (ตอบกลับเมื่อ User สั่ง Seek)
// ------------------------------------------------------------------
export interface SeekResponseMessage {
  type: "seekResponse";
  seekValue: number; // ค่าที่คำนวณเสร็จแล้ว (Ticks/Seconds) สำหรับส่งเข้า Engine
  mode: TimingMode;

  // แนบข้อมูล Display มาด้วยเลย เพื่อให้ UI อัพเดททันทีหลังปล่อยมือ
  bpm: number;
  elapsedSeconds: number;
  countdown: number;
  totalSeconds: number;
}

// ------------------------------------------------------------------
// 4. Timing Response (สำหรับตอนเรียก getTiming แบบ Manual)
// ------------------------------------------------------------------
export interface TimingResponseMessage {
  type: "timingResponse";
  value: number;
  bpm: number;
  elapsedSeconds: number;
  countdown: number;
  totalSeconds: number;
}

// Union Type รวมทั้งหมด
export type WorkerResponseMessage =
  | TimingMessage
  | DisplayResponseMessage
  | SeekResponseMessage
  | TimingResponseMessage;

// ─── Worker Commands (เหมือนเดิม) ─────────────────────────────────────────
export interface StartCommandPayload {
  ppq?: number;
  mode?: TimingMode;
}
export interface SeekCommandPayload {
  value: number;
} // รับวินาทีเสมอ
export interface TempoCommandPayload {
  mppq: number;
}
export interface PpqCommandPayload {
  ppq: number;
}
export interface ModeCommandPayload {
  mode: TimingMode;
}
export interface DurationCommandPayload {
  duration: number;
}
export interface PlaybackRatePayload {
  rate: number;
}

export type WorkerCommandPayload =
  | StartCommandPayload
  | SeekCommandPayload
  | TempoCommandPayload
  | PpqCommandPayload
  | ModeCommandPayload
  | DurationCommandPayload
  | PlaybackRatePayload
  | number
  | undefined;

export interface WorkerMessage {
  command:
    | "start"
    | "stop"
    | "seek"
    | "reset"
    | "getTiming"
    | "updateTempo"
    | "updatePpq"
    | "updateMode"
    | "updateDuration"
    | "updatePlaybackRate";
  value?: WorkerCommandPayload;
}
