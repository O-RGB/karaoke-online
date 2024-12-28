// import { create } from "zustand";
// import Peer, { DataConnection } from "peerjs";
// import {
//   RemoteReceivedMessages,
//   RemoteSendMessage,
// } from "./remote/types/remote.type";

// interface PeerState {
//   normalPeer: Peer | null;
//   superUserPeer: Peer | null;
//   connections: DataConnection[];
//   superUserConnections: DataConnection[];
//   received?: RemoteReceivedMessages;
//   connectToPeer: (peerId: string, isSuperUser: boolean) => void;
//   sendMessage: (info: RemoteSendMessage) => void;
//   sendSuperUserMessage: (info: RemoteSendMessage) => void;
//   initializePeers: (isSuperUser?: boolean) => void;
// }

// export const usePeerStore = create<PeerState>((set, get) => ({
//   normalPeer: null,
//   superUserPeer: null,
//   connections: [],
//   superUserConnections: [],
//   received: undefined,

//   connectToPeer: (peerId: string, isSuperUser: boolean) => {
//     const { normalPeer, superUserPeer } = get();
//     const peer = isSuperUser ? superUserPeer : normalPeer;
//     const peerType = isSuperUser ? "superUserPeer" : "normalPeer";

//     // console.log(`Attempting to connect to ${peerId} using ${peerType}.`);

//     if (!peer || !peer.open) {
//       console.error(
//         `${peerType} is not open yet. Cannot connect to ${peerId}.`
//       );
//       return;
//     }

//     const conn = peer.connect(peerId);

//     conn.on("open", () => {
//       // console.log(`Connection established with ${peerId} on ${peerType}.`);
//       conn.send(`Hello from ${peer.id}`);
//     });

//     conn.on("data", (data: any) => {
//       // console.log(`Received data from ${peerId} on ${peerType}:`, data);
//       set({
//         received: {
//           from: conn.peer,
//           content: data,
//           user: isSuperUser ? "SUPER" : "NORMAL",
//         },
//       });
//     });

//     conn.on("close", () => {
//       // console.log(`Connection closed with ${peerId} on ${peerType}.`);
//       set((state) => ({
//         [isSuperUser ? "superUserConnections" : "connections"]: state[
//           isSuperUser ? "superUserConnections" : "connections"
//         ].filter((c) => c !== conn),
//       }));
//     });

//     conn.on("error", (error) => {
//       console.error(
//         `Error in connection with ${peerId} on ${peerType}:`,
//         error
//       );
//     });

//     set((state) => ({
//       [isSuperUser ? "superUserConnections" : "connections"]: [
//         ...state[isSuperUser ? "superUserConnections" : "connections"],
//         conn,
//       ],
//     }));

//     setupConnectionTimeout(conn, isSuperUser, set);
//   },

//   sendMessage: (info: RemoteSendMessage) => {
//     const { connections, superUserConnections } = get();

//     if (info.clientId) {
//       const userConnections =
//         info.user === "NORMAL" ? connections : superUserConnections;
//       const connection = userConnections.find(
//         (conn) => conn.peer === info.clientId
//       );

//       if (connection) {
//         if (connection.open) {
//           connection.send(info);
//         } else {
//           console.warn(
//             `Connection to ${connection.peer} is not open yet. Waiting for open event.`
//           );
//           connection.on("open", () => {
//             connection.send(info);
//             console.log(
//               `Message sent to ${connection.peer} after connection opened`
//             );
//           });
//         }
//       }
//     } else {
//       connections.forEach((conn) => {
//         if (conn.open) {
//           conn.send(info);
//         } else {
//           console.warn(
//             `Connection to ${conn.peer} is not open yet. Waiting for open event.`
//           );
//           conn.on("open", () => {
//             conn.send(info);
//             console.log(`Message sent to ${conn.peer} after connection opened`);
//           });
//         }
//       });
//     }
//   },

//   sendSuperUserMessage: (info: RemoteSendMessage) => {
//     const { superUserConnections } = get();
//     console.log(
//       `Sending message to all superUserPeer connections:`,
//       info.message,
//       `with type:`,
//       info
//     );
//     superUserConnections.forEach((conn) => {
//       // ตรวจสอบสถานะ connection ก่อนส่งข้อมูล
//       if (conn.open) {
//         conn.send(info);
//       } else {
//         console.warn(
//           `Connection to ${conn.peer} is not open yet. Waiting for open event.`
//         );

//         // รอให้ connection เปิดก่อนแล้วค่อยส่งข้อมูล
//         conn.on("open", () => {
//           conn.send(info);
//           console.log(`Message sent to ${conn.peer} after connection opened`);
//         });
//       }
//     });
//   },

//   initializePeers: (isSuperUser?: boolean) => {
//     // console.log("Initializing peers...");

//     if (isSuperUser === false || isSuperUser == undefined) {
//       const newPeer = new Peer();
//       // console.log("Created new normalPeer with temporary ID:", newPeer.id);

//       newPeer.on("open", (id) => {
//         // console.log("normalPeer connection opened with ID:", id);
//         set({ normalPeer: newPeer });

//         newPeer.on("connection", (conn) => {
//           // console.log("normalPeer received new connection from:", conn.peer);
//           set((state) => ({ connections: [...state.connections, conn] }));

//           // const { addNotification } = useNotification();
//           // addNotification("มีการเชื่อมต่อ", <RiRemoteControlFill />);

//           conn.on("data", (data: any) => {
//             // console.log(`normalPeer received data from ${conn.peer}:`, data);
//             set({
//               received: { from: conn.peer, content: data, user: "NORMAL" },
//             });
//           });

//           setupConnectionEvents(conn, false, set);
//         });
//       });
//     }
//     if (isSuperUser === true || isSuperUser == undefined) {
//       const newSuperUserPeer = new Peer();
//       // console.log(
//       //   "Created new superUserPeer with temporary ID:",
//       //   newSuperUserPeer.id
//       // );

//       newSuperUserPeer.on("open", (id) => {
//         // console.log("superUserPeer connection opened with ID:", id);
//         set({ superUserPeer: newSuperUserPeer });

//         newSuperUserPeer.on("connection", (conn) => {
//           // console.log("superUserPeer received new connection from:", conn.peer);
//           set((state) => ({
//             superUserConnections: [...state.superUserConnections, conn],
//           }));

//           // const { addNotification } = useNotification();
//           // addNotification("มีการเชื่อมต่อ Admin", <RiRemoteControlFill />);

//           conn.on("data", (data: any) => {
//             // console.log(`superUserPeer received data from ${conn.peer}:`, data);
//             set({
//               received: { from: conn.peer, content: data, user: "SUPER" },
//             });
//           });

//           setupConnectionEvents(conn, true, set);
//         });
//       });
//     }
//   },
// }));

// function setupConnectionEvents(
//   conn: DataConnection,
//   isSuperUser: boolean,
//   set: (
//     partial: Partial<PeerState> | ((state: PeerState) => Partial<PeerState>)
//   ) => void
// ) {
//   const peerType = isSuperUser ? "superUserPeer" : "normalPeer";

//   conn.on("open", () => {
//     // console.log(`Connection opened with ${conn.peer} on ${peerType}.`);
//   });

//   conn.on("close", () => {
//     // console.log(`Connection closed with ${conn.peer} on ${peerType}.`);
//     set((state) => ({
//       [isSuperUser ? "superUserConnections" : "connections"]: state[
//         isSuperUser ? "superUserConnections" : "connections"
//       ].filter((c) => c !== conn),
//     }));
//   });

//   conn.on("error", (error) => {
//     console.error(
//       `Error in connection with ${conn.peer} on ${peerType}:`,
//       error
//     );
//   });

//   setupConnectionTimeout(conn, isSuperUser, set);
// }

// function setupConnectionTimeout(
//   conn: DataConnection,
//   isSuperUser: boolean,
//   set: (
//     partial: Partial<PeerState> | ((state: PeerState) => Partial<PeerState>)
//   ) => void
// ) {
//   const peerType = isSuperUser ? "superUserPeer" : "normalPeer";
//   const timeoutDuration = 300000; // 5 minutes timeout duration
//   // console.log(
//   //   `Setting up ${timeoutDuration / 1000}s timeout for connection with ${
//   //     conn.peer
//   //   } on ${peerType}.`
//   // );

//   let timeoutId: NodeJS.Timeout = setTimeout(() => {
//     console.warn(
//       `Connection with ${conn.peer} on ${peerType} timed out due to inactivity.`
//     );
//     conn.close();
//     set((state) => ({
//       [isSuperUser ? "superUserConnections" : "connections"]: state[
//         isSuperUser ? "superUserConnections" : "connections"
//       ].filter((c) => c !== conn),
//     }));
//   }, timeoutDuration);

//   conn.on("data", () => {
//     // console.log(
//     //   `Received data from ${conn.peer} on ${peerType}, resetting timeout.`
//     // );
//     clearTimeout(timeoutId);
//     timeoutId = setTimeout(() => {
//       console.warn(
//         `Connection with ${conn.peer} on ${peerType} timed out due to inactivity.`
//       );
//       conn.close();
//       set((state) => ({
//         [isSuperUser ? "superUserConnections" : "connections"]: state[
//           isSuperUser ? "superUserConnections" : "connections"
//         ].filter((c) => c !== conn),
//       }));
//     }, timeoutDuration);
//   });

//   conn.on("close", () => {
//     // console.log(
//     //   `Clearing timeout for ${conn.peer} on ${peerType} due to closure.`
//     // );
//     clearTimeout(timeoutId);
//   });

//   conn.on("error", (error) => {
//     console.error(
//       `Error on connection with ${conn.peer} on ${peerType}:`,
//       error
//     );
//     clearTimeout(timeoutId);
//   });
// }
