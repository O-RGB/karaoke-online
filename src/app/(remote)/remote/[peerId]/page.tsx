"use client";
import JoinConnect from "@/components/remote/join";
import React from "react";

interface RemoteProps {
  params: {
    peerId: string;
  };
}

const Remote: React.FC<RemoteProps> = ({ params }) => {
  const peerId = params.peerId;
  return (
    <>
      <JoinConnect hostId={peerId}></JoinConnect>
    </>
  );
};

export default Remote;
