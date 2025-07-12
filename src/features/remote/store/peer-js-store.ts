import { create } from "zustand";
import Peer, { DataConnection, MediaConnection } from "peerjs";
import {
  RemoteReceivedMessages,
  RemoteSendMessage,
} from "../types/remote.type";

export type UserType = "NORMAL" | "SUPER";
export type ConnectionStatus =
  | "IDLE"
  | "INITIALIZING"
  | "CONNECTING"
  | "CONNECTED"
  | "DISCONNECTED"
  | "ERROR";

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

interface RequestContext {
  clientId: string;
  userType: UserType;
  route: string;
  payload: any;
}

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

    if (data?.type === "NICKNAME_INFO") {
      set((state) => ({
        clientNicknames: {
          ...state.clientNicknames,
          [conn.peer]: data.payload,
        },
      }));
      return;
    }

    if (data?.type === "pong") {
      set((state) => ({
        lastSeen: { ...state.lastSeen, [conn.peer]: Date.now() },
      }));
      return;
    }

    const received = { from: conn.peer, content: data, userType };
    set((state) => ({
      received,
      lastSeen: { ...state.lastSeen, [conn.peer]: Date.now() },
    }));
  });

  conn.on("close", () => {
    // ✨ FIX: สั่งปิด Call ที่เกี่ยวข้องกับ client คนนี้ทันที
    // การทำแบบนี้จะไป trigger 'call.on("close")' ให้ทำงาน
    // เพื่อลบข้อมูลใน calls, remoteStreams, และ visibleClientIds
    get().endCall(conn.peer);

    // จัดการลบข้อมูลในส่วนของ DataConnection ตามเดิม
    set((state) => {
      const newConnections = { ...state.connections };
      newConnections[userType] = newConnections[userType].filter(
        (c) => c.peer !== conn.peer
      );
      const newLastSeen = { ...state.lastSeen };
      delete newLastSeen[conn.peer];
      const newClientNicknames = { ...state.clientNicknames };
      delete newClientNicknames[conn.peer];
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

export interface PeerHostState {
  peers: { [key in UserType]?: Peer };
  connections: { [key in UserType]: DataConnection[] };
  received?: RemoteReceivedMessages;
  lastSeen: { [peerId: string]: number };
  clientNicknames: { [peerId: string]: string };
  heartbeatIntervalId: NodeJS.Timeout | null;
  remoteStreams: { [peerId: string]: MediaStream };
  calls: { [peerId: string]: MediaConnection };

  visibleClientIds: string[];
  pendingRequests: Map<string, PendingRequest>;
  routes: RouteRegistry;

  allowCalls?: boolean;

  setAllowCalls?: (isAllow: boolean) => void;
  initializePeer: (userType: UserType) => Promise<string>;
  sendMessage: (info: RemoteSendMessage) => Promise<void>;
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

  addRoute: (route: string, handler: RouteHandler) => void;
  removeRoute: (route: string) => void;
  getRoutes: () => string[];
  requestToClient: <T = any>(
    clientId: string | null,
    route: string,
    payload?: any,
    timeout?: number
  ) => Promise<T>;
}

const HEARTBEAT_INTERVAL = 3000;
const CLIENT_TIMEOUT = 6000;

export const usePeerHostStore = create<PeerHostState>((set, get) => ({
  peers: {},
  connections: { NORMAL: [], SUPER: [] },
  received: undefined,
  lastSeen: {},
  clientNicknames: {},
  heartbeatIntervalId: null,
  remoteStreams: {},
  calls: {},
  visibleClientIds: [],
  pendingRequests: new Map(),
  routes: {},

  setAllowCalls: (isAllow: boolean) => set({ allowCalls: isAllow }),
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
      const newPeer = new Peer();
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
        heartbeatIntervalId: null,
        remoteStreams: {},
        calls: {},
        visibleClientIds: [],
        pendingRequests: new Map(),
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

  requestToClient: <T = any>(
    clientId: string | null,
    route: string,
    payload: any = {},
    timeout = 10000
  ): Promise<T> => {
    const { connections, pendingRequests } = get();

    if (!clientId) {
      return new Promise<T>((resolve, reject) => {
        const allConnections = Object.values(connections).flat();

        let hasSettled = false;
        const requestIds: string[] = [];
        let timeoutCount = 0;

        // ฟังก์ชันสำหรับเคลียร์ pending requests และ timeouts ทั้งหมด
        const cleanup = () => {
          requestIds.forEach((id) => {
            const pending = pendingRequests.get(id);
            if (pending) {
              clearTimeout(pending.timeoutId);
              pendingRequests.delete(id);
            }
          });
        };

        allConnections.forEach((conn) => {
          const requestId = crypto.randomUUID();
          requestIds.push(requestId);

          const timeoutId = setTimeout(() => {
            timeoutCount++;
            pendingRequests.delete(requestId);
            // ถ้า client ทุกคน timeout และยังไม่มีการตอบกลับ
            if (!hasSettled && timeoutCount === allConnections.length) {
              hasSettled = true;
              reject(
                new Error(
                  `Request (route: ${route}) timed out for all clients after ${timeout}ms.`
                )
              );
            }
          }, timeout);

          pendingRequests.set(requestId, {
            resolve: (value: any) => {
              // ถ้ายังไม่มีการตอบกลับ ให้ resolve ด้วยค่าแรกที่ได้รับ
              if (!hasSettled) {
                hasSettled = true;
                cleanup(); // เคลียร์ request ที่เหลือทั้งหมด
                resolve(value);
              }
            },
            reject: (reason?: any) => {
              // เราจะเมินการ reject ของ client แต่ละคนไปก่อน
              // และจะรอจนกว่าจะมีคนตอบกลับสำเร็จ หรือ timeout ทั้งหมด
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
    }

    // กรณีระบุ clientId: โค้ดเดิมสำหรับส่งหา client คนเดียว
    return new Promise<T>((resolve, reject) => {
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
  },
}));
