export interface ISoundfontPlayer {
  id: number;
  file: File;
  createdAt: Date;
}
export interface ISoundfontChunk {
  id: number;
  transferId: string;
  file: {
    chunkIndex: number;
    data: ArrayBuffer;
  };
  createdAt: Date;
}
