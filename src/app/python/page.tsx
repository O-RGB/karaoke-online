"use client";
import { NotificationProvider } from "@/components/modal/append-song/tabs/add-api/karaoke-api-system/common/notification-provider";
import Dashboard from "@/components/modal/append-song/tabs/add-api/karaoke-api-system/dashboard";
import ApiLoginRegister from "@/components/modal/append-song/tabs/add-api/karaoke-api-system/login";
import useConfigStore from "@/features/config/config-store";
import React from "react";

interface PythonAPIProps {}

const PythonAPI: React.FC<PythonAPIProps> = ({}) => {
  const token = useConfigStore((state) => state.config.token);
  return (
    <>
      <NotificationProvider>
        {!token ? (
          <ApiLoginRegister></ApiLoginRegister>
        ) : (
          <Dashboard></Dashboard>
        )}
      </NotificationProvider>
    </>
  );
};

export default PythonAPI;
