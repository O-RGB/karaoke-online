import { create } from "zustand";
import Peer, { DataConnection, MediaConnection } from "peerjs";
import {
  RemoteReceivedMessages,
  RemoteSendMessage,
  UserRole,
} from "../types/remote.type";
import {
  SoundfontPlayerChunkManager,
  SoundfontPlayerManager,
} from "@/utils/indexedDB/db/player/table";
import { ISoundfontChunk } from "@/utils/indexedDB/db/player/types";

export type UserType = "NORMAL" | "SUPER";

export type ConnectionStatus =
  | "IDLE"
  | "INITIALIZING"
  | "CONNECTING"
  | "CONNECTED"
  | "DISCONNECTED"
  | "ERROR";

type ConnectHandler = (
  clientId: string,
  userType: UserType
) => Promise<any> | any;

interface PendingRequest {
  resolve: (value: any) => void;
  reject: (reason?: any) => void;
  timeoutId: NodeJS.Timeout;
}

interface RouteHandler {
  (payload: any, clientId: string, userType: UserType): Promise<any> | any;
}

interface RouteRegistry {
  [route: string]: RouteHandler;
}

interface FileTransfer {
  id: string;
  fileName: string;
  fileSize: number;
  receivedSize: number;
  progress: number;
  chunkCount: number;
  chunkIds: number[];
}

// [Updated] เพิ่ม waitForResponse
interface RequestOptions {
  timeout?: number;
  role?: UserRole;
  waitForResponse?: boolean;
}

// --- Helper Functions ---

const setupHostConnectionHandlers = (
  conn: DataConnection,
  userType: UserType,
  set: (
    partial:
      | Partial<PeerHostState>
      | ((state: PeerHostState) => Partial<PeerHostState>)
  ) => void,
  get: () => PeerHostState
) => {
  conn.on("data", async (data: any) => {
    // 1. Handle File Transfer Start
    if (data?.type === "FILE_TRANSFER_START") {
      const { transferId, fileName, fileSize } = data.payload;
      console.log(`[Host] Receiving file: ${fileName} (${fileSize} bytes)`);
      set((state) => ({
        fileTransfers: {
          ...state.fileTransfers,
          [transferId]: {
            id: transferId,
            fileName,
            fileSize,
            receivedSize: 0,
            progress: 0,
            chunkCount: 0,
            chunkIds: [],
          },
        },
      }));
      get().onFileProgress?.({ transferId, progress: 0, fileName });
      return;
    }

    // 2. Handle File Transfer Chunk
    if (data?.type === "FILE_TRANSFER_CHUNK") {
      const { transferId, chunk } = data.payload;
      const transfer = get().fileTransfers[transferId];
      const chunkManager = new SoundfontPlayerChunkManager();

      if (transfer) {
        try {
          const chunkData: Partial<ISoundfontChunk> = {
            transferId: transferId,
            file: {
              chunkIndex: transfer.chunkCount,
              data: chunk,
            },
          };

          const newChunkId = await chunkManager.add(
            chunkData as Partial<ISoundfontChunk>
          );

          const newChunkIds = [...transfer.chunkIds, newChunkId];
          const newReceivedSize = transfer.receivedSize + chunk.byteLength;
          const newChunkCount = transfer.chunkCount + 1;
          const newProgress = Math.round(
            (newReceivedSize / transfer.fileSize) * 100
          );

          set((state) => {
            const updatedTransfer = {
              ...state.fileTransfers[transferId],
              receivedSize: newReceivedSize,
              chunkCount: newChunkCount,
              progress: newProgress,
              chunkIds: newChunkIds,
            };
            return {
              fileTransfers: {
                ...state.fileTransfers,
                [transferId]: updatedTransfer,
              },
            };
          });

          if (newProgress !== transfer.progress) {
            get().onFileProgress?.({
              transferId,
              progress: newProgress,
              fileName: transfer.fileName,
              status: "PROCESSING",
            });
          }

          conn.send({
            type: "FILE_CHUNK_RECEIVED",
            payload: { transferId },
          });
        } catch (error) {
          console.error(
            `[Host] Failed to save chunk ${transfer.chunkCount} for ${transferId}`,
            error
          );
          get().onFileProgress?.({
            transferId: transfer.id,
            fileName: transfer.fileName,
            progress: transfer.progress,
            status: "ERROR",
            error: `ไม่สามารถประมวลผลไฟล์ส่วนเล็กๆ ได้ กรุณาลองใหม่อีกครั้ง`,
          });
        }
      }
      return;
    }

    // 3. Handle File Transfer End
    if (data?.type === "FILE_TRANSFER_END") {
      const { transferId } = data.payload;
      const transfer = get().fileTransfers[transferId];

      if (transfer) {
        console.log(`[Host] File transfer complete for ${transferId}.`);
        get().onFileProgress?.({
          transferId,
          progress: 100,
          fileName: transfer.fileName,
          status: "READY_FOR_ASSEMBLY",
        });

        set((state) => {
          const newFileTransfers = { ...state.fileTransfers };
          delete newFileTransfers[transferId];
          return {
            fileTransfers: newFileTransfers,
            pendingAssembly: {
              ...state.pendingAssembly,
              [transferId]: transfer,
            },
          };
        });
      }
      return;
    }

    // 4. Handle Responses (to requestToClient)
    if (data?.type === "RESPONSE" && data.requestId) {
      const pending = get().pendingRequests.get(data.requestId);
      if (pending) {
        clearTimeout(pending.timeoutId);
        if (data.error) {
          pending.reject(new Error(data.error));
        } else {
          pending.resolve(data.payload);
        }
        get().pendingRequests.delete(data.requestId);
      }
      return;
    }

    // 5. Handle Incoming Requests (Routes) - Expects RESPONSE
    if (data?.type === "REQUEST" && data.requestId) {
      try {
        const { route, payload } = data.payload;
        const handler = get().routes[route];

        if (!handler) {
          throw new Error(`Route '${route}' not found`);
        }

        const result = await handler(payload, conn.peer, userType);

        conn.send({
          type: "RESPONSE",
          requestId: data.requestId,
          payload: result,
        });
      } catch (e: any) {
        conn.send({
          type: "RESPONSE",
          requestId: data.requestId,
          error: e.message || "An unknown error occurred on the host.",
        });
      }
      return;
    }

    // 6. Handle Incoming Events (One-way Routes) - No RESPONSE
    if (data?.type === "EVENT") {
      try {
        const { route, payload } = data.payload;
        const handler = get().routes[route];

        if (handler) {
          handler(payload, conn.peer, userType);
        }
      } catch (e: any) {
        console.error(
          `Error handling event route '${data.payload?.route}':`,
          e
        );
      }
      return;
    }

    // 7. Handle Nickname Info
    if (data?.type === "NICKNAME_INFO") {
      set((state) => ({
        clientNicknames: {
          ...state.clientNicknames,
          [conn.peer]: data.payload,
        },
        clientRoles: {
          ...state.clientRoles,
          [conn.peer]: state.clientRoles[conn.peer] || "user",
        },
      }));
      return;
    }

    // 8. Handle Pong
    if (data?.type === "pong") {
      set((state) => ({
        lastSeen: { ...state.lastSeen, [conn.peer]: Date.now() },
      }));
      return;
    }

    // 9. General Messages
    const received = { from: conn.peer, content: data, userType };
    set((state) => ({
      received,
      lastSeen: { ...state.lastSeen, [conn.peer]: Date.now() },
    }));
  });

  conn.on("close", () => {
    get().endCall(conn.peer);
    set((state) => {
      const newConnections = { ...state.connections };
      newConnections[userType] = newConnections[userType].filter(
        (c) => c.peer !== conn.peer
      );
      const newLastSeen = { ...state.lastSeen };
      delete newLastSeen[conn.peer];
      const newClientNicknames = { ...state.clientNicknames };
      delete newClientNicknames[conn.peer];
      const newClientRoles = { ...state.clientRoles };
      delete newClientRoles[conn.peer];

      // ลบออกจาก Master List
      const newMasterConnections = state.masterConnections.filter(
        (c) => c.peer !== conn.peer
      );

      if (
        Object.values(newConnections).flat().length === 0 &&
        Object.keys(state.calls).length === 0
      ) {
        get().stopHeartbeatChecks();
      }
      return {
        connections: newConnections,
        lastSeen: newLastSeen,
        clientNicknames: newClientNicknames,
        clientRoles: newClientRoles,
        masterConnections: newMasterConnections,
      };
    });
  });

  conn.on("error", (err) =>
    console.error(`Error in connection with ${conn.peer}`, err)
  );
};

const setupHostCallHandlers = (
  call: MediaConnection,
  set: (
    partial:
      | Partial<PeerHostState>
      | ((state: PeerHostState) => Partial<PeerHostState>)
  ) => void,
  get: () => PeerHostState
) => {
  call.on("stream", (remoteStream) => {
    set((state) => ({
      remoteStreams: { ...state.remoteStreams, [call.peer]: remoteStream },
    }));
  });

  call.on("close", () => {
    set((state) => {
      const newCalls = { ...state.calls };
      delete newCalls[call.peer];
      const newRemoteStreams = { ...state.remoteStreams };
      delete newRemoteStreams[call.peer];
      const newVisibleClientIds = state.visibleClientIds.filter(
        (id) => id !== call.peer
      );
      if (
        Object.keys(newCalls).length === 0 &&
        Object.values(state.connections).flat().length === 0
      ) {
        get().stopHeartbeatChecks();
      }
      return {
        calls: newCalls,
        remoteStreams: newRemoteStreams,
        visibleClientIds: newVisibleClientIds,
      };
    });
  });

  call.on("error", (err) =>
    console.error(`Error in call with ${call.peer}`, err)
  );
};

// --- Store Interface ---

export interface PeerHostState {
  peers: { [key in UserType]?: Peer };
  connections: { [key in UserType]: DataConnection[] };
  received?: RemoteReceivedMessages;
  lastSeen: { [peerId: string]: number };
  clientNicknames: { [peerId: string]: string };
  clientRoles: { [peerId: string]: UserRole };

  masterConnections: DataConnection[];

  heartbeatIntervalId: NodeJS.Timeout | null;
  remoteStreams: { [peerId: string]: MediaStream };
  calls: { [peerId: string]: MediaConnection };

  visibleClientIds: string[];
  pendingRequests: Map<string, PendingRequest>;
  routes: RouteRegistry;

  connectHandler: ConnectHandler | null;

  allowCalls?: boolean;

  fileTransfers: { [transferId: string]: FileTransfer };
  pendingAssembly: { [transferId: string]: FileTransfer };

  onFileProgress?: (payload: {
    transferId: string;
    progress: number;
    fileName: string;
    status?:
      | "PROCESSING"
      | "ASSEMBLING"
      | "COMPLETE"
      | "ERROR"
      | "READY_FOR_ASSEMBLY";
    error?: string;
  }) => void;

  // Actions
  setAllowCalls: (isAllow: boolean) => void;
  initializePeer: (userType: UserType) => Promise<string>;
  sendMessage: (info: RemoteSendMessage) => Promise<void>;

  sendToMaster: (route: string, payload: any) => void;

  sendMessageWithResponse: <T = any>(
    clientId: string,
    message: any,
    timeout?: number
  ) => Promise<T>;
  disconnect: (userType?: UserType) => Promise<void>;
  startHeartbeatChecks: () => void;
  stopHeartbeatChecks: () => void;
  endCall: (peerId: string) => void;
  toggleClientVisibility: (peerId: string) => void;
  setClientRole: (peerId: string, role: UserRole) => void;

  addRoute: (route: string, handler: RouteHandler) => void;
  removeRoute: (route: string) => void;
  getRoutes: () => string[];

  onClientConnect: (handler: ConnectHandler) => void;

  requestToClient: <T = any>(
    clientId: string | null,
    route: string,
    payload?: any,
    options?: RequestOptions
  ) => Promise<T>;

  assembleFile: (transferId: string) => Promise<void>;

  setOnFileProgress: (
    callback: (payload: {
      transferId: string;
      progress: number;
      fileName: string;
      status?:
        | "PROCESSING"
        | "ASSEMBLING"
        | "COMPLETE"
        | "ERROR"
        | "READY_FOR_ASSEMBLY";
      error?: string;
    }) => void
  ) => void;
}

const HEARTBEAT_INTERVAL = 3000;
const CLIENT_TIMEOUT = 6000;

// --- Store Implementation ---

export const usePeerHostStore = create<PeerHostState>((set, get) => ({
  peers: {},
  connections: { NORMAL: [], SUPER: [] },
  received: undefined,
  lastSeen: {},
  clientNicknames: {},
  clientRoles: {},
  masterConnections: [],
  heartbeatIntervalId: null,
  remoteStreams: {},
  calls: {},
  visibleClientIds: [],
  pendingRequests: new Map(),
  routes: {},
  connectHandler: null,
  fileTransfers: {},
  pendingAssembly: {},

  setOnFileProgress: (callback) => set({ onFileProgress: callback }),
  setAllowCalls: (isAllow: boolean) => set({ allowCalls: isAllow }),

  onClientConnect: (handler) => set({ connectHandler: handler }),

  startHeartbeatChecks: () => {
    if (get().heartbeatIntervalId) return;
    const intervalId = setInterval(() => {
      const { connections, lastSeen, calls } = get();
      const now = Date.now();
      const allConnections = Object.values(connections).flat();
      if (allConnections.length === 0 && Object.keys(calls).length === 0) {
        get().stopHeartbeatChecks();
        return;
      }
      allConnections.forEach((conn) => {
        if (now - (lastSeen[conn.peer] || 0) > CLIENT_TIMEOUT) {
          conn.close();
        } else {
          conn.send({ type: "ping" });
        }
      });
    }, HEARTBEAT_INTERVAL);
    set({ heartbeatIntervalId: intervalId });
  },

  stopHeartbeatChecks: () => {
    const { heartbeatIntervalId } = get();
    if (heartbeatIntervalId) {
      clearInterval(heartbeatIntervalId);
      set({ heartbeatIntervalId: null });
    }
  },

  initializePeer: (userType: UserType): Promise<string> => {
    return new Promise((resolve, reject) => {
      const existingPeer = get().peers[userType];
      if (existingPeer && !existingPeer.destroyed) {
        return resolve(existingPeer.id);
      }

      const newPeer = new Peer({});
      newPeer.on("open", (id) => {
        set((state) => ({ peers: { ...state.peers, [userType]: newPeer } }));

        newPeer.on("connection", (conn) => {
          set((state) => ({
            connections: {
              ...state.connections,
              [userType]: [...state.connections[userType], conn],
            },
            lastSeen: { ...state.lastSeen, [conn.peer]: Date.now() },
          }));

          setupHostConnectionHandlers(conn, userType, set, get);

          conn.on("open", async () => {
            const handler = get().connectHandler;
            if (handler) {
              try {
                const initPayload = await handler(conn.peer, userType);
                if (initPayload !== undefined) {
                  conn.send({
                    type: "SYSTEM_INIT",
                    payload: initPayload,
                  });
                  console.log(`[Host] Sent SYSTEM_INIT to ${conn.peer}`);
                }
              } catch (error) {
                console.error(
                  `[Host] Error in connectHandler for ${conn.peer}`,
                  error
                );
              }
            }
          });

          if (!get().heartbeatIntervalId) get().startHeartbeatChecks();
        });

        newPeer.on("call", (call) => {
          call.answer();
          setupHostCallHandlers(call, set, get);
          set((state) => ({ calls: { ...state.calls, [call.peer]: call } }));
          if (!get().visibleClientIds.includes(call.peer)) {
            set((state) => ({
              visibleClientIds: [...state.visibleClientIds, call.peer],
            }));
          }
        });
        resolve(id);
      });
      newPeer.on("error", (err) => {
        console.error("PeerJS error:", err);
        reject(err);
      });
    });
  },

  sendMessage: async (info: RemoteSendMessage) => {
    const { connections } = get();
    const messageToSend = {
      ...info,
      message: await Promise.resolve(info.message),
    };
    if (info.clientId) {
      Object.values(connections)
        .flat()
        .find((c) => c.peer === info.clientId)
        ?.send(messageToSend);
    } else {
      connections[info.user].forEach((conn) => conn.send(messageToSend));
    }
  },

  sendToMaster: (route: string, payload: any) => {
    const { masterConnections } = get();
    masterConnections.forEach((conn) => {
      if (conn.open) {
        try {
          conn.send({
            type: "EVENT",
            payload: { route, payload },
          });
        } catch (error) {
          console.warn(`[Host] Failed to send to master ${conn.peer}`, error);
        }
      }
    });
  },

  sendMessageWithResponse: <T = any>(
    clientId: string,
    message: any,
    timeout = 10000
  ): Promise<T> => {
    return new Promise((resolve, reject) => {
      const { connections, pendingRequests } = get();
      const conn = Object.values(connections)
        .flat()
        .find((c) => c.peer === clientId);

      if (!conn) {
        return reject(new Error(`Client with ID ${clientId} not found.`));
      }

      const requestId = crypto.randomUUID();
      const timeoutId = setTimeout(() => {
        pendingRequests.delete(requestId);
        reject(
          new Error(
            `Request to client ${clientId} timed out after ${timeout}ms`
          )
        );
      }, timeout);

      pendingRequests.set(requestId, { resolve, reject, timeoutId });

      conn.send({
        type: "REQUEST",
        requestId,
        payload: message,
      });
    });
  },

  disconnect: (userType?: UserType) => {
    return new Promise<void>((resolve) => {
      get().stopHeartbeatChecks();
      Object.values(get().connections)
        .flat()
        .forEach((conn) => conn.close());
      Object.values(get().calls).forEach((call) => call.close());
      const typesToDisconnect = userType
        ? [userType]
        : (Object.keys(get().peers) as UserType[]);

      const updatedPeers = { ...get().peers };
      typesToDisconnect.forEach((type) => {
        updatedPeers[type]?.destroy();
        delete updatedPeers[type];
      });

      set({
        peers: updatedPeers,
        connections: { NORMAL: [], SUPER: [] },
        lastSeen: {},
        clientNicknames: {},
        clientRoles: {},
        masterConnections: [],
        heartbeatIntervalId: null,
        remoteStreams: {},
        calls: {},
        visibleClientIds: [],
        pendingRequests: new Map(),
        fileTransfers: {},
        pendingAssembly: {},
      });
      resolve();
    });
  },

  endCall: (peerId: string) => {
    get().calls[peerId]?.close();
  },

  toggleClientVisibility: (peerId: string) => {
    set((state) => {
      const isVisible = state.visibleClientIds.includes(peerId);
      return {
        visibleClientIds: isVisible
          ? state.visibleClientIds.filter((id) => id !== peerId)
          : [...state.visibleClientIds, peerId],
      };
    });
  },

  addRoute: (route: string, handler: RouteHandler) => {
    set((state) => ({
      routes: { ...state.routes, [route]: handler },
    }));
  },

  setClientRole: (peerId: string, role: UserRole) => {
    set((state) => {
      let newMasterConnections = [...state.masterConnections];
      const targetConn = Object.values(state.connections)
        .flat()
        .find((c) => c.peer === peerId);

      if (role === "master") {
        if (
          targetConn &&
          !newMasterConnections.some((c) => c.peer === peerId)
        ) {
          newMasterConnections.push(targetConn);
        }
      } else {
        newMasterConnections = newMasterConnections.filter(
          (c) => c.peer !== peerId
        );
      }

      return {
        clientRoles: {
          ...state.clientRoles,
          [peerId]: role,
        },
        masterConnections: newMasterConnections,
      };
    });
  },

  removeRoute: (route: string) => {
    set((state) => {
      const newRoutes = { ...state.routes };
      delete newRoutes[route];
      return { routes: newRoutes };
    });
  },

  getRoutes: () => {
    return Object.keys(get().routes);
  },

  assembleFile: async (transferId: string) => {
    const transfer = get().pendingAssembly[transferId];
    if (!transfer) {
      console.error(
        `[Host] Cannot assemble: No pending transfer found for ID ${transferId}`
      );
      throw new Error(`ไม่พบไฟล์ที่รอการรวมสำหรับ ID: ${transferId}`);
    }

    const chunkManager = new SoundfontPlayerChunkManager();
    const soundfontDb = new SoundfontPlayerManager();

    try {
      console.log(
        `[Host] User triggered assembly for transferId: ${transferId}`
      );
      get().onFileProgress?.({
        transferId,
        progress: 100,
        fileName: transfer.fileName,
        status: "ASSEMBLING",
      });

      const chunkIds = transfer.chunkIds;
      if (!chunkIds || chunkIds.length === 0) {
        throw new Error("ไม่พบ ID ของชิ้นส่วนไฟล์ในข้อมูลที่รอการรวม");
      }

      const stream = new ReadableStream({
        async start(controller) {
          for (const id of chunkIds) {
            const chunkRecord = await chunkManager.get(id);
            if (chunkRecord?.file?.data) {
              controller.enqueue(chunkRecord.file.data);
              await chunkManager.delete(id);
            } else {
              controller.error(`ไม่พบข้อมูลชิ้นส่วนไฟล์ ID: ${id}`);
              return;
            }
          }
          controller.close();
        },
      });

      const response = new Response(stream);
      const fileBlob = await response.blob();
      const finalFile = new File([fileBlob], transfer.fileName, {
        type: "application/octet-stream",
      });

      await soundfontDb.add({ file: finalFile });

      set((state) => {
        const newPendingAssembly = { ...state.pendingAssembly };
        delete newPendingAssembly[transferId];
        return { pendingAssembly: newPendingAssembly };
      });

      get().onFileProgress?.({
        transferId,
        progress: 100,
        fileName: transfer.fileName,
        status: "COMPLETE",
      });
    } catch (error: any) {
      console.error(
        `[Host] Failed to assemble or save file for ${transferId}`,
        error
      );
      get().onFileProgress?.({
        transferId,
        progress: 100,
        fileName: transfer.fileName,
        status: "ERROR",
        error: `ไม่สามารถรวมหรือบันทึกไฟล์ '${transfer.fileName}' ได้: ${error.message}`,
      });
      throw error;
    }
  },

  // [Modified] Update requestToClient to support waitForResponse
  requestToClient: <T = any>(
    clientId: string | null,
    route: string,
    payload: any = {},
    options: RequestOptions = {}
  ): Promise<T> => {
    const { connections, pendingRequests, clientRoles } = get();
    // Default waitForResponse = true to keep old behavior
    const { timeout = 10000, role, waitForResponse = true } = options;

    if (clientId) {
      return new Promise<T>((resolve, reject) => {
        const conn = Object.values(connections)
          .flat()
          .find((c) => c.peer === clientId);

        if (!conn) {
          return reject(new Error(`Client with ID ${clientId} not found.`));
        }

        // [Logic] If not waiting for response
        if (!waitForResponse) {
          // Send as EVENT
          conn.send({
            type: "EVENT",
            payload: { route, payload },
          });
          return resolve({} as T);
        }

        // [Logic] If waiting for response (Existing logic)
        const requestId = crypto.randomUUID();
        const timeoutId = setTimeout(() => {
          pendingRequests.delete(requestId);
          reject(
            new Error(
              `Request to client ${clientId} (route: ${route}) timed out after ${timeout}ms`
            )
          );
        }, timeout);

        pendingRequests.set(requestId, {
          resolve: (value: any) => {
            clearTimeout(timeoutId);
            pendingRequests.delete(requestId);
            resolve(value);
          },
          reject: (reason?: any) => {
            clearTimeout(timeoutId);
            pendingRequests.delete(requestId);
            reject(reason);
          },
          timeoutId,
        });

        conn.send({
          type: "REQUEST",
          requestId,
          payload: { route, payload },
        });
      });
    }

    return new Promise<T>((resolve, reject) => {
      let targets: DataConnection[];
      const allConnections = Object.values(connections).flat();

      if (role) {
        targets = allConnections.filter(
          (conn) => clientRoles[conn.peer] === role
        );
        if (targets.length === 0) {
          // If expecting response, reject. If not, just resolve.
          if (waitForResponse) {
            return reject(
              new Error(`No clients found with role '${role}' to request.`)
            );
          } else {
            return resolve({} as T);
          }
        }
      } else {
        targets = allConnections;
      }

      if (targets.length === 0) {
        if (waitForResponse) {
          return reject(new Error("No active connections to broadcast to."));
        } else {
          return resolve({} as T);
        }
      }

      // [Logic] If not waiting for response (Broadcast)
      if (!waitForResponse) {
        targets.forEach((conn) => {
          if (conn.open) {
            conn.send({
              type: "EVENT",
              payload: { route, payload },
            });
          }
        });
        return resolve({} as T);
      }

      // [Logic] If waiting for response (Broadcast)
      let hasSettled = false;
      const requestIds: string[] = [];
      let timeoutCount = 0;

      const cleanup = () => {
        requestIds.forEach((id) => {
          const pending = pendingRequests.get(id);
          if (pending) {
            clearTimeout(pending.timeoutId);
            pendingRequests.delete(id);
          }
        });
      };

      targets.forEach((conn) => {
        const requestId = crypto.randomUUID();
        requestIds.push(requestId);

        const timeoutId = setTimeout(() => {
          timeoutCount++;
          pendingRequests.delete(requestId);
          if (!hasSettled && timeoutCount === targets.length) {
            hasSettled = true;
            reject(
              new Error(
                `Request (route: ${route}) timed out for all targeted clients after ${timeout}ms.`
              )
            );
          }
        }, timeout);

        pendingRequests.set(requestId, {
          resolve: (value: any) => {
            if (!hasSettled) {
              hasSettled = true;
              cleanup();
              resolve(value);
            }
          },
          reject: (reason?: any) => {
            console.error(
              `Request to client ${conn.peer} was rejected:`,
              reason
            );
          },
          timeoutId,
        });

        conn.send({
          type: "REQUEST",
          requestId,
          payload: { route, payload },
        });
      });
    });
  },
}));
