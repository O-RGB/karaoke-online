"use client";

import { createContext, FC, useRef, useState } from "react";

type RemoteContextType = {
  connect: boolean | undefined;
  myKey: string[] | undefined;
  answer: string | undefined;
  startConnection: (isHost: boolean) => Promise<void>;
  connection: (isHost: boolean, value?: string[]) => Promise<void>;
  send: (text: string) => void;
};

type RemoteProviderProps = {
  children: React.ReactNode;
};

export const RemoteContext = createContext<RemoteContextType>({
  connect: undefined,
  myKey: undefined,
  answer: undefined,
  startConnection: async () => undefined,
  connection: async () => undefined,
  send: () => {},
});

export const RemoteProvider: FC<RemoteProviderProps> = ({ children }) => {
  // RESULT
  const [connect, setConnect] = useState<boolean>(false);

  // KEY
  const [myKey, setMyKey] = useState<string[]>([]);
  const [answer, setAnswer] = useState<string>();

  // ROLES
  //   const [isHost, setIsHost] = useState<boolean>(true);

  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const dataChannel = useRef<RTCDataChannel | null>(null);

  //   const setUserRoles = (isHost: boolean) => () => {
  //     setIsHost(isHost);
  //   };

  const startConnection = async (isHost: boolean = true) => {
    peerConnection.current = new RTCPeerConnection();

    if (isHost === true) {
      // Host creates the data channel
      dataChannel.current = peerConnection.current.createDataChannel("color");
      dataChannel.current.onopen = () => console.log("Data channel opened");
      dataChannel.current.onmessage = (event) => {
        const newColor = event.data;

        console.log(event);
        // setColor(newColor); // Change the background color
      };

      peerConnection.current.onicecandidate = async (event) => {
        if (event.candidate) {
          const candidate = JSON.stringify(event.candidate);
          setMyKey((prev) => [...prev, candidate]);
        }
      };
      const offer = await peerConnection.current.createOffer();
      await peerConnection.current.setLocalDescription(offer);

      setMyKey([JSON.stringify(offer)]);
    } else if (isHost === false) {
      // Joiner waits for the data channel to be created
      peerConnection.current.ondatachannel = (event) => {
        dataChannel.current = event.channel;
        dataChannel.current.onopen = () => console.log("Data channel opened");
        dataChannel.current.onmessage = (event) => {
          const newColor = event.data;
          //   setColor(newColor); // Change the background color
        };
      };
      //   peerConnection.current.onicecandidate = (event) => {
      //     if (event.candidate) {
      //       const candidate = JSON.stringify(event.candidate);
      //       setJoinKey((prev) => prev + candidate + ",");
      //     }
      //   };
    }
  };

  const connection = async (isHost: boolean, value?: string[]) => {
    if (!peerConnection.current || !value) return;

    console.log(value);

    const offer = JSON.parse(value[0]);

    await peerConnection.current.setRemoteDescription(
      new RTCSessionDescription(offer)
    );
    if (!isHost) {
      const ca = JSON.parse(value[1]);

      const candidate = new RTCIceCandidate(ca);
      await peerConnection.current.addIceCandidate(candidate);
    }

    if (!isHost) {
      const answer = await peerConnection.current.createAnswer();
      await peerConnection.current.setLocalDescription(answer);
      setAnswer(JSON.stringify(answer));
    }
  };

  const send = (newColor: string) => {
    if (dataChannel.current && dataChannel.current.readyState === "open") {
      dataChannel.current.send(newColor);
    }
  };

  return (
    <RemoteContext.Provider
      value={{
        connect: connect,
        answer: answer,
        myKey: myKey,
        startConnection: startConnection,
        connection: connection,
        send: send,
      }}
    >
      <>{children}</>
    </RemoteContext.Provider>
  );
};
