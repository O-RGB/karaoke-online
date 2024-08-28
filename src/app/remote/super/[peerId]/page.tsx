"use client";
import JoinConnect from "@/components/remote/join-connect";
import SuperJoinConnect from "@/components/remote/super-commect";
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
      <SuperJoinConnect hostId={peerId}></SuperJoinConnect>
    </>
  );
};

export default Remote;
